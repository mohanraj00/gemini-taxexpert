
import { FunctionCall } from '@google/genai';
import { ChatMessage, TaxSituation } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { listKeyFactsTool, updateKeyFactsTool, identifyTaxSituationsTool, addResearchTopicTool } from './schemas';
import { regenerateKeyFacts } from './keyFactsService';
import { generateTaxSituations } from './taxSituationsService';
import { ModelNames } from '../../constants';

// Handler for listing or updating key facts
const handleListOrUpdateKeyFacts = async (chatHistory: ChatMessage[], functionCalls: FunctionCall[]): Promise<ChatMessage> => {
    const isUpdate = functionCalls.some(fc => fc.name === 'update_key_facts');
    const { keyFacts } = await regenerateKeyFacts(chatHistory);
    
    const summaryText = isUpdate
        ? "Got it! I've updated the key facts with your new info. Here's the latest:"
        : "You got it! Here's a quick summary of the key facts we've gathered:";

    return {
        role: 'model',
        text: summaryText,
        keyFacts: keyFacts,
        isKeyFactsUpdate: isUpdate,
    };
};

// Handler for identifying tax situations
const handleIdentifyTaxSituations = async (chatHistory: ChatMessage[]): Promise<ChatMessage> => {
    const { summary, taxSituations: rawSituations } = await generateTaxSituations(chatHistory);
    const taxSituations: TaxSituation[] = rawSituations.map(s => ({
        ...s,
        id: s.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    }));

    return {
        role: 'model',
        text: summary,
        taxSituations: taxSituations,
    };
};

// Handler for adding a new research topic
const handleAddResearchTopic = async (chatHistory: ChatMessage[], functionCalls: FunctionCall[]): Promise<ChatMessage> => {
    const topic = functionCalls[0].args?.topic as string;
    if (!topic) {
        return {
            role: 'model',
            text: "I see you want to add a new research topic, but I couldn't determine the topic from your message. Could you please clarify?",
        };
    }
    const newSituation: TaxSituation = {
        id: topic.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        title: topic,
        description: "A custom research topic added by the user.",
    };
    return {
        role: 'model',
        text: `Great, I've added "${topic}" to your list of research topics. Feel free to select it from the checklist when you're ready to dive in.`,
        newTaxSituation: newSituation,
    };
};

// Map tool names to their corresponding handler functions
const toolHandlers: { [key: string]: (chatHistory: ChatMessage[], functionCalls: FunctionCall[]) => Promise<ChatMessage> } = {
    'list_key_facts': handleListOrUpdateKeyFacts,
    'update_key_facts': handleListOrUpdateKeyFacts,
    'identify_tax_situations': handleIdentifyTaxSituations,
    'add_research_topic': handleAddResearchTopic,
};

export const getAiResponse = async (
  chatHistory: ChatMessage[]
): Promise<ChatMessage> => {
    
    const contents = chatHistoryToContents(chatHistory);
    
    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction: `You are Tax Inference, a friendly and knowledgeable AI assistant for US tax research. The user has provided a scenario, and you've already identified the key facts together. Now it's time to help them with their questions.
- Your tone should be warm, engaging, and helpful, like a reliable friend who's great at explaining complex topics simply. Keep it concise.
- **Detecting New Information**: If the user provides additional details, corrections, or new documents that update the scenario, you MUST use the "update_key_facts" tool to regenerate the key facts. Do not answer questions based on outdated information.
- **Identifying Tax Situations**: Once the key facts are established, if the user asks you to analyze, identify, or determine the tax situations, you MUST use the "identify_tax_situations" tool.
- **Adding Research Topics**: If the user wants to add or suggest a new research topic that wasn't automatically identified, you MUST use the "add_research_topic" tool to add it to their list.
- **Guardrail**: If the user asks a question that is not related to US tax, politely decline. For example: "My specialty is US tax research, so I can't help with other topics. But I'm all ears for your tax questions!"
- When providing explanations, cite relevant Internal Revenue Code (IRC) sections, Treasury Regulations, or landmark court cases where applicable to support your analysis.
- Do not provide financial, investment, or legal advice. Your scope is limited to explaining tax laws and their application to the scenarios provided by the user.
- If the user asks to see, list, or summarize the key facts again, you MUST use the "list_key_facts" tool.`,
            tools: [{ functionDeclarations: [listKeyFactsTool, updateKeyFactsTool, identifyTaxSituationsTool, addResearchTopicTool] }],
        },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
        // Find the first function call that has a registered handler
        const functionCall = functionCalls.find(fc => toolHandlers[fc.name]);
        if (functionCall) {
            const handler = toolHandlers[functionCall.name];
            // Pass all function calls to the handler, as some handlers might need to check for multiple calls (e.g., list vs. update)
            return await handler(chatHistory, functionCalls);
        }
    }

    // Default case: return a standard text response
    return { role: 'model', text: response.text };
};