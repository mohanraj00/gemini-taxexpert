
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpenIcon } from './icons/Icons';

interface ResearchAnalysisWidgetProps {
    analysis: {
        situationTitle: string;
        content: string;
    };
}

const ResearchAnalysisWidget: React.FC<ResearchAnalysisWidgetProps> = ({ analysis }) => {
    if (!analysis) {
        return null;
    }

    const proseClasses = `prose prose-zinc prose-sm max-w-none leading-relaxed
                      prose-p:my-2
                      prose-headings:font-semibold prose-headings:text-zinc-900 prose-headings:pb-2 prose-headings:mb-4 prose-headings:mt-6
                      prose-h1:text-lg
                      prose-h2:text-base
                      prose-strong:font-semibold prose-strong:text-zinc-800
                      prose-ul:my-3 prose-ul:pl-5
                      prose-ol:my-3 prose-ol:pl-5
                      prose-li:my-1.5
                      prose-a:text-indigo-600 hover:prose-a:text-indigo-700 font-medium
                      prose-code:bg-zinc-200 prose-code:rounded prose-code:px-1.5 prose-code:py-1 prose-code:font-mono prose-code:text-sm`;

    return (
        <div className="border-t-4 border-orange-400 mt-4 p-4 bg-zinc-50/50">
            <h3 className="flex items-center text-sm font-semibold text-orange-800 mb-4">
                <BookOpenIcon className="h-5 w-5 mr-2 text-orange-500" />
                Research Analysis: {analysis.situationTitle}
            </h3>
            <div className={`p-4 rounded-lg bg-white border border-zinc-200 ${proseClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default ResearchAnalysisWidget;