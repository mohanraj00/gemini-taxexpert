
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Phase, ChatMessage, ResearchFinding, SituationSummary } from '../types';
import { LoadingSpinner, PaperAirplaneIcon, PaperclipIcon, ArrowRightIcon } from './icons/Icons';
import SituationSummaryView from './SituationSummaryView';

interface AnalysisDashboardProps {
  phase: Phase;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, file?: File) => void;
  onNextPhase: () => void;
  isLoading: boolean;
  currentResearchIndex?: number;
  totalImplications?: number;
}

const PhaseTitleMap: Record<Phase, string> = {
    'WELCOME': '',
    'SITUATION_SUMMARY': 'Phase 1: Digest & Summarize Situation',
    'IMPLICATION_IDENTIFICATION': 'Phase 2: Identify Tax Implications',
    'RESEARCH': 'Phase 3: Authoritative Research',
    'CALCULATION': 'Phase 4: Tax Calculation',
    'MEMO_GENERATION': 'Phase 5: Generate Tax Memo',
    'LETTER_GENERATION': 'Phase 6: Generate Client Letter',
};

const RenderMessageContent: React.FC<{ message: ChatMessage }> = ({ message }) => {
    // For structured summary
    if (message.structuredContent?.type === 'SITUATION_SUMMARY') {
        // FIX: Removed unnecessary type assertion. The type is correctly inferred due to the discriminated union in ChatMessage.
        const summaryData = message.structuredContent.data;
        return <SituationSummaryView data={summaryData} />;
    }
    
    // For structured research findings
    if (message.structuredContent?.type === 'RESEARCH') {
        // FIX: Removed unnecessary type assertion. The type is correctly inferred due to the discriminated union in ChatMessage.
        const finding = message.structuredContent.data;
        return (
            <div className="prose prose-sm max-w-none">
                <h4 className="font-semibold text-slate-800">{finding.implication}</h4>
                <div className="mt-2 text-slate-700">
                    <p><strong>Summary:</strong> {finding.summary}</p>
                    <p><strong>Primary Law:</strong> {finding.primaryLaw}</p>
                    <p><strong>Tax Rulings:</strong> {finding.taxRulings}</p>
                    <p><strong>Private Letter Rulings:</strong> {finding.privateLetterRulings}</p>
                </div>
            </div>
        )
    }

    const proseClasses = `prose prose-slate prose-sm max-w-none
                        prose-p:my-2
                        prose-headings:font-bold prose-headings:text-slate-900 prose-headings:border-b prose-headings:border-slate-300/80 prose-headings:pb-2 prose-headings:mb-4 prose-headings:mt-5
                        prose-h1:text-lg
                        prose-h2:text-base
                        prose-h3:text-sm
                        prose-strong:font-semibold prose-strong:text-slate-800
                        prose-ul:my-3 prose-ul:pl-5
                        prose-ol:my-3 prose-ol:pl-5
                        prose-li:my-1.5
                        prose-a:text-indigo-600 hover:prose-a:text-indigo-700`;

    // For summary messages with a distinct background (e.g., phase kickoff messages that are not structured)
    if (message.isSummary) {
        return (
            <div className={`bg-slate-100/70 border border-slate-200/80 rounded-lg p-4 ${proseClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
        )
    }

    // For regular conversational messages
    return (
        <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
    );
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  phase,
  chatHistory,
  onSendMessage,
  onNextPhase,
  isLoading,
  currentResearchIndex,
  totalImplications,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isLoading) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage(`File uploaded: ${file.name}`, file);
    }
  };

  return (
    <section className="flex flex-col flex-grow w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-4 border-b">
        <h2 className="text-2xl font-bold text-slate-800">{PhaseTitleMap[phase]}</h2>
        {phase === 'RESEARCH' && totalImplications && totalImplications > 0 && (
          <span className="text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            Researching Item {currentResearchIndex! + 1} of {totalImplications}
          </span>
        )}
      </div>

      {/* Chat History */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-6 pr-2">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>}
            <div className={`max-w-[85%] rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white p-4' : 'bg-white text-slate-800 border'}`}>
              <RenderMessageContent message={msg} />
            </div>
             {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm flex-shrink-0">You</div>}
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && (
          <div className="flex items-start gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
            <div className="max-w-[85%] p-4 rounded-lg bg-white border">
              <LoadingSpinner className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
        {chatHistory.length === 0 && isLoading && (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )}
      </div>

      {/* Chat Input and Phase Controls */}
      <div className="flex-shrink-0 mt-auto pt-4 bg-slate-50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={handleFileUploadClick} className="p-3 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" title="Upload Document">
            <PaperclipIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask questions or provide edits..."
            className="w-full p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !newMessage.trim()} className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 transition-colors">
            {isLoading ? <LoadingSpinner className="h-5 w-5 animate-spin" /> : <PaperAirplaneIcon className="h-5 w-5" />}
          </button>
        </form>
        <div className="mt-4 flex justify-end">
            <button
                onClick={onNextPhase}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
                Confirm & Proceed to Next Phase
                <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
        </div>
      </div>
    </section>
  );
};

export default AnalysisDashboard;
