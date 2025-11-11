
import { ChatMessage, ResearchAnalysis, ObjectivesResponse, Objective } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { refinedObjectivesSchema } from './schemas';
import { ModelNames } from '../../constants';

export const refineUserObjectives = async (
    chatHistory: ChatMessage[], 
    analyses: { [key: string]: ResearchAnalysis },
    userObjectivesText: string
): Promise<ObjectivesResponse> => {
    const contents = chatHistoryToContents(chatHistory);
    contents.push({
        role: 'user',
        parts: [{ text: `All research is complete. Here are all the analyses:\n\n${JSON.stringify(analyses, null, 2)}\n\nHere are my primary objectives for this case:\n\n"${userObjectivesText}"` }]
    });

    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction: `You are Tax Inference, an expert AI assistant. All research is complete. The user has just stated their objectives for the case. Your task is to process their input, refine it into a clear and actionable list, and ask for clarification if needed.

1.  **Prioritize User Input**: The user's stated objectives are the most important source. Your final list must directly address their goals.
2.  **Synthesize & Refine**: Rephrase the user's goals into clear, concise objective statements suitable for a checklist. If the user provides a narrative, extract the core objectives.
3.  **Augment, Don't Replace**: Use the provided research analyses to identify any crucial related objectives the user might have missed. You can suggest these *in addition* to the user's refined goals, but only if they directly support the user's primary objectives.
4.  **Ask for Clarification**: If the user's objectives are ambiguous or too vague (e.g., "save money on taxes"), you MUST use the 'clarifyingQuestions' field to ask for more specific information. Do not proceed with vague objectives.
5.  **Format**: Return your response in the specified JSON format. If you have a clear list of objectives, return them in the 'objectives' field. If you need more information, return questions in the 'clarifyingQuestions' field and leave 'objectives' empty.`,
            responseMimeType: "application/json",
            responseSchema: refinedObjectivesSchema,
        },
    });
    const responseJson = response.text;
    const parsed = JSON.parse(responseJson) as ObjectivesResponse;

    const objectivesWithIds: Objective[] = parsed.objectives.map(o => ({
        ...o,
        id: o.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    }));
    
    return { ...parsed, objectives: objectivesWithIds };
};
