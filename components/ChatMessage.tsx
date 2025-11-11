

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '../types';
import KeyFactsWidget from './KeyFactsWidget';
import TaxSituationsWidget from './TaxSituationsWidget';
import ResearchAnalysisWidget from './ResearchAnalysisWidget';
import GeneratedDocumentWidget from './GeneratedDocumentWidget';
import ObjectivesWidget from './ObjectivesWidget';

interface ChatMessageProps {
  msg: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg }) => {
    const isModel = msg.role === 'model';

    const proseClasses = `prose prose-sm max-w-none leading-relaxed
                        prose-p:my-1.5
                        prose-headings:font-semibold prose-headings:pb-1 prose-headings:mb-3 prose-headings:mt-4
                        prose-h1:text-base
                        prose-h2:text-sm
                        prose-strong:font-semibold
                        prose-ul:my-2 prose-ul:pl-4
                        prose-ol:my-2 prose-ol:pl-4
                        prose-li:my-1
                        prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm`;

    const themeClasses = isModel 
        ? `prose-zinc prose-headings:text-zinc-900 prose-strong:text-zinc-800 prose-a:text-teal-600 hover:prose-a:text-teal-700 prose-code:bg-zinc-200`
        : `prose-invert prose-headings:text-white prose-strong:text-white prose-a:text-teal-300 hover:prose-a:text-teal-200 prose-code:bg-teal-900/80`;


    return (
        <div className={`w-full flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
            <div className="w-full max-w-[85%]">
                <span className={`text-xs font-semibold mb-1 px-1 text-zinc-500`}>
                    {isModel ? 'Tax Inference' : 'You'}
                </span>
                <div className={`rounded-xl shadow-sm ${isModel ? 'bg-white border border-zinc-200/80 text-zinc-800' : 'bg-teal-600 text-white'} overflow-hidden`}>
                    <div className={`p-3 ${proseClasses} ${themeClasses}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.keyFacts && <KeyFactsWidget facts={msg.keyFacts} />}
                    {msg.taxSituations && <TaxSituationsWidget situations={msg.taxSituations} />}
                    {msg.researchAnalysis && <ResearchAnalysisWidget analysis={msg.researchAnalysis} />}
                    {msg.objectives && <ObjectivesWidget objectives={msg.objectives} />}
                    {msg.generatedDocument && <GeneratedDocumentWidget document={msg.generatedDocument} />}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;