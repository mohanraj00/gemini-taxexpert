

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
            description: "An array of key tax situations identified from the facts. IMPORTANT: These situations must be ordered based on dependency. Foundational topics (e.g., 'Choice of Entity') must come before topics that depend on them.",
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

export const researchAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        situationTitle: {
            type: Type.STRING,
            description: "The title of the tax situation being analyzed."
        },
        summary: {
            type: Type.STRING,
            description: "A concise summary of the tax rules and their application to the current facts."
        },
        applicableLaw: {
            type: Type.ARRAY,
            description: "A list of authoritative sources like IRC sections, Treasury Regulations, or key court cases.",
            items: {
                type: Type.OBJECT,
                properties: {
                    citation: {
                        type: Type.STRING,
                        description: "The formal citation (e.g., 'IRC § 162', 'Treas. Reg. § 1.263(a)-1'). Should be as specific as possible (e.g., IRC § 121(b)(1))."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief explanation of what the cited law states."
                    }
                },
                required: ["citation", "description"]
            }
        },
        keyImplications: {
            type: Type.ARRAY,
            description: "A list of the most important consequences. For each, provide a justification from a secondary source if possible.",
            items: {
                type: Type.OBJECT,
                properties: {
                    implication: {
                        type: Type.STRING,
                        description: "The text of the key implication."
                    },
                    justification: {
                        type: Type.OBJECT,
                        description: "Optional: A brief justification citing a secondary source (e.g., an IRS Publication) that supports this interpretation.",
                        properties: {
                            text: {
                                type: Type.STRING,
                                description: "The name of the source (e.g., 'IRS Publication 523')."
                            },
                            url: {
                                type: Type.STRING,
                                description: "A valid, direct URL to the source if available online (e.g., 'https://www.irs.gov/publications/p523')."
                            }
                        },
                        required: ["text"]
                    }
                },
                required: ["implication"]
            }
        },
        planningOpportunities: {
            type: Type.ARRAY,
            description: "A list of potential strategies or actions the user could consider, based on the analysis. For each, provide a justification from a secondary source if possible.",
            items: {
                type: Type.OBJECT,
                properties: {
                    opportunity: {
                        type: Type.STRING,
                        description: "The text of the planning opportunity."
                    },
                    justification: {
                         type: Type.OBJECT,
                        description: "Optional: A brief justification citing a secondary source (e.g., an IRS Publication) that supports this interpretation.",
                        properties: {
                            text: {
                                type: Type.STRING,
                                description: "The name of the source (e.g., 'IRS Publication 523')."
                            },
                            url: {
                                type: Type.STRING,
                                description: "A valid, direct URL to the source if available online (e.g., 'https://www.irs.gov/publications/p523')."
                            }
                        },
                        required: ["text"]
                    }
                },
                required: ["opportunity"]
            }
        }
    },
    required: ["situationTitle", "summary", "applicableLaw", "keyImplications", "planningOpportunities"]
};

export const researchValidationSchema = {
    type: Type.OBJECT,
    properties: {
        isAuthoritative: {
            type: Type.BOOLEAN,
            description: "True if all cited sources in the 'applicableLaw' section are primary, authoritative sources (like IRC, Treas. Reg., Rev. Rul., or court cases). False if any sources are weak."
        },
        hasInDepthDescriptions: {
            type: Type.BOOLEAN,
            description: "True if the 'description' for each 'applicableLaw' citation provides a detailed, substantive explanation of the law's core mechanics and its specific relevance to the facts. False if any description is too brief or superficial."
        },
        areJustificationsValid: {
            type: Type.BOOLEAN,
            description: "True if all secondary source justifications in 'keyImplications' and 'planningOpportunities' are valid. A justification is valid if its 'text' accurately describes the source at its 'url' and the source is relevant."
        },
        feedback: {
            type: Type.STRING,
            description: "Provide specific, constructive feedback. If 'isAuthoritative' is false, explain which citations are weak. If 'hasInDepthDescriptions' is false, identify which descriptions are superficial and need more detail. If 'areJustificationsValid' is false, explain which justifications are problematic. If all are true, provide a brief confirmation."
        }
    },
    required: ["isAuthoritative", "hasInDepthDescriptions", "areJustificationsValid", "feedback"]
};

export const generatedDocumentSchema = {
    type: Type.OBJECT,
    properties: {
        content: {
            type: Type.STRING,
            description: "The full content of the document in Markdown format."
        }
    },
    required: ["content"]
};

const objectiveSchema: any = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A concise title for the objective (e.g., 'Maximize Section 121 Exclusion', 'Determine Optimal Filing Status')."
        },
        description: {
            type: Type.STRING,
            description: "A brief, one-sentence explanation of what this objective entails."
        },
        subObjectives: {
            type: Type.ARRAY,
            description: "A list of more granular, atomic sub-tasks related to this parent objective.",
            items: {}
        }
    },
    required: ["title", "description"]
};
objectiveSchema.properties.subObjectives.items = objectiveSchema; // Recursive definition

export const refinedObjectivesSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, encouraging summary. If returning objectives, confirm you've refined the user's goals. If asking questions, explain that you need a bit more clarity."
        },
        objectives: {
            type: Type.ARRAY,
            description: "A list of refined, synthesized objectives based on the user's input and the research context. This should be empty if asking clarifying questions.",
            items: objectiveSchema
        },
        clarifyingQuestions: {
            type: Type.ARRAY,
            description: "A list of questions to ask the user if their stated objectives are too vague or ambiguous. This should only be populated if you cannot create a clear, actionable list of objectives from their input.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["summary", "objectives"]
};

export const addResearchTopicTool: FunctionDeclaration = {
    name: "add_research_topic",
    description: "Adds a new research topic to the list of tax situations when the user explicitly asks to add or research a new, specific topic. This is for when a user wants to explore something not identified by the system.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: {
                type: Type.STRING,
                description: "The title of the new research topic to be added."
            }
        },
        required: ["topic"]
    }
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