

import React, { createContext, useContext, ReactNode } from 'react';
import { ChatMessage, KeyFactCategory, TaxSituation, AppError, ResearchAnalysis, GeneratedDocument, Objective } from '../types';
import { useAppLogic } from '../hooks/useAppLogic';

export interface AppContextType {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    currentAction: string | null;
    currentActionTitle: string | null;
    currentActionSubStep: string | null;
    errors: AppError[];
    isChecklistOpen: boolean;
    researchAnalyses: { [key: string]: ResearchAnalysis };
    researchedSituations: Set<string>;
    cachedDocuments: { [situationId: string]: { memo?: GeneratedDocument; letter?: GeneratedDocument; } };
    keyFactsGenerated: boolean;
    taxSituationsIdentified: boolean;
    allTaxSituations: TaxSituation[];
    latestKeyFacts: KeyFactCategory[] | undefined;
    exportModalAnalysis: ResearchAnalysis | null;
    objectives: Objective[];
    completedObjectives: Set<string>;
    isAwaitingObjectives: boolean;
    sendMessage: (text: string, files?: File[]) => Promise<void>;
    analyzeTaxSituations: () => Promise<void>;
    reAnalyzeKeyFacts: () => Promise<void>;
    researchSituationHandler: (situation: TaxSituation) => Promise<void>;
    generateMemoHandler: (analysis: ResearchAnalysis) => Promise<void>;
    generateLetterHandler: (analysis: ResearchAnalysis) => Promise<void>;
    handleExportKeyFacts: () => void;
    handleExportTaxSituations: () => void;
    handleExportResearchAnalysis: (analysis: ResearchAnalysis) => void;
    handleExportGeneratedDocument: (document: GeneratedDocument) => void;
    toggleChecklist: () => void;
    closeChecklist: () => void;
    removeError: (id: number) => void;
    openExportModal: (analysis: ResearchAnalysis, situationId: string) => void;
    closeExportModal: () => void;
    toggleObjectiveCompletion: (objectiveId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const appLogic = useAppLogic();
    return <AppContext.Provider value={appLogic}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};