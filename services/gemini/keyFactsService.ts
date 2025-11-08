
import { Part } from "@google/genai";
import { ChatMessage, KeyFactsResponse } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { keyFactsSchema } from './schemas';

export const regenerateKeyFacts = async (chatHistory: ChatMessage[]): Promise<KeyFactsResponse> => {
    const contents = chatHistoryToContents(chatHistory);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            systemInstruction: `You are an expert AI assistant specializing in US tax research. Your task is to re-analyze the entire conversation history provided.
- Digest all text and documents.
- Extract all key facts and organize them into logical categories based on the complete context.
- Do NOT perform any calculations or analysis. Simply extract the raw facts.
- Return the extracted facts in the specified JSON format.`,
            responseMimeType: "application/json",
            responseSchema: keyFactsSchema,
        },
    });
    const responseJson = response.text;
    return JSON.parse(responseJson) as KeyFactsResponse;
};

export const generateKeyFacts = async (
    scenario: string,
    files?: { mimeType: string, data: string }[]
): Promise<KeyFactsResponse> => {
    const parts: Part[] = [{ text: scenario }];
    if (files && files.length > 0) {
        files.forEach(file => {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data }});
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts }],
        config: {
            systemInstruction: `You are Gemini TaxBro, a friendly and knowledgeable AI assistant for US tax research. Your goal is to make tax research less intimidating and more approachable. Your tone should be warm, encouraging, and clear. Avoid jargon where possible.
Your first task is to analyze the user-provided scenario.
1.  **Assess Sufficiency**: First, determine if the user has provided enough information to extract meaningful key facts for a tax analysis.
2.  **Request More Information**: If the information is too vague or incomplete (e.g., "my friend sold a house"), you MUST respond with a JSON object that includes a 'summary' explaining that more details are needed, an empty 'keyFacts' array, and a 'clarifyingQuestions' array with specific questions to guide the user (e.g., "What was the sale price?", "How long did they own the home?").
3.  **Assess Relevance**: If sufficient information is provided, determine if the user's query is related to US tax law.
4.  **Handle Off-Topic Queries**: If the query is NOT related to US tax, your response MUST be a JSON object with a 'summary' field explaining your purpose and that you can only discuss US tax topics, and an empty 'keyFacts' array. For example: "I'm your go-to bro for US tax questions! It looks like this is a bit outside my wheelhouse. Could we stick to US tax topics?"
5.  **Handle On-Topic Queries**: If the query IS related to US tax and has sufficient detail, digest the text and any documents, extract all key facts into logical categories, and generate a warm, brief 'summary' that confirms you've understood the scenario and suggests moving on to analyze the tax situations.
6.  **Output Format**: Always return the response in the specified JSON format.`,
            responseMimeType: "application/json",
            responseSchema: keyFactsSchema,
        },
    });

    const responseJson = response.text;
    return JSON.parse(responseJson) as KeyFactsResponse;
}
