
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// FIX: Correctly import ChatMessage from types, and remove it from the icons import.
import { LoadingSpinner, PaperAirplaneIcon, ArrowRightIcon } from './icons/Icons';
import type { ChatMessage } from '../types';

interface GeneratedDocumentsProps {
    title: string;
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onNextPhase: () => void;
    isLastPhase: boolean;
}

const GeneratedDocuments: React.FC<GeneratedDocumentsProps> = ({ title, chatHistory, onSendMessage, isLoading, onNextPhase, isLastPhase }) => {
    const [newMessage, setNewMessage] = useState('');
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


    return (
        <section className="flex flex-col flex-grow w-full animate-fade-in-up">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-4 border-b">
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            </div>

            {/* Chat History */}
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-6 pr-2">
                {chatHistory.map((msg, index) => {
                    const content = msg.isSummary ? (
                        <div className={`bg-slate-100/70 border border-slate-200/80 rounded-lg p-4 ${proseClasses}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className={proseClasses}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                    );

                    return (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>}
                            <div className={`max-w-[85%] p-4 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border'}`}>
                                {content}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm flex-shrink-0">You</div>}
                        </div>
                    );
                })}
                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                        <div className="max-w-[85%] p-4 rounded-lg bg-white border">
                        <LoadingSpinner className="w-6 h-6 animate-spin text-indigo-600" />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Chat Input and Phase Controls */}
            <div className="flex-shrink-0 mt-auto pt-4 bg-slate-50">
                 <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Request edits for the document..."
                        className="w-full p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !newMessage.trim()} className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 transition-colors">
                        {isLoading ? <LoadingSpinner className="h-5 w-5 animate-spin" /> : <PaperAirplaneIcon className="h-5 w-5" />}
                    </button>
                </form>
                <div className="mt-4 flex justify-end">
                    <button onClick={onNextPhase} disabled={isLoading} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                        {isLastPhase ? "Finish & Start Over" : "Confirm & Proceed"}
                        {!isLastPhase && <ArrowRightIcon className="ml-2 h-5 w-5" />}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GeneratedDocuments;
