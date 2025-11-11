

import { useState, useMemo } from 'react';
import { ChatMessage, KeyFactCategory, TaxSituation, AppError, ResearchAnalysis, GeneratedDocument, Objective } from '../types';
import { getAiResponse, generateKeyFacts, generateTaxSituations, researchSituation, regenerateKeyFacts, generateTaxMemo, generateClientLetter, validateResearchAnalysis, refineUserObjectives } from '../services/geminiService';
import { ActionNames } from '../constants';
import { fileToBase64 } from '../utils/fileUtils';
import { AppContextType } from '../contexts/AppContext';

interface CachedDocuments {
    memo?: GeneratedDocument;
    letter?: GeneratedDocument;
}

export const useAppLogic = (): AppContextType => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [currentActionTitle, setCurrentActionTitle] = useState<string | null>(null);
    const [currentActionSubStep, setCurrentActionSubStep] = useState<string | null>(null);
    const [errors, setErrors] = useState<AppError[]>([]);
    const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
    const [researchAnalyses, setResearchAnalyses] = useState<{ [key: string]: ResearchAnalysis }>({});
    const [cachedDocuments, setCachedDocuments] = useState<{ [situationId: string]: CachedDocuments }>({});
    const [exportModalAnalysis, setExportModalAnalysis] = useState<ResearchAnalysis | null>(null);
    const [exportModalSituationId, setExportModalSituationId] = useState<string | null>(null);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(new Set());
    const [isAwaitingObjectives, setIsAwaitingObjectives] = useState<boolean>(false);

    const openExportModal = (analysis: ResearchAnalysis, situationId: string) => {
        setExportModalAnalysis(analysis);
        setExportModalSituationId(situationId);
    };
    const closeExportModal = () => {
        setExportModalAnalysis(null);
        setExportModalSituationId(null);
    };

    const addError = (message: string) => {
        const newError: AppError = { id: Date.now(), message };
        setErrors(prev => [...prev, newError]);
    };

    const removeError = (id: number) => {
        setErrors(prev => prev.filter(error => error.id !== id));
    };

    const handleApiCall = async (
        apiFunction: () => Promise<void>,
        errorMessage: string,
        actionName: string | null,
        actionTitle?: string
    ) => {
        setIsLoading(true);
        setCurrentAction(actionName);
        if(actionTitle) setCurrentActionTitle(actionTitle);
        try {
            await apiFunction();
        } catch (err) {
            const detail = err instanceof Error ? err.message : "An unexpected error occurred.";
            const fullMessage = `${errorMessage} (Details: ${detail})`;
            addError(fullMessage);
            setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
            console.error(err);
        } finally {
            setIsLoading(false);
            setCurrentAction(null);
            setCurrentActionTitle(null);
            setCurrentActionSubStep(null);
        }
    };

    const handleObjectivesSubmission = async (userObjectivesText: string) => {
        await handleApiCall(async () => {
            const userMessage: ChatMessage = { role: 'user', text: userObjectivesText };
            setChatHistory(prev => [...prev, userMessage]);

            const historyForApi = [...chatHistory, userMessage];
            
            const { summary, objectives: newObjectives, clarifyingQuestions } = await refineUserObjectives(historyForApi, researchAnalyses, userObjectivesText);

            if (clarifyingQuestions && clarifyingQuestions.length > 0) {
                const clarificationMessage: ChatMessage = {
                    role: 'model',
                    text: summary + "\n\nTo make sure I understand correctly, could you clarify a few things?\n\n" + clarifyingQuestions.map(q => `- ${q}`).join('\n')
                };
                setChatHistory(prev => [...prev, clarificationMessage]);
            } else {
                const objectivesMessage: ChatMessage = {
                    role: 'model',
                    text: summary,
                    objectives: newObjectives,
                };
                setChatHistory(prev => [...prev, objectivesMessage]);
                setObjectives(newObjectives);
                setIsAwaitingObjectives(false);
            }
        }, "I had some trouble refining your objectives. Could you please state them again?", ActionNames.REFINE_OBJECTIVES);
    };

    const sendMessage = async (text: string, files?: File[]) => {
        if (isAwaitingObjectives) {
            await handleObjectivesSubmission(text);
            return;
        }

        if (!text.trim() && (!files || files.length === 0)) {
            return;
        }
        setIsLoading(true);

        let filesData;
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
                addError(errorMessage);
                setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
                console.error(err);
                setIsLoading(false);
                return;
            }
        }

        const isFirstUserMessage = chatHistory.filter(m => m.role === 'user').length === 0;
        
        let userMessageText = text;
        if (isFirstUserMessage) {
            userMessageText = `Here is the tax scenario I need help with:\n\n${text}`;
            if (files && files.length > 0) {
                userMessageText += `\n\nI have also attached ${files.length} document${files.length > 1 ? 's' : ''} for context.`;
            }
        }

        let textForApi = text;
        if (!isFirstUserMessage && filesData) {
            textForApi = `The user has provided new information and attached ${files.length} file(s). Please use the 'update_key_facts' tool to re-evaluate the scenario. User's message: "${text}"`;
        }
        
        const userMessage: ChatMessage = { role: 'user', text: userMessageText, filesData };
        const userMessageForApi = { ...userMessage, text: textForApi };
        
        const historyForApi = [...chatHistory, userMessageForApi];
        setChatHistory(prev => [...prev, userMessage]);

        try {
            if (isFirstUserMessage) {
                setCurrentAction(ActionNames.PULL_FACTS);
                const { summary, keyFacts, clarifyingQuestions } = await generateKeyFacts(text, filesData);
                
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
                setCurrentAction(ActionNames.CHAT);
                const aiMessage = await getAiResponse(historyForApi);
                
                if (aiMessage.isKeyFactsUpdate) {
                    setResearchAnalyses({});
                    setCachedDocuments({});
                    setObjectives([]);
                    setCompletedObjectives(new Set());
                    setChatHistory(prev => {
                        const clearedHistory = prev.map(msg => {
                            const { taxSituations, researchAnalysis, ...rest } = msg;
                            return rest;
                        });
                        return [...clearedHistory, aiMessage];
                    });
                } else if (aiMessage.newTaxSituation) {
                    const newSituation = aiMessage.newTaxSituation;
                    const { newTaxSituation: _, ...textMessage } = aiMessage;

                    setChatHistory(prev => {
                        const historyWithText = [...prev, textMessage];
                        const lastSituationsIndex = historyWithText.map(m => !!m.taxSituations).lastIndexOf(true);
                        
                        if (lastSituationsIndex > -1) {
                            const messageToUpdate = historyWithText[lastSituationsIndex];
                            const situationExists = messageToUpdate.taxSituations!.some(s => s.id === newSituation.id);
                            if (!situationExists) {
                                const updatedMessage = {
                                    ...messageToUpdate,
                                    taxSituations: [...messageToUpdate.taxSituations!, newSituation]
                                };
                                return [
                                    ...historyWithText.slice(0, lastSituationsIndex), 
                                    updatedMessage, 
                                    ...historyWithText.slice(lastSituationsIndex + 1)
                                ];
                            }
                        }
                        return historyWithText;
                    });
                } else {
                    setChatHistory(prev => [...prev, aiMessage]);
                }
            }
        } catch (err) {
          const errorMessage = isFirstUserMessage 
            ? "Hmm, something went wrong while pulling out the key facts. Let's give it another shot."
            : "Looks like I'm having a little trouble connecting. Please check your connection and try again.";
          addError(errorMessage);
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
        }, "I hit a snag analyzing the tax situations. Mind trying that again?", ActionNames.IDENTIFY_SITUATIONS);
    };

    const reAnalyzeKeyFacts = async () => {
        await handleApiCall(async () => {
            setResearchAnalyses({});
            setCachedDocuments({});
            setObjectives([]);
            setCompletedObjectives(new Set());
            const { keyFacts } = await regenerateKeyFacts(chatHistory);
            
            const summaryText = "Alright, I've taken another look and refreshed the key facts based on our conversation so far. Here's the updated list:";

            const aiMessage: ChatMessage = {
                role: 'model',
                text: summaryText,
                keyFacts: keyFacts,
            };
            setChatHistory(prev => [...prev, aiMessage]);
        }, "I had a little trouble re-analyzing the key facts. Would you like to try that again?", ActionNames.PULL_FACTS);
    };

    const researchSituationHandler = async (situation: TaxSituation) => {
        if (researchedSituations.has(situation.id)) {
            setCachedDocuments(prev => {
                const newCache = {...prev};
                delete newCache[situation.id];
                return newCache;
            });
        }
    
        await handleApiCall(async () => {
            const MAX_ATTEMPTS = 3;
            let lastAnalysis: ResearchAnalysis | null = null;
            let feedback: string | undefined = undefined;
            let validationPassed = false;
    
            for (let i = 0; i < MAX_ATTEMPTS; i++) {
                setCurrentActionSubStep(`Attempt ${i + 1}/${MAX_ATTEMPTS}: Researching topic...`);
                const analysis = await researchSituation(chatHistory, situation, researchAnalyses, feedback);
                lastAnalysis = analysis;
    
                setCurrentActionSubStep(`Attempt ${i + 1}/${MAX_ATTEMPTS}: Validating sources...`);
                const validation = await validateResearchAnalysis(analysis);
    
                if (validation.isAuthoritative && validation.areJustificationsValid && validation.hasInDepthDescriptions) {
                    validationPassed = true;
                    break; 
                } else {
                    feedback = validation.feedback;
                }
            }
    
            if (validationPassed && lastAnalysis) {
                const researchMessage: ChatMessage = {
                    role: 'model',
                    text: `Roger that! I've done a deep dive on **${situation.title}**. Here's what I found:`,
                    researchAnalysis: lastAnalysis,
                };
                
                const updatedAnalyses = { ...researchAnalyses, [situation.id]: lastAnalysis! };
                setResearchAnalyses(updatedAnalyses);
                setChatHistory(prev => [...prev, researchMessage]);

                const newlyResearchedIds = new Set(Object.keys(updatedAnalyses));
                const allSituationIds = new Set(allTaxSituations.map(s => s.id));

                const allResearched = allTaxSituations.length > 0 && 
                                      [...allSituationIds].every(id => newlyResearchedIds.has(id));

                if (allResearched) {
                    const promptForObjectivesMessage: ChatMessage = {
                        role: 'model',
                        text: "Great, all the initial research is complete! To make sure we're on the right track, what are your main objectives for this case?"
                    };
                    setChatHistory(prev => [...prev, promptForObjectivesMessage]);
                    setIsAwaitingObjectives(true);
                }
            } else {
                 throw new Error("Failed to generate a valid research analysis after multiple attempts.");
            }
        }, `I ran into a little trouble researching "${situation.title}". Want to try again?`, `${ActionNames.RESEARCH}-${situation.id}`, situation.title);
    };

    const generateMemoHandler = async (analysis: ResearchAnalysis) => {
        const situationId = exportModalSituationId;
        if (!situationId) return;

        const cachedMemo = cachedDocuments[situationId]?.memo;
        if (cachedMemo) {
            handleExportGeneratedDocument(cachedMemo);
            const aiMessage: ChatMessage = {
                role: 'model',
                text: `I found the cached tax memo for **${analysis.situationTitle}**. It's been downloaded for you again.`
            };
            setChatHistory(prev => [...prev, aiMessage]);
            return;
        }

        await handleApiCall(async () => {
            const { content } = await generateTaxMemo(chatHistory, analysis);
            const title = `Tax Memo: ${analysis.situationTitle}`;
            const newMemo: GeneratedDocument = { type: 'memo', title, content };
            
            const aiMessage: ChatMessage = {
                role: 'model',
                text: `I've prepared the tax memo for **${analysis.situationTitle}**. It's been downloaded for you automatically and saved to your checklist for quick access later.`,
                generatedDocument: newMemo,
            };
            setChatHistory(prev => [...prev, aiMessage]);
            handleExportGeneratedDocument(newMemo);
            setCachedDocuments(prev => ({
                ...prev,
                [situationId]: {
                    ...prev[situationId],
                    memo: newMemo,
                }
            }));

        }, `I had an issue generating the memo for "${analysis.situationTitle}". Let's try that again.`, `${ActionNames.GENERATE_MEMO}-${situationId}`, analysis.situationTitle);
    };

    const generateLetterHandler = async (analysis: ResearchAnalysis) => {
        const situationId = exportModalSituationId;
        if (!situationId) return;
        
        const cachedLetter = cachedDocuments[situationId]?.letter;
        if (cachedLetter) {
            handleExportGeneratedDocument(cachedLetter);
            const aiMessage: ChatMessage = {
                role: 'model',
                text: `I found the cached client letter for **${analysis.situationTitle}**. It has been downloaded for you again.`
            };
            setChatHistory(prev => [...prev, aiMessage]);
            return;
        }

        await handleApiCall(async () => {
            const { content } = await generateClientLetter(chatHistory, analysis);
            const title = `Client Letter: ${analysis.situationTitle}`;
            const newLetter: GeneratedDocument = { type: 'letter', title, content };

            const aiMessage: ChatMessage = {
                role: 'model',
                text: `I've drafted a client letter regarding **${analysis.situationTitle}**. It has been downloaded automatically and saved for quick access in your checklist.`,
                generatedDocument: newLetter,
            };
            setChatHistory(prev => [...prev, aiMessage]);
            handleExportGeneratedDocument(newLetter);
            setCachedDocuments(prev => ({
                ...prev,
                [situationId]: {
                    ...prev[situationId],
                    letter: newLetter,
                }
            }));
        }, `Sorry, I couldn't generate the client letter for "${analysis.situationTitle}". Want to give it another go?`, `${ActionNames.GENERATE_LETTER}-${situationId}`, analysis.situationTitle);
    };

    const keyFactsGenerated = useMemo(() => chatHistory.some(m => m.keyFacts && m.keyFacts.length > 0), [chatHistory]);
    const taxSituationsIdentified = useMemo(() => chatHistory.some(m => m.taxSituations && m.taxSituations.length > 0), [chatHistory]);
    const allTaxSituations = useMemo(() => chatHistory.flatMap(m => m.taxSituations || []), [chatHistory]);
    const latestKeyFacts = useMemo(() => [...chatHistory].reverse().find(m => m.keyFacts && m.keyFacts.length > 0)?.keyFacts, [chatHistory]);
    const researchedSituations = useMemo(() => new Set(Object.keys(researchAnalyses)), [researchAnalyses]);

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

    const handleExportResearchAnalysis = (analysis: ResearchAnalysis) => {
        if (!analysis) return;
        let content = `# Research Analysis: ${analysis.situationTitle}\n\n`;
        content += `## Summary\n\n> ${analysis.summary.replace(/\n/g, '\n> ')}\n\n`;

        if (analysis.applicableLaw && analysis.applicableLaw.length > 0) {
            content += "## Applicable Law & Regulations\n\n";
            analysis.applicableLaw.forEach(law => {
                content += `- **${law.citation}:** ${law.description}\n`;
            });
            content += "\n";
        }

        if (analysis.keyImplications && analysis.keyImplications.length > 0) {
            content += "## Key Implications\n\n";
            analysis.keyImplications.forEach(item => {
                content += `- ${item.implication}\n`;
                if (item.justification) {
                    const sourceText = item.justification.url
                        ? `[${item.justification.text}](${item.justification.url})`
                        : item.justification.text;
                    content += `  - *Source: ${sourceText}*\n`;
                }
            });
            content += "\n";
        }
        
        if (analysis.planningOpportunities && analysis.planningOpportunities.length > 0) {
            content += "## Planning Opportunities\n\n";
            analysis.planningOpportunities.forEach(item => {
                content += `- ${item.opportunity}\n`;
                if (item.justification) {
                    const sourceText = item.justification.url
                        ? `[${item.justification.text}](${item.justification.url})`
                        : item.justification.text;
                    content += `  - *Source: ${sourceText}*\n`;
                }
            });
            content += "\n";
        }

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const filename = `${analysis.situationTitle.toLowerCase().replace(/\s+/g, '-')}-analysis.md`;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportGeneratedDocument = (doc: GeneratedDocument) => {
        const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.md`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const toggleObjectiveCompletion = (objectiveId: string) => {
        setCompletedObjectives(prev => {
            const newSet = new Set(prev);
            if (newSet.has(objectiveId)) {
                newSet.delete(objectiveId);
            } else {
                newSet.add(objectiveId);
            }
            return newSet;
        });
    };

    const toggleChecklist = () => setIsChecklistOpen(prev => !prev);
    const closeChecklist = () => setIsChecklistOpen(false);

    return {
        chatHistory,
        isLoading,
        currentAction,
        currentActionTitle,
        currentActionSubStep,
        errors,
        isChecklistOpen,
        researchAnalyses,
        researchedSituations,
        cachedDocuments,
        keyFactsGenerated,
        taxSituationsIdentified,
        allTaxSituations,
        latestKeyFacts,
        exportModalAnalysis,
        objectives,
        completedObjectives,
        isAwaitingObjectives,
        sendMessage,
        analyzeTaxSituations,
        reAnalyzeKeyFacts,
        researchSituationHandler,
        generateMemoHandler,
        generateLetterHandler,
        handleExportKeyFacts,
        handleExportTaxSituations,
        handleExportResearchAnalysis,
        handleExportGeneratedDocument,
        toggleChecklist,
        closeChecklist,
        removeError,
        openExportModal,
        closeExportModal,
        toggleObjectiveCompletion,
    };
};