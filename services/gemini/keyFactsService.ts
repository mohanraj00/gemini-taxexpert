
import { Part } from "@google/genai";
import { ChatMessage, KeyFactsResponse } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { keyFactsSchema } from './schemas';
import { ModelNames } from '../../constants';

export const generateKeyFacts = async (scenario: string, filesData?: { mimeType: string; data: string }[]): Promise<KeyFactsResponse> => {
    const userParts: Part[] = [{ text: scenario }];
    if (filesData) {
        filesData.forEach(fileData => {
            userParts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.data }});
        });
    }

    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: [{ role: 'user', parts: userParts }],
        config: {
            systemInstruction: `You are an expert AI assistant specializing in US tax research. When presented with a tax scenario, your primary goal is to extract the key facts needed for a thorough analysis.
- Digest all text and documents provided.
- Identify and extract all crucial facts.
- Organize these facts into logical categories.
- Do NOT perform calculations or analysis; simply extract raw data.
- **Crucially, if the user describes a transaction that has already occurred but does not specify the tax year, you MUST ask for it in the 'clarifyingQuestions' field. This is vital for applying the correct tax law.**
- If the user's query is off-topic (not about US tax), politely decline and steer them back.
- Return your findings in the specified JSON format.`,
            responseMimeType: "application/json",
            responseSchema: keyFactsSchema,
        },
    });

    const responseJson = response.text;
    return JSON.parse(responseJson) as KeyFactsResponse;
};

export const regenerateKeyFacts = async (chatHistory: ChatMessage[]): Promise<KeyFactsResponse> => {
    const contents = chatHistoryToContents(chatHistory);
    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction: `You are an expert AI assistant specializing in US tax research. Your task is to re-analyze the entire conversation history provided.
- Digest all text and documents.
- Extract all key facts and organize them into logical categories based on the complete context.
- **Crucially, if the full history describes a past transaction but a tax year is still missing, you MUST ask for it in the 'clarifyingQuestions' field. This is vital for applying the correct tax law.**
- Do NOT perform any calculations or analysis. Simply extract the raw facts.
- Return the extracted facts in the specified JSON format.`,
            responseMimeType: "application/json",
            responseSchema: keyFactsSchema,
        },
    });
    const responseJson = response.text;
    return JSON.parse(responseJson) as KeyFactsResponse;
};
