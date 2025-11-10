
export interface KeyFact {
  label: string;
  value: string | number;
}

export interface KeyFactCategory {
  category: string;
  facts: KeyFact[];
}

export interface TaxSituation {
  id: string;
  title: string;
  description: string;
}

export interface ResearchAnalysis {
  situationTitle: string;
  summary: string;
  applicableLaw: {
    citation: string;
    description: string;
  }[];
  keyImplications: {
    implication: string;
    justification?: {
      text: string;
      url?: string;
    };
  }[];
  planningOpportunities: {
    opportunity: string;
    justification?: {
      text: string;
      url?: string;
    };
  }[];
}

export interface GeneratedDocument {
  type: 'memo' | 'letter';
  title: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  filesData?: {
    mimeType: string;
    data: string;
  }[];
  keyFacts?: KeyFactCategory[];
  taxSituations?: TaxSituation[];
  researchAnalysis?: ResearchAnalysis;
  generatedDocument?: GeneratedDocument;
  isKeyFactsUpdate?: boolean;
  newTaxSituation?: TaxSituation;
}

export interface RawTaxSituation {
    title: string;
    description: string;
}

export interface KeyFactsResponse {
    summary: string;
    keyFacts: KeyFactCategory[];
    clarifyingQuestions?: string[];
}

export interface TaxSituationsResponse {
    summary: string;
    taxSituations: RawTaxSituation[];
}

export interface AppError {
  id: number;
  message: string;
}