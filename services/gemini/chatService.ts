
import { ChatMessage, KeyFactCategory, TaxSituation } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { listKeyFactsTool, updateKeyFactsTool, identifyTaxSituationsTool } from './schemas';
import { regenerateKeyFacts } from './keyFactsService';
import { generateTaxSituations } from './taxSituationsService';


export const getAiResponse = async (
  chatHistory: ChatMessage[]
): Promise<ChatMessage> => {
    
    const contents = chatHistoryToContents(chatHistory);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            systemInstruction: `You are Gemini TaxBro, a friendly and knowledgeable AI assistant for US tax research. The user has provided a scenario, and you've already identified the key facts together. Now it's time to help them with their questions.
- Your tone should be warm, engaging, and helpful, like a reliable friend who's great at explaining complex topics simply. Keep it concise.
- **Detecting New Information**: If the user provides additional details, corrections, or new documents that update the scenario, you MUST use the "update_key_facts" tool to regenerate the key facts. Do not answer questions based on outdated information.
- **Identifying Tax Situations**: Once the key facts are established, if the user asks you to analyze, identify, or determine the tax situations, you MUST use the "identify_tax_situations" tool.
- **Guardrail**: If the user asks a question that is not related to US tax, politely decline. For example: "My specialty is US tax research, so I can't help with other topics. But I'm all ears for your tax questions!"
- When providing explanations, cite relevant Internal Revenue Code (IRC) sections, Treasury Regulations, or landmark court cases where applicable to support your analysis.
- Do not provide financial, investment, or legal advice. Your scope is limited to explaining tax laws and their application to the scenarios provided by the user.
- If the user asks to see, list, or summarize the key facts again, you MUST use the "list_key_facts" tool.`,
            tools: [{ functionDeclarations: [listKeyFactsTool, updateKeyFactsTool, identifyTaxSituationsTool] }],
        },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
        if (functionCalls.some(fc => fc.name === 'list_key_facts' || fc.name === 'update_key_facts')) {
            // AI wants to list or update key facts. Let's re-generate them from the history.
            const isUpdate = functionCalls.some(fc => fc.name === 'update_key_facts');
    
            const { keyFacts } = await regenerateKeyFacts(chatHistory);
            
            const summaryText = isUpdate
                ? "Got it! I've updated the key facts with your new info. Here's the latest:"
                : "You got it! Here's a quick summary of the key facts we've gathered:";
    
            return {
                role: 'model',
                text: summaryText,
                keyFacts: keyFacts,
            };
        } else if (functionCalls.some(fc => fc.name === 'identify_tax_situations')) {
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
        }
    }

    // Default case: return a standard text response
    return { role: 'model', text: response.text };
};
