import { GoogleGenAI, Part, Content } from "@google/genai";
import { ChatMessage } from '../../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatHistoryToContents = (chatHistory: ChatMessage[]): Content[] => {
    return chatHistory.map(msg => {
        const parts: Part[] = [{ text: msg.text }];
        if (msg.filesData) {
            msg.filesData.forEach(fileData => {
                parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.data }});
            });
        }
        return { role: msg.role, parts };
    });
};
