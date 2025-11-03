
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

    return (
        <div className="border-t border-slate-200 mt-4 p-4 bg-orange-50">
            <h3 className="flex items-center text-sm font-semibold text-orange-800 mb-4">
                <BookOpenIcon className="h-5 w-5 mr-2 text-orange-500" />
                Research Analysis: {analysis.situationTitle}
            </h3>
            <div className={`p-4 rounded-md bg-white border border-slate-200 ${proseClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default ResearchAnalysisWidget;
