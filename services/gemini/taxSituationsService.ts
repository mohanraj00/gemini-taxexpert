

import { ChatMessage, TaxSituationsResponse } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { taxSituationsSchema } from './schemas';
import { ModelNames } from '../../constants';

export const generateTaxSituations = async (chatHistory: ChatMessage[]): Promise<TaxSituationsResponse> => {
    const contents = chatHistoryToContents(chatHistory);

    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction: `You are Tax Inference, a friendly and knowledgeable AI assistant for US tax research. Your tone should be warm, encouraging, and clear.
Based on the conversation history and the established key facts, your task is to spot the main tax situations we should look into.
- Review all the facts provided.
- Generate a list of distinct tax situations or issues.
- **IMPORTANT**: Order the list based on logical dependency. For example, a foundational topic like 'Choice of Entity' must come before a topic that depends on it.
- For each situation, provide a title and a brief description of its relevance.
- Return the list in the specified JSON format.`,
            responseMimeType: "application/json",
            responseSchema: taxSituationsSchema,
        },
    });
    const responseJson = response.text;
    return JSON.parse(responseJson) as TaxSituationsResponse;
};
