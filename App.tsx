
import React, { useState } from 'react';
import { ChatMessage, KeyFactCategory, TaxSituation } from './types';
import { getAiResponse, generateKeyFacts, generateTaxSituations, researchSituation } from './services/geminiService';
import Header from './components/Header';
import ChatScreen from './components/ChatScreen';

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

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
        role: 'model',
        text: "Hey there! I'm Gemini TaxBro, your friendly guide to US tax research. Ready to dive in? Just tell me about your tax situation or upload any relevant documents to get started."
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [researchedSituations, setResearchedSituations] = useState<Set<string>>(new Set());


  const handleApiCall = async (
    apiFunction: () => Promise<void>,
    errorMessage: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
        await apiFunction();
    } catch (err) {
        setError(errorMessage);
        setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
        console.error(err);
    } finally {
        setIsLoading(false);
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
        // FIX: Added curly braces to the catch block to correct syntax error.
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
            const responseJson = await generateKeyFacts(scenario, filesData);
            const { summary, keyFacts, clarifyingQuestions } = JSON.parse(responseJson) as { summary: string; keyFacts: KeyFactCategory[], clarifyingQuestions?: string[] };
            
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
    }
  };

  const analyzeTaxSituations = async () => {
    await handleApiCall(async () => {
        const responseJson = await generateTaxSituations(chatHistory);
        const { summary, taxSituations: rawSituations } = JSON.parse(responseJson) as { summary: string; taxSituations: {title: string, description: string}[] };
        
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
    }, "I hit a snag analyzing the tax situations. Mind trying that again?");
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
    }, `I ran into a little trouble researching "${situation.title}". Want to try again?`);
  };
  
  const keyFactsGenerated = chatHistory.some(m => m.keyFacts && m.keyFacts.length > 0);
  const taxSituationsIdentified = chatHistory.some(m => m.taxSituations && m.taxSituations.length > 0);
  const allTaxSituations = chatHistory.flatMap(m => m.taxSituations || []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header onToggleChecklist={() => setIsChecklistOpen(!isChecklistOpen)} />
      <main className="flex-grow flex flex-col overflow-hidden">
        {error && (
          <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <ChatScreen
            chatHistory={chatHistory}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onAnalyzeTaxSituations={analyzeTaxSituations}
            onResearchSituation={researchSituationHandler}
            keyFactsGenerated={keyFactsGenerated}
            taxSituationsIdentified={taxSituationsIdentified}
            allTaxSituations={allTaxSituations}
            researchedSituations={researchedSituations}
            isChecklistOpen={isChecklistOpen}
            onCloseChecklist={() => setIsChecklistOpen(false)}
        />
      </main>
    </div>
  );
};

export default App;
