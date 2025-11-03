
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  filesData?: {
    mimeType: string;
    data: string;
  }[];
  keyFacts?: KeyFactCategory[];
  taxSituations?: TaxSituation[];
  researchAnalysis?: {
    situationTitle: string;
    content: string;
  };
}
