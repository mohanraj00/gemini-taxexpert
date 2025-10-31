
export type Phase =
  | 'WELCOME'
  | 'SITUATION_SUMMARY'
  | 'IMPLICATION_IDENTIFICATION'
  | 'RESEARCH'
  | 'CALCULATION'
  | 'MEMO_GENERATION'
  | 'LETTER_GENERATION';

export interface SituationSummary {
  executiveSummary: string;
  keyFacts: {
    category: string;
    details: string[];
  }[];
  identifiedIssues: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  fileData?: {
    mimeType: string;
    data: string;
  };
  // FIX: Use a discriminated union for structuredContent to allow TypeScript to correctly infer the type of `data` based on `type`.
  structuredContent?:
    | {
        type: 'RESEARCH';
        data: ResearchFinding;
      }
    | {
        type: 'SITUATION_SUMMARY';
        data: SituationSummary;
      };
  isHidden?: boolean;
  isSummary?: boolean; // Is this a main summary message vs. a conversational reply?
}

export interface ResearchFinding {
  implication: string;
  summary: string;
  primaryLaw: string;
  taxRulings: string;
  privateLetterRulings: string;
}

export interface CalculationResult {
  summary: string;
  details: string;
}

export interface GeneratedDocs {
  memo: string;
  letter: string;
}

export interface TaxImplication {
  issue: string;
}

export interface ResearchContent {
  title: string;
  content: string;
}

export interface ResearchResult {
  primaryLaw: ResearchContent;
  administrativeGuidance: ResearchContent;
  judicialPrecedent: ResearchContent;
  application: ResearchContent;
}