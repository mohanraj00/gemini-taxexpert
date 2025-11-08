
import { ChatMessage, TaxSituation, TaxSituationsResponse } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { taxSituationsSchema } from './schemas';

export const generateTaxSituations = async (chatHistory: ChatMessage[]): Promise<TaxSituationsResponse> => {
    const contents = chatHistoryToContents(chatHistory);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            systemInstruction: `You are Gemini TaxBro, a friendly and knowledgeable AI assistant for US tax research. Your tone should be warm, encouraging, and clear.
Based on the conversation history and the established key facts, your task is to spot the main tax situations we should look into.
- Review all the facts provided.
- Generate a list of distinct tax situations or issues.
- For each situation, provide a title and a brief description of its relevance.
- Just point out the topics for now; we'll dig into the details later.
- Return the list in the specified JSON format.`,
            responseMimeType: "application/json",
            responseSchema: taxSituationsSchema,
        },
    });
    const responseJson = response.text;
    return JSON.parse(responseJson) as TaxSituationsResponse;
};

export const researchSituation = async (chatHistory: ChatMessage[], situation: TaxSituation): Promise<string> => {
    const contents = chatHistoryToContents(chatHistory);
    // Add a new user message to focus the AI on the specific research task
    contents.push({
        role: 'user',
        parts: [{ text: `Now, please conduct in-depth research on the following tax situation: "${situation.title}".` }]
    });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            systemInstruction: `You are Gemini TaxBro, serving as an expert US tax researcher. Your task is to conduct a detailed investigation of a specific tax situation, drawing upon the full conversation history for context.
- Your response must be thorough, well-structured, and authoritative.
- **Cite Your Sources**: You MUST reference authoritative sources, including:
    - Internal Revenue Code (IRC) sections (e.g., IRC § 121).
    - Treasury Regulations (e.g., Treas. Reg. § 1.121-1).
    - Relevant court cases (e.g., *U.S. v. Golsen*, 54 T.C. 742 (1970)).
    - IRS publications and Revenue Rulings where applicable.
- **Structure Your Analysis**: Organize your findings logically. Start with the most relevant code section, explain its rules, and then apply them to the facts from the conversation. Discuss any nuances, exceptions, or important judicial interpretations.
- **Provide Clear Explanations**: Write in a clear, professional, yet approachable tone. Explain complex tax concepts in an understandable way.
- **Format**: Use Markdown for clear formatting (headings, lists, bold text).
- **Focus**: Your entire response should be dedicated to the single tax situation provided in the most recent user message. Do not discuss other situations unless they are directly related.`,
        },
    });
    return response.text;
};
