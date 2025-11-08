
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ChatMessage, KeyFactCategory, TaxSituation, KeyFactsResponse, TaxSituationsResponse } from '../types';
import { getAiResponse, generateKeyFacts, generateTaxSituations, researchSituation, regenerateKeyFacts } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove prefix "data:[mime_type];base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
};

interface AppContextType {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    currentAction: string | null;
    error: string | null;
    isChecklistOpen: boolean;
    researchedSituations: Set<string>;
    keyFactsGenerated: boolean;
    taxSituationsIdentified: boolean;
    allTaxSituations: TaxSituation[];
    latestKeyFacts: KeyFactCategory[] | undefined;
    sendMessage: (text: string, files?: File[]) => Promise<void>;
    analyzeTaxSituations: () => Promise<void>;
    reAnalyzeKeyFacts: () => Promise<void>;
    researchSituationHandler: (situation: TaxSituation) => Promise<void>;
    handleExportKeyFacts: () => void;
    handleExportTaxSituations: () => void;
    toggleChecklist: () => void;
    closeChecklist: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        {
            role: 'model',
            text: "Hey there! I'm Gemini TaxBro, your friendly guide to US tax research. Ready to dive in? Just tell me about your tax situation or upload any relevant documents to get started."
        }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
    const [researchedSituations, setResearchedSituations] = useState<Set<string>>(new Set());

    const handleApiCall = async (
        apiFunction: () => Promise<void>,
        errorMessage: string,
        actionName: string | null
    ) => {
        setIsLoading(true);
        setCurrentAction(actionName);
        setError(null);
        try {
            await apiFunction();
        } catch (err) {
            setError(errorMessage);
            setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
            console.error(err);
        } finally {
            setIsLoading(false);
            setCurrentAction(null);
        }
    };

    const sendMessage = async (text: string, files?: File[]) => {
        if (!text.trim() && (!files || files.length === 0)) {
            return;
        }
        setError(null);
        setIsLoading(true);

        let filesData;
        let userMessageText = text;

        if (files && files.length > 0) {
            try {
                const base64Promises = files.map(file => fileToBase64(file));
                const base64Results = await Promise.all(base64Promises);
                filesData = files.map((file, index) => ({
                    mimeType: file.type,
                    data: base64Results[index]
                }));
            } catch (err) {
                const errorMessage = "Whoops! I had some trouble with the file(s). Could you try uploading them again?";
                setError(errorMessage);
                setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
                console.error(err);
                setIsLoading(false);
                return;
            }
        }

        const isFirstUserMessage = chatHistory.filter(m => m.role === 'user').length === 0;
        
        if (isFirstUserMessage) {
          setCurrentAction('pull-facts');
        } else {
          setCurrentAction('chat');
        }

        if (isFirstUserMessage) {
            userMessageText = `Here is the tax scenario I need help with:\n\n${text}`;
            if (files && files.length > 0) {
                if (files.length === 1) {
                    userMessageText += `\n\nI have also attached a document for context: ${files[0].name}`;
                } else {
                    userMessageText += `\n\nI have also attached ${files.length} documents for context.`;
                }
            }
        }

        const userMessage: ChatMessage = { role: 'user', text: userMessageText, filesData };
        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory(updatedHistory);

        try {
            if (isFirstUserMessage) {
                const scenario = text;
                const { summary, keyFacts, clarifyingQuestions } = await generateKeyFacts(scenario, filesData);
                
                let aiText = summary;
                if (clarifyingQuestions && clarifyingQuestions.length > 0) {
                    aiText += "\n\nTo give you the best analysis, I need a little more information. Could you tell me about the following?\n\n" + clarifyingQuestions.map(q => `- ${q}`).join('\n');
                }
          
                const aiMessage: ChatMessage = { 
                    role: 'model', 
                    text: aiText,
                    keyFacts: keyFacts,
                };
                setChatHistory(prev => [...prev, aiMessage]);
            } else {
                const aiMessage = await getAiResponse(updatedHistory);
                setChatHistory(prev => [...prev, aiMessage]);
            }
        } catch (err) {
          const errorMessage = isFirstUserMessage 
            ? "Hmm, something went wrong while pulling out the key facts. Let's give it another shot."
            : "Looks like I'm having a little trouble connecting. Please check your connection and try again.";
          setError(errorMessage);
          setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
          console.error(err);
        } finally {
          setIsLoading(false);
          setCurrentAction(null);
        }
    };

    const analyzeTaxSituations = async () => {
        await handleApiCall(async () => {
            const { summary, taxSituations: rawSituations } = await generateTaxSituations(chatHistory);
            
            const taxSituations: TaxSituation[] = rawSituations.map(s => ({
                ...s,
                id: s.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
            }));

            const aiMessage: ChatMessage = {
                role: 'model',
                text: summary,
                taxSituations: taxSituations,
            };
            setChatHistory(prev => [...prev, aiMessage]);
        }, "I hit a snag analyzing the tax situations. Mind trying that again?", 'identify-situations');
    };

    const reAnalyzeKeyFacts = async () => {
        await handleApiCall(async () => {
            const { keyFacts } = await regenerateKeyFacts(chatHistory);
            
            const summaryText = "Alright, I've taken another look and refreshed the key facts based on our conversation so far. Here's the updated list:";

            const aiMessage: ChatMessage = {
                role: 'model',
                text: summaryText,
                keyFacts: keyFacts,
            };
            setChatHistory(prev => [...prev, aiMessage]);
        }, "I had a little trouble re-analyzing the key facts. Would you like to try that again?", 'pull-facts');
    };

    const researchSituationHandler = async (situation: TaxSituation) => {
        await handleApiCall(async () => {
            const analysis = await researchSituation(chatHistory, situation);

            const aiMessage: ChatMessage = {
                role: 'model',
                text: `Roger that! I've done a deep dive on **${situation.title}**. Here's what I found:`,
                researchAnalysis: {
                    situationTitle: situation.title,
                    content: analysis,
                },
            };
            setChatHistory(prev => [...prev, aiMessage]);
            setResearchedSituations(prev => new Set(prev).add(situation.id));
        }, `I ran into a little trouble researching "${situation.title}". Want to try again?`, `research-${situation.id}`);
    };

    const keyFactsGenerated = chatHistory.some(m => m.keyFacts && m.keyFacts.length > 0);
    const taxSituationsIdentified = chatHistory.some(m => m.taxSituations && m.taxSituations.length > 0);
    const allTaxSituations = chatHistory.flatMap(m => m.taxSituations || []);
    const latestKeyFacts = [...chatHistory].reverse().find(m => m.keyFacts && m.keyFacts.length > 0)?.keyFacts;

    const handleExportKeyFacts = () => {
        if (!latestKeyFacts) return;
        let content = "# Key Facts Summary\n\n";
        latestKeyFacts.forEach(category => {
            content += `## ${category.category}\n\n`;
            category.facts.forEach(fact => {
                content += `- **${fact.label}:** ${fact.value}\n`;
            });
            content += "\n";
        });

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'key-facts.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportTaxSituations = () => {
        if (!allTaxSituations || allTaxSituations.length === 0) return;
        let content = "# Potential Tax Situations\n\n";
        allTaxSituations.forEach(situation => {
            content += `- **${situation.title}:** ${situation.description}\n`;
        });

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tax-situations.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const toggleChecklist = () => setIsChecklistOpen(prev => !prev);
    const closeChecklist = () => setIsChecklistOpen(false);

    const value = {
        chatHistory,
        isLoading,
        currentAction,
        error,
        isChecklistOpen,
        researchedSituations,
        keyFactsGenerated,
        taxSituationsIdentified,
        allTaxSituations,
        latestKeyFacts,
        sendMessage,
        analyzeTaxSituations,
        reAnalyzeKeyFacts,
        researchSituationHandler,
        handleExportKeyFacts,
        handleExportTaxSituations,
        toggleChecklist,
        closeChecklist,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
