
import React, { useState, useCallback } from 'react';
import { Phase, ChatMessage, ResearchFinding, CalculationResult, GeneratedDocs, SituationSummary } from './types';
import { getAiResponse } from './services/geminiService';
import Header from './components/Header';
import ScenarioInput from './components/ScenarioInput';
import AnalysisDashboard from './components/AnalysisDashboard';
import GeneratedDocuments from './components/GeneratedDocuments';

const safeJsonParse = <T,>(text: string): T | null => {
  try {
    if (!text || !text.includes('{')) {
        return null;
    }
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error, "Original text:", text);
    return null;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove prefix "data:application/pdf;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
};


const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('WELCOME');
  const [scenario, setScenario] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Phase-specific content
  const [situationSummary, setSituationSummary] = useState('');
  const [implications, setImplications] = useState<string[]>([]);
  const [researchFindings, setResearchFindings] = useState<ResearchFinding[]>([]);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocs>({ memo: '', letter: '' });
  
  const [currentResearchIndex, setCurrentResearchIndex] = useState(0);

  const startAnalysis = async (userScenario: string, file?: File) => {
    if (!userScenario.trim() && !file) {
      setError("Please enter a tax scenario or upload a PDF document.");
      return;
    }
    setScenario(userScenario);
    setPhase('SITUATION_SUMMARY');

    let initialMessage: ChatMessage = { 
        role: 'user', 
        text: `Here is the scenario I need to analyze:\n\n${userScenario}`
    };

    if (file) {
        setIsLoading(true);
        setError(null);
        try {
            const base64Data = await fileToBase64(file);
            initialMessage.fileData = {
                mimeType: file.type,
                data: base64Data
            };
            initialMessage.text += `\n\nPlease refer to the attached document: ${file.name}`;
        } catch (err) {
            setError("Failed to read the uploaded file. Please try again.");
            console.error(err);
            setIsLoading(false);
            return;
        }
    }

    setChatHistory([initialMessage]);
    sendMessage(initialMessage.text, true, initialMessage.fileData);
  };

  const sendMessage = async (text: string, isSystemCall: boolean = false, fileData?: { mimeType: string; data: string; }) => {
    setError(null);
    setIsLoading(true);

    const updatedHistory: ChatMessage[] = isSystemCall 
      ? [...chatHistory] 
      : [...chatHistory, { role: 'user', text }];

    if (!isSystemCall) {
      setChatHistory(updatedHistory);
    }

    try {
      const responseText = await getAiResponse(
        phase, updatedHistory, scenario, situationSummary, implications, researchFindings, currentResearchIndex, fileData
      );
      
      const newModelMessage: ChatMessage = { 
        role: 'model', 
        text: responseText,
        isSummary: isSystemCall, // Summaries are system-initiated, follow-ups are not.
      };
      
      if (phase === 'SITUATION_SUMMARY') {
        const summaryData = safeJsonParse<SituationSummary>(responseText);
        if (summaryData) {
            newModelMessage.structuredContent = { type: 'SITUATION_SUMMARY', data: summaryData };
            setSituationSummary(summaryData.executiveSummary);
        } else {
             setSituationSummary(responseText); // Fallback to raw text
        }
      }

      if (phase === 'RESEARCH') {
         const newFinding = safeJsonParse<Omit<ResearchFinding, 'implication'>>(responseText);
         if (newFinding) {
            newModelMessage.structuredContent = { type: 'RESEARCH', data: {implication: implications[currentResearchIndex], ...newFinding} };
         }
      }
      
      setChatHistory(prev => [...prev, newModelMessage]);
      
      if (phase === 'IMPLICATION_IDENTIFICATION') {
        const parsedImplications = responseText.split('\n').filter(line => line.match(/^\d+\./));
        setImplications(parsedImplications);
      }
      if (phase === 'MEMO_GENERATION') setDocuments(prev => ({...prev, memo: responseText}));
      if (phase === 'LETTER_GENERATION') setDocuments(prev => ({...prev, letter: responseText}));

    } catch (err) {
      const errorMessage = "An error occurred with the AI service. Please try again.";
      setError(errorMessage);
      setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPhase = () => {
    let nextPhase: Phase | null = null;
    const lastModelResponse = [...chatHistory].reverse().find(m => m.role === 'model');

    switch (phase) {
        case 'SITUATION_SUMMARY':
            nextPhase = 'IMPLICATION_IDENTIFICATION';
            if (lastModelResponse?.structuredContent?.type === 'SITUATION_SUMMARY') {
                // FIX: Removed unnecessary type assertion. The type is correctly inferred due to the discriminated union in ChatMessage.
                const summaryData = lastModelResponse.structuredContent.data;
                setSituationSummary(summaryData.executiveSummary);
            } else {
                setSituationSummary(lastModelResponse?.text ?? '');
            }
            break;
        case 'IMPLICATION_IDENTIFICATION':
             const parsedImplications = (lastModelResponse?.text ?? '').split('\n').filter(line => line.match(/^\d+\./)).map(line => line.replace(/^\d+\.\s*/, ''));
             setImplications(parsedImplications);
             if (parsedImplications.length > 0) {
                nextPhase = 'RESEARCH';
             } else {
                 setError("No implications identified to research.");
             }
            break;
        case 'RESEARCH':
            const researchFinding = lastModelResponse?.structuredContent?.type === 'RESEARCH' ? lastModelResponse.structuredContent.data : null;
            if(researchFinding) {
                // FIX: The error on this line is resolved by updating the ChatMessage type in types.ts to use a discriminated union.
                // TypeScript can now correctly infer that `researchFinding` is of type `ResearchFinding`, not `ResearchFinding | SituationSummary`.
                setResearchFindings(prev => [...prev, researchFinding]);
            }

            if (currentResearchIndex < implications.length - 1) {
                setCurrentResearchIndex(prev => prev + 1);
                nextPhase = 'RESEARCH';
            } else {
                nextPhase = 'CALCULATION';
            }
            break;
        case 'CALCULATION':
            nextPhase = 'MEMO_GENERATION';
            break;
        case 'MEMO_GENERATION':
            nextPhase = 'LETTER_GENERATION';
            break;
        case 'LETTER_GENERATION':
            setPhase('WELCOME');
            setScenario(''); setChatHistory([]); setSituationSummary(''); setImplications([]);
            setResearchFindings([]); setCurrentResearchIndex(0); setDocuments({memo: '', letter: ''});
            return;
    }
    
    if (nextPhase) {
        setPhase(nextPhase);
        const systemMessage = `User has confirmed this section. Now, moving to ${nextPhase}. Please provide the analysis for this new phase.`;
        // Use a new chat history for the next phase, but keep the context for the AI
        const updatedHistory: ChatMessage[] = [...chatHistory, {role: 'user', text: systemMessage, isHidden: true }];
        setChatHistory(updatedHistory);
        sendMessage(systemMessage, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:px-8 flex flex-col">
        {error && (
          <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {phase === 'WELCOME' && <div className="my-auto"><ScenarioInput onAnalyze={startAnalysis} isLoading={isLoading} /></div>}
        
        {phase !== 'WELCOME' && phase !== 'MEMO_GENERATION' && phase !== 'LETTER_GENERATION' && (
             <AnalysisDashboard
                phase={phase}
                chatHistory={chatHistory.filter(m => !m.isHidden)}
                onSendMessage={(msg) => sendMessage(msg, false)}
                onNextPhase={handleNextPhase}
                isLoading={isLoading}
                currentResearchIndex={currentResearchIndex}
                totalImplications={implications.length}
             />
        )}
        
        {(phase === 'MEMO_GENERATION' || phase === 'LETTER_GENERATION') && (
            <GeneratedDocuments 
                title={phase === 'MEMO_GENERATION' ? "Phase 5: Tax Memo" : "Phase 6: Client Letter"}
                chatHistory={chatHistory.filter(m => !m.isHidden)}
                onSendMessage={(msg) => sendMessage(msg, false)}
                isLoading={isLoading}
                onNextPhase={handleNextPhase}
                isLastPhase={phase === 'LETTER_GENERATION'}
            />
        )}

      </main>
    </div>
  );
};

export default App;
