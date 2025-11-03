
import { GoogleGenAI, Part, Content, Type, FunctionDeclaration } from "@google/genai";
import { ChatMessage, KeyFactCategory, TaxSituation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const keyFactsSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, warm summary. If on-topic, this confirms you've understood the scenario and suggests analyzing tax situations next. If off-topic, this politely explains you're focused on US tax topics and gently guides the user back."
        },
        keyFacts: {
            type: Type.ARRAY,
            description: "An array of categories, each containing a list of key facts. This should be empty for off-topic queries.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: {
                        type: Type.STRING,
                        description: "The name of the category (e.g., 'Client Information', 'Property Details', 'Transaction Timeline')."
                    },
                    facts: {
                        type: Type.ARRAY,
                        description: "A list of individual facts within this category.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: {
                                    type: Type.STRING,
                                    description: "The name of the fact (e.g., 'Filing Status', 'Sale Price')."
                                },
                                value: {
                                    type: Type.STRING,
                                    description: "The value of the fact (e.g., 'Married Filing Jointly', '$800,000')."
                                }
                            },
                            required: ["label", "value"]
                        }
                    }
                },
                required: ["category", "facts"]
            }
        },
        clarifyingQuestions: {
            type: Type.ARRAY,
            description: "A list of questions to ask the user if the initial scenario lacks sufficient detail to generate meaningful key facts. This should only be used if the provided information is too vague.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["summary", "keyFacts"]
};

const chatHistoryToContents = (chatHistory: ChatMessage[]): Content[] => {
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

export const generateKeyFacts = async (
    scenario: string,
    files?: { mimeType: string, data: string }[]
): Promise<string> => {
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

    return response.text;
}

const taxSituationsSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, friendly intro stating that you've spotted the key tax situations from the facts."
        },
        taxSituations: {
            type: Type.ARRAY,
            description: "An array of key tax situations identified from the facts that require further research.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A concise title for the tax situation (e.g., 'Section 121 Exclusion', 'Home Office Deduction')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief, one-sentence explanation of why this situation is relevant based on the provided facts."
                    }
                },
                required: ["title", "description"]
            }
        }
    },
    required: ["summary", "taxSituations"]
};

export const generateTaxSituations = async (chatHistory: ChatMessage[]): Promise<string> => {
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
    return response.text;
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

const listKeyFactsTool: FunctionDeclaration = {
    name: "list_key_facts",
    description: "Analyzes the entire conversation history to extract and list all key facts in a structured format. Use this when the user asks to see, list, show, or summarize the key facts again.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};

const updateKeyFactsTool: FunctionDeclaration = {
    name: "update_key_facts",
    description: "Analyzes the latest user message to determine if it contains new factual information that alters or adds to the previously established tax scenario. Use this tool if the user provides new details, corrections, or attachments that require the key facts to be regenerated.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};

const identifyTaxSituationsTool: FunctionDeclaration = {
    name: "identify_tax_situations",
    description: "Analyzes the conversation and key facts to identify and list the potential tax situations that need to be researched. Use this when the user asks to identify, analyze, or determine the tax situations.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};


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
    
            const regenResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: contents, // Use the same full history
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
    
            const { keyFacts } = JSON.parse(regenResponse.text) as { summary: string; keyFacts: KeyFactCategory[] };
            
            const summaryText = isUpdate
                ? "Got it! I've updated the key facts with your new info. Here's the latest:"
                : "You got it! Here's a quick summary of the key facts we've gathered:";
    
            return {
                role: 'model',
                text: summaryText,
                keyFacts: keyFacts,
            };
        } else if (functionCalls.some(fc => fc.name === 'identify_tax_situations')) {
            const responseJson = await generateTaxSituations(chatHistory);
            const { summary, taxSituations } = JSON.parse(responseJson) as { summary: string; taxSituations: TaxSituation[] };
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
