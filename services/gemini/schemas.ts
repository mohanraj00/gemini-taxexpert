import { Type, FunctionDeclaration } from "@google/genai";

export const keyFactsSchema = {
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

export const taxSituationsSchema = {
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

export const listKeyFactsTool: FunctionDeclaration = {
    name: "list_key_facts",
    description: "Analyzes the entire conversation history to extract and list all key facts in a structured format. Use this when the user asks to see, list, show, or summarize the key facts again.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};

export const updateKeyFactsTool: FunctionDeclaration = {
    name: "update_key_facts",
    description: "Analyzes the latest user message to determine if it contains new factual information that alters or adds to the previously established tax scenario. Use this tool if the user provides new details, corrections, or attachments that require the key facts to be regenerated.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};

export const identifyTaxSituationsTool: FunctionDeclaration = {
    name: "identify_tax_situations",
    description: "Analyzes the conversation and key facts to identify and list the potential tax situations that need to be researched. Use this when the user asks to identify, analyze, or determine the tax situations.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};
