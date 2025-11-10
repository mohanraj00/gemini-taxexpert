
import { ChatMessage, TaxSituation, TaxSituationsResponse, ResearchAnalysis } from '../../types';
import { ai, chatHistoryToContents } from './client';
import { taxSituationsSchema, researchAnalysisSchema, researchValidationSchema } from './schemas';
import { ModelNames } from '../../constants';

interface ResearchValidationResponse {
    isAuthoritative: boolean;
    hasInDepthDescriptions: boolean;
    areJustificationsValid: boolean;
    feedback: string;
}

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

export const validateResearchAnalysis = async (analysis: ResearchAnalysis): Promise<ResearchValidationResponse> => {
    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: [{ role: 'user', parts: [{ text: `Please validate the sources in the following research analysis JSON: ${JSON.stringify(analysis)}`}]}],
        config: {
            systemInstruction: `You are a senior partner at a top-tier tax law firm. Your role is to review research from junior associates with an exacting eye for quality. You have three main tasks:
1.  **Validate Primary Sources:** Review the \`applicableLaw\` section. Ensure all cited sources are primary and authoritative.
    - **Primary/Authoritative Sources (GOOD):** Internal Revenue Code (IRC), Treasury Regulations (Treas. Reg.), Revenue Rulings (Rev. Rul.), Revenue Procedures (Rev. Proc.), and significant court cases.
    - **Weak/Secondary Sources (BAD):** IRS Publications, IRS Form Instructions, articles, blogs. These do not belong in the 'applicableLaw' section.
2.  **Assess Description Depth:** Review the \`description\` for each \`applicableLaw\` citation. The description must not be a mere summary. It should offer a substantive explanation of the law's core principles and its specific application to the facts. A superficial description is a validation failure.
3.  **Validate Secondary Source Justifications:** Review the \`justification\` objects within the \`keyImplications\` and \`planningOpportunities\` sections. For each justification that has a URL:
    - **Verify the URL is valid and accessible.** The URL must lead to a live, public webpage and not result in a 404 error or a paywall.
    - **Check for relevance and accuracy.** The source should be from a reputable place (like the IRS website, a university, or a major tax publication).
    - **Verify the citation text.** The 'text' field (e.g., "IRS Publication 523") must accurately describe the content found at the 'url'. A mismatched name and link is a validation failure.
- **Your Task:** Perform all three validation checks on the provided JSON research analysis. Provide specific, actionable feedback if validation fails on any point. Return your findings in the requested JSON format.`,
            responseMimeType: "application/json",
            responseSchema: researchValidationSchema,
        },
    });
    const responseJson = response.text;
    return JSON.parse(responseJson) as ResearchValidationResponse;
};

export const researchSituation = async (
    chatHistory: ChatMessage[], 
    situation: TaxSituation,
    previousAnalyses: { [key: string]: ResearchAnalysis },
    feedback?: string
): Promise<ResearchAnalysis> => {
    const contents = chatHistoryToContents(chatHistory);
    
    let contextPrompt = `Now, please conduct in-depth research on the following tax situation: "${situation.title}".`;

    if (feedback) {
        contextPrompt += `\n\nYour previous analysis required revisions. Please generate a new analysis, carefully incorporating the following feedback to improve the quality and accuracy of your response.\n\n**Feedback:** "${feedback}"`;
    }

    if (Object.keys(previousAnalyses).length > 0) {
        contextPrompt += `\n\nFor additional context, here are the conclusions from previous research tasks. You should use these findings to inform your current analysis where relevant:\n\n${JSON.stringify(previousAnalyses, null, 2)}`;
    }

    contents.push({
        role: 'user',
        parts: [{ text: contextPrompt }]
    });

    const response = await ai.models.generateContent({
        model: ModelNames.GEMINI_PRO,
        contents: contents,
        config: {
            systemInstruction: `You are Tax Inference, serving as an expert US tax researcher. Your task is to conduct a detailed investigation of a specific tax situation, drawing upon the full conversation history and previously completed research for context.
- Your entire response MUST be a single, valid JSON object that conforms to the provided schema.
- **Cite Authoritative Sources**: You MUST reference authoritative sources in the 'applicableLaw' section.
    - **Be specific:** Cite with as much detail as possible (e.g., 'IRC § 121(b)(1)' instead of just 'IRC § 121').
    - **Prioritize authority:** Prioritize citing the Internal Revenue Code, Treasury Regulations, Revenue Rulings, Revenue Procedures, or key court cases. Do not cite non-authoritative secondary sources like IRS Publications or general articles in this section.
- **Provide In-Depth Legal Descriptions**: For each source in the 'applicableLaw' section, the 'description' field MUST provide a detailed, substantive explanation of the law's text and its direct relevance to the current tax situation. Go beyond a simple summary. Explain the core mechanics of the statute or regulation and how it applies to the facts at hand. For example, instead of just saying 'IRC § 162 allows for business expense deductions,' you should explain what constitutes an 'ordinary and necessary' expense under the statute and why the user's specific expenditures might qualify based on the facts provided in the conversation.
- **Justify Interpretations with Valid URLs**: For 'keyImplications' and 'planningOpportunities', provide justifications by citing secondary sources like IRS Publications or well-regarded tax treatises when appropriate. **Crucially, you MUST find and include a direct, valid, and publicly accessible URL to the source in the 'url' field if one is available online. Do not provide broken (404) links or links to paywalled content. Verify each URL before including it.** This provides critical, verifiable context for your interpretations.
- **Provide Clear Explanations**: Write in a clear, professional, yet approachable tone. Explain complex tax concepts in an understandable way within the JSON fields.
- **Focus**: Your entire analysis should be dedicated to the single tax situation provided in the most recent user message, but informed by the complete context.
- **Use Previous Research**: Leverage the provided summaries of previous research to ensure a cohesive and non-redundant analysis. If a previous conclusion directly impacts the current topic, reference it in your summary.`,
            responseMimeType: "application/json",
            responseSchema: researchAnalysisSchema,
        },
    });
    const responseJson = response.text;
    return JSON.parse(responseJson) as ResearchAnalysis;
};