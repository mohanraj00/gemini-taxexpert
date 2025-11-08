
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '../types';
import KeyFactsWidget from './KeyFactsWidget';
import TaxSituationsWidget from './TaxSituationsWidget';
import ResearchAnalysisWidget from './ResearchTopicsWidget';

interface ChatMessageProps {
  msg: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg }) => {
    const isModel = msg.role === 'model';

    const proseClasses = `prose prose-sm max-w-none leading-relaxed
                        prose-p:my-2
                        prose-headings:font-semibold prose-headings:pb-2 prose-headings:mb-4 prose-headings:mt-6
                        prose-h1:text-lg
                        prose-h2:text-base
                        prose-strong:font-semibold
                        prose-ul:my-3 prose-ul:pl-5
                        prose-ol:my-3 prose-ol:pl-5
                        prose-li:my-1.5
                        prose-code:rounded prose-code:px-1.5 prose-code:py-1 prose-code:font-mono prose-code:text-sm`;

    const themeClasses = isModel 
        ? `prose-zinc prose-headings:text-zinc-900 prose-strong:text-zinc-800 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-code:bg-zinc-200`
        : `prose-invert prose-headings:text-white prose-strong:text-white prose-a:text-indigo-300 hover:prose-a:text-indigo-200 prose-code:bg-indigo-900/80`;


    return (
        <div className={`w-full flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
            <div className="w-full max-w-[85%]">
                <span className={`text-xs font-bold mb-1.5 px-1 text-zinc-600`}>
                    {isModel ? 'Gemini TaxBro' : 'You'}
                </span>
                <div className={`rounded-xl shadow-sm ${isModel ? 'bg-white border border-zinc-200/80 text-zinc-800' : 'bg-indigo-600 text-white'} overflow-hidden`}>
                    <div className={`p-4 ${proseClasses} ${themeClasses}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.keyFacts && <KeyFactsWidget facts={msg.keyFacts} />}
                    {msg.taxSituations && <TaxSituationsWidget situations={msg.taxSituations} />}
                    {msg.researchAnalysis && <ResearchAnalysisWidget analysis={msg.researchAnalysis} />}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
