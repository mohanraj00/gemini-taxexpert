
import { ChatMessage, ResearchAnalysis, ObjectivesResponse, Objective } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { refinedObjectivesSchema } from './schemas';
import { ModelNames } from '../../constants';

const addIdsRecursively = (objectives: any[]): Objective[] => {
    return objectives.map((o, index) => {
        const newObjective: Objective = {
            ...o,
            // Create a more stable ID based on title and index
            id: (o.title?.toLowerCase() || 'objective').replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + `-${index}`,
            subObjectives: [],
        };
        if (o.subObjectives && o.subObjectives.length > 0) {
            newObjective.subObjectives = addIdsRecursively(o.subObjectives);
        }
        return newObjective;
    });
};

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
            systemInstruction: `You are Tax Inference, an expert AI assistant. All research is complete. The user has just stated their objectives. Your task is to process their input and refine it into a clear, actionable list of ATOMIC objectives.
1.  **Prioritize User Input**: The user's stated goals are the most important source.
2.  **Create Atomic Tasks**: Break down broad goals into the smallest possible, single-purpose tasks. For example, "minimize tax" should become separate objectives like "Evaluate eligibility for Section 121 Exclusion" and "Analyze potential for Home Office Deduction".
3.  **Use Sub-Objectives**: If several atomic tasks logically fall under a larger goal, group them. Use the parent objective to state the goal (e.g., "Minimize Taxable Gain on Home Sale") and list the atomic tasks as 'subObjectives'.
4.  **Augment, Don't Replace**: Use the provided research analyses to identify any crucial related objectives the user might have missed, adding them to the list where appropriate.
5.  **Ask for Clarification**: If the user's objectives are too vague (e.g., "save money"), you MUST use the 'clarifyingQuestions' field to ask for more specifics. Do not proceed with vague objectives.
6.  **Format**: Return your response in the specified JSON format. If you have clear objectives, use the 'objectives' field. If you need more information, use 'clarifyingQuestions' and leave 'objectives' empty.`,
            responseMimeType: "application/json",
            responseSchema: refinedObjectivesSchema,
        },
    });
    const responseJson = response.text;
    const parsed = JSON.parse(responseJson) as ObjectivesResponse;

    const objectivesWithIds: Objective[] = addIdsRecursively(parsed.objectives || []);
    
    return { ...parsed, objectives: objectivesWithIds };
};


export const evaluateObjective = async (
    chatHistory: ChatMessage[],
    analyses: { [key: string]: ResearchAnalysis },
    objective: Objective
): Promise<{ content: string }> => {
    const contents = chatHistoryToContents(chatHistory);
    const objectiveContext = `Title: ${objective.title}\nDescription: ${objective.description}`;
    
    contents.push({
        role: 'user',
        parts: [{ 
            text: `Based on all prior research and conversation, please provide a detailed analysis and recommendation for the following specific objective:\n\n${objectiveContext}\n\nHere is all the research conducted so far for context:\n\n${JSON.stringify(analyses, null, 2)}`
        }]
    });

    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction: `You are an expert tax advisor. Your task is to analyze a single, specific case objective based on the provided conversation history and research analyses.
- Your response must be in Markdown format.
- Focus exclusively on the objective provided in the user's prompt.
- Synthesize information from the full context (facts, prior research) to form a coherent, actionable recommendation.
- Structure your response clearly, likely with sections like **Analysis**, **Recommendations**, and **Next Steps**.
- Be concise and to the point. Do not repeat information unless it's essential for your analysis of this specific objective.`,
        },
    });

    return { content: response.text };
};