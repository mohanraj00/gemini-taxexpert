
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, TaxSituation } from '../types';
import { LoadingSpinner, PaperAirplaneIcon, PlusIcon, XCircleIcon, DocumentTextIcon, SparklesIcon, BeakerIcon, BookOpenIcon } from './icons/Icons';
import KeyFactsWidget from './KeyFactsWidget';
import TaxSituationsWidget from './TaxSituationsWidget';
import ChecklistPanel from './ChecklistPanel';
// FIX: Corrected the import path for ResearchAnalysisWidget.
import ResearchAnalysisWidget from './ResearchTopicsWidget';

interface ChatScreenProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
  onAnalyzeTaxSituations: () => void;
  onResearchSituation: (situation: TaxSituation) => void;
  keyFactsGenerated: boolean;
  taxSituationsIdentified: boolean;
  allTaxSituations: TaxSituation[];
  researchedSituations: Set<string>;
  isChecklistOpen: boolean;
  onCloseChecklist: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  chatHistory,
  onSendMessage,
  isLoading,
  onAnalyzeTaxSituations,
  onResearchSituation,
  keyFactsGenerated,
  taxSituationsIdentified,
  allTaxSituations,
  researchedSituations,
  isChecklistOpen,
  onCloseChecklist
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Map<File, string>>(new Map());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const newPreviews = new Map<File, string>();
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            newPreviews.set(file, URL.createObjectURL(file));
        }
    });

    setPreviews(newPreviews);

    return () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [newMessage]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    let textForSubmission = newMessage;
    if (!newMessage.trim() && files.length > 0) {
        textForSubmission = `Pull Key Facts from the attached document${files.length > 1 ? 's' : ''}.`;
    }

    if ((textForSubmission.trim() || files.length > 0) && !isLoading) {
      onSendMessage(textForSubmission, files.length > 0 ? files : undefined);
      setNewMessage('');
      setFiles([]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
    if(fileInputRef.current){
        fileInputRef.current.value = "";
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
      }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const imageFile = items[i].getAsFile();
            if (imageFile) {
                const namedFile = new File([imageFile], `pasted-image-${Date.now()}.${imageFile.type.split('/')[1]}`, { type: imageFile.type });
                setFiles(prev => [...prev, namedFile]);
                event.preventDefault();
            }
        }
    }
  };
  
  const proseClasses = `prose prose-slate prose-sm max-w-none
                      prose-p:my-2
                      prose-headings:font-bold prose-headings:text-slate-900 prose-headings:pb-2 prose-headings:mb-4 prose-headings:mt-5
                      prose-h1:text-lg
                      prose-h2:text-base
                      prose-strong:font-semibold prose-strong:text-slate-800
                      prose-ul:my-3 prose-ul:pl-5
                      prose-ol:my-3 prose-ol:pl-5
                      prose-li:my-1.5
                      prose-a:text-indigo-600 hover:prose-a:text-indigo-700
                      prose-code:bg-slate-200 prose-code:rounded prose-code:px-1.5 prose-code:py-1 prose-code:font-mono prose-code:text-sm`;

  const acceptedFileTypes = "image/*,.pdf,.md,.doc,.docx,.txt,.xls,.xlsx,application/pdf,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const hasInput = newMessage.trim() !== '' || files.length > 0;
  
  const showPullKeyFactsAction = hasInput && !keyFactsGenerated;
  const showAnalyzeSituationsAction = keyFactsGenerated && !taxSituationsIdentified;
  const nextSituationToResearch = allTaxSituations.find(s => !researchedSituations.has(s.id));


  return (
    <section className="flex-grow h-0 w-full animate-fade-in-up grid grid-cols-1 md:grid-cols-3 gap-8 p-4 md:px-8">
      {/* Main Chat Column */}
      <div className="flex flex-col md:col-span-2 overflow-hidden">
          {/* Chat History */}
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-6 pr-2 -mr-2">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">GTB</div>}
                <div className={`max-w-[85%] rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border'} overflow-hidden`}>
                  <div className={`p-4 ${proseClasses}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.keyFacts && <KeyFactsWidget facts={msg.keyFacts} />}
                  {msg.taxSituations && <TaxSituationsWidget situations={msg.taxSituations} onResearch={onResearchSituation} researchedSituations={researchedSituations} onSuggestResearch={(topic) => onSendMessage(`I'd like to research another topic: "${topic}"`)} />}
                  {msg.researchAnalysis && <ResearchAnalysisWidget analysis={msg.researchAnalysis} />}
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm flex-shrink-0">You</div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">GTB</div>
                <div className="max-w-[85%] p-4 rounded-lg bg-white border">
                  <LoadingSpinner className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex-shrink-0 pt-4 bg-slate-50">
            {files.length > 0 && (
                <div className="mb-2 p-2 bg-slate-100 border border-slate-200 rounded-lg animate-fade-in-up">
                    <div className="flex flex-wrap gap-2">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="p-1.5 bg-white border rounded-md flex items-center gap-2 max-w-full">
                                {previews.get(file) ? (
                                    <img src={previews.get(file)} alt={file.name} className="h-10 w-10 object-cover rounded flex-shrink-0" />
                                ) : (
                                    <DocumentTextIcon className="h-8 w-8 text-slate-500 flex-shrink-0 mx-1" />
                                )}
                                <span className="text-sm text-slate-700 font-medium truncate shrink min-w-0">{file.name}</span>
                                <button onClick={() => removeFile(file)} type="button" className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0">
                                    <XCircleIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <form ref={formRef} id="chat-form" onSubmit={handleSendMessage} className="relative flex items-center bg-white border border-slate-300 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">
              <input
                  type="file"
                  accept={acceptedFileTypes}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                  multiple
              />
              <textarea
                ref={textareaRef}
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Ask me anything about your tax scenario..."
                className="flex-grow p-3 bg-transparent text-slate-800 focus:outline-none transition resize-none"
                style={{maxHeight: '200px'}}
                disabled={isLoading}
              />
              <div className="flex items-center space-x-1 pr-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex-shrink-0 disabled:opacity-50">
                   <PlusIcon className="h-6 w-6" />
                </button>
                <button type="submit" disabled={isLoading || (!newMessage.trim() && files.length === 0)} className="p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 transition-colors flex-shrink-0">
                  {isLoading ? <LoadingSpinner className="h-5 w-5 animate-spin" /> : <PaperAirplaneIcon className="h-5 w-5" />}
                </button>
              </div>
            </form>
            
            <div className="mt-3 animate-fade-in-up flex flex-wrap gap-2">
                {showPullKeyFactsAction && !isLoading && (
                    <button
                        type="submit"
                        form="chat-form"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                    >
                        <SparklesIcon className="mr-2 h-5 w-5" />
                        Pull Key Facts
                    </button>
                )}
                {showAnalyzeSituationsAction && !isLoading && (
                    <button
                        type="button"
                        onClick={onAnalyzeTaxSituations}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                    >
                        <BeakerIcon className="mr-2 h-5 w-5" />
                        Identify Tax Situations
                    </button>
                )}
                 {taxSituationsIdentified && nextSituationToResearch && !isLoading && (
                    <button
                        type="button"
                        onClick={() => onResearchSituation(nextSituationToResearch)}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500 transition-colors"
                    >
                        <BookOpenIcon className="mr-2 h-5 w-5" />
                        Research: {nextSituationToResearch.title}
                    </button>
                )}
            </div>
          </div>
      </div>
      {/* Desktop Checklist Panel Column */}
      <div className="hidden md:block md:col-span-1">
        <ChecklistPanel 
            keyFactsGenerated={keyFactsGenerated}
            taxSituationsIdentified={taxSituationsIdentified}
            allTaxSituations={allTaxSituations}
            researchedSituations={researchedSituations}
        />
      </div>

      {/* Mobile/Tablet Checklist Panel Overlay */}
      {isChecklistOpen && (
        <>
            {/* Backdrop */}
            <div 
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" 
                onClick={onCloseChecklist}
                aria-hidden="true"
            ></div>
            {/* Panel */}
            <div 
                className="md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm bg-slate-50 shadow-lg z-50 animate-slide-in-right p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="checklist-heading"
            >
                <ChecklistPanel
                    keyFactsGenerated={keyFactsGenerated}
                    taxSituationsIdentified={taxSituationsIdentified}
                    allTaxSituations={allTaxSituations}
                    researchedSituations={researchedSituations}
                    onClose={onCloseChecklist}
                />
            </div>
        </>
      )}
    </section>
  );
};

export default ChatScreen;