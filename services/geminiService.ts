
import { GoogleGenAI, Type, Part } from "@google/genai";
import { Phase, ChatMessage, ResearchFinding } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPromptForPhase = (
  phase: Phase,
  history: ChatMessage[],
  scenario: string,
  summary: string,
  implications: string[],
  findings: ResearchFinding[],
  currentResearchIndex: number,
  hasFile: boolean
): string => {
  const historyText = history.map(m => `${m.role.toUpperCase()}:\n${m.text}`).join('\n\n');

  switch (phase) {
    case 'SITUATION_SUMMARY':
      const intro = hasFile
        ? "You are a tax expert. Your first job is to digest and summarize the user's tax scenario based on the ATTACHED DOCUMENT and any accompanying text."
        : "You are a tax expert. Your first job is to digest and summarize the user's tax scenario based on the text provided.";
      return `${intro} Read the initial scenario and our conversation so far. Your goal is to analyze the information and provide a structured summary without performing any calculations or making final conclusions yet.
Structure your response as a JSON object with three keys: "executiveSummary", "keyFacts", and "identifiedIssues".
- "executiveSummary": A concise paragraph summarizing the core tax situation.
- "keyFacts": An array of objects, where each object has a "category" (e.g., "Client & Filing Information", "Property Sale Details") and a "details" array of strings, with each string being a key fact.
- "identifiedIssues": An array of strings, where each string is a distinct potential tax issue that needs to be researched in later phases (e.g., "Qualification for Section 121 Exclusion", "Tax treatment of adjoining parcel sale").
Do not calculate any tax liability or provide a final answer. Only return the JSON object.

Here is an example:
---
EXAMPLE SCENARIO:
My client, Jane Doe, sold her main home on June 15, 2024 for $950,000. She is single and has owned and lived in the home for the last 20 years. Her original purchase price was $200,000. She has never taken the Section 121 exclusion before.

EXAMPLE JSON OUTPUT:
{
  "executiveSummary": "Jane Doe, a single individual, sold her long-term primary residence for a significant gain. The key issue is to determine the taxable portion of the gain after applying the Section 121 exclusion for the sale of a principal residence.",
  "keyFacts": [
    { "category": "Client Information", "details": ["Client: Jane Doe", "Filing Status: Single"] },
    { "category": "Property Sale Details", "details": ["Property Type: Primary Residence", "Sale Date: June 15, 2024", "Sale Price: $950,000", "Original Purchase Price: $200,000", "Ownership/Use Period: 20 years"] },
    { "category": "Tax History", "details": ["Client has never previously used the Section 121 exclusion."] }
  ],
  "identifiedIssues": [ "Applicability and calculation of the Section 121 exclusion.", "Determination of the final taxable gain, if any." ]
}
---

Now, analyze the user's actual scenario below.

---
Initial Scenario Text:
${scenario}
---
Conversation History:
${historyText}
`;
    case 'IMPLICATION_IDENTIFICATION':
      return `Phase 2: Implication Identification.
Your task is to review the provided situation summary and identify a list of specific tax issues that require further research.
**Crucially, you must not perform any calculations or provide any analysis beyond identifying the issues.**
Your output should be a numbered list of the tax implications. After listing the implications, ask the user to confirm, add, or remove items.

For example:
1. Qualification for Section 121 Exclusion on the main residence.
2. Tax treatment of the gain from the sale of the adjoining parcel.
3. Determination of the correct cost basis for the inherited property.

---
Confirmed Summary:
${summary}
---
Conversation History:
${historyText}
`;
    case 'RESEARCH':
      const implicationToResearch = implications[currentResearchIndex];
      const pastFindings = findings.map(f => `Issue: ${f.implication}\nSummary: ${f.summary}\n`).join('\n');
      return `Phase 3: Research. We are researching the tax implication: "${implicationToResearch}". Perform a search for authoritative sources. Structure your response as a JSON object with the keys "summary", "primaryLaw", "taxRulings", and "privateLetterRulings". For each key, provide a summary of the findings and relevant citations (e.g., IRC sections, case names). Only return the JSON object.

---
Full Scenario Context:
${scenario}
---
Previously Confirmed Research:
${pastFindings}
---
Conversation History:
${historyText}
`;
    case 'CALCULATION':
        return `Phase 4: Tax Calculations. Based on all the confirmed research findings, perform the necessary tax calculations. Summarize the results clearly and explain how you arrived at them. Ask the user for confirmation.

---
Scenario:
${scenario}
---
Research Findings:
${findings.map(f => `- ${f.implication}: ${f.summary}`).join('\n')}
---
Conversation History:
${historyText}
`;
    case 'MEMO_GENERATION':
        return `Phase 5: Generate Tax Memo. Based on all previous confirmed information (facts, issues, research, calculations), generate a formal internal tax memorandum. The memo should be structured with sections for FACTS, ISSUES, APPLICABLE LAW & ANALYSIS, and CONCLUSION. Ensure the tone is technical and professional. After generating, ask the user for any desired edits.

---
Context:
Scenario: ${scenario}
Issues: ${implications.join(', ')}
Research: ${JSON.stringify(findings, null, 2)}
---
Conversation History:
${historyText}
`;
    case 'LETTER_GENERATION':
        return `Phase 6: Generate Client Letter. Based on all previous confirmed information, generate a client letter. The letter should be easy to understand, avoiding overly technical jargon. Summarize the conclusions and provide clear, actionable advice. After generating, ask the user for any final edits.

---
Context:
Scenario: ${scenario}
Issues: ${implications.join(', ')}
Research: ${JSON.stringify(findings, null, 2)}
---
Conversation History:
${historyText}
`;
    default:
      return `An unknown phase has been reached. Please assist the user. Current context: ${historyText}`;
  }
};

export const getAiResponse = async (
  phase: Phase,
  chatHistory: ChatMessage[],
  scenario: string,
  summary: string,
  implications: string[],
  findings: ResearchFinding[],
  currentResearchIndex: number,
  fileData?: { mimeType: string; data: string; }
): Promise<string> => {
  const prompt = buildPromptForPhase(
    phase, chatHistory, scenario, summary, implications, findings, currentResearchIndex, !!fileData
  );
  
  const contents: (Part | string)[] = [prompt];
  if(fileData){
      contents.push({
          inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.data
          }
      });
  }

  if (phase === 'SITUATION_SUMMARY') {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    executiveSummary: { type: Type.STRING },
                    keyFacts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                category: { type: Type.STRING },
                                details: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            required: ['category', 'details']
                        }
                    },
                    identifiedIssues: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['executiveSummary', 'keyFacts', 'identifiedIssues']
            }
        }
    });
    return response.text;
}

  if (phase === 'RESEARCH') {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: contents,
          config: {
              responseMimeType: 'application/json',
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      summary: {type: Type.STRING},
                      primaryLaw: {type: Type.STRING},
                      taxRulings: {type: Type.STRING},
                      privateLetterRulings: {type: Type.STRING},
                  },
                  required: ['summary', 'primaryLaw', 'taxRulings', 'privateLetterRulings']
              }
          }
      });
      return response.text;
  }

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
  });

  return response.text;
};