
import { ChatMessage, ResearchAnalysis } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { generatedDocumentSchema } from './schemas';
import { ModelNames } from '../../constants';

interface DocumentContent {
    content: string;
}

const generateDocument = async (
    chatHistory: ChatMessage[],
    analysis: ResearchAnalysis,
    systemInstruction: string
): Promise<DocumentContent> => {
    const contents = chatHistoryToContents(chatHistory);
    contents.push({
        role: 'user',
        parts: [{ text: `Here is the research analysis to use for generating the document:\n\n${JSON.stringify(analysis, null, 2)}` }]
    });

    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: generatedDocumentSchema,
        },
    });

    const responseJson = response.text;
    return JSON.parse(responseJson) as DocumentContent;
};

export const generateTaxMemo = (chatHistory: ChatMessage[], analysis: ResearchAnalysis): Promise<DocumentContent> => {
    const systemInstruction = `You are an expert tax professional. Your task is to convert the provided research analysis into a formal internal tax memorandum.
- The memo must be structured with the following sections in Markdown format: **Facts**, **Issue(s)**, **Applicable Law**, **Analysis**, and **Conclusion**.
- Use the provided chat history for context on the facts. The user message history contains the most accurate facts.
- The tone should be professional, objective, and thorough.
- The output MUST be a single JSON object with one key, "content", containing the full Markdown text of the memo.`;
    return generateDocument(chatHistory, analysis, systemInstruction);
};

export const generateClientLetter = (chatHistory: ChatMessage[], analysis: ResearchAnalysis): Promise<DocumentContent> => {
    const systemInstruction = `You are an expert tax professional with excellent client communication skills. Your task is to convert the provided research analysis into a clear, concise, and easy-to-understand letter for a client.
- Avoid overly technical jargon.
- Start with a friendly, professional opening.
- Explain the situation and its implications simply.
- Outline any actions they need to take or planning opportunities available.
- End with a professional closing, inviting them to ask further questions.
- Use the provided chat history for context on the facts and client details.
- The output MUST be a single JSON object with one key, "content", containing the full Markdown text of the letter.`;
    return generateDocument(chatHistory, analysis, systemInstruction);
};