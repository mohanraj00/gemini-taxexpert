
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GeneratedDocument } from '../types';
import { DocumentDuplicateIcon, ClipboardCopyIcon, DocumentDownloadIcon, CheckIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

interface GeneratedDocumentWidgetProps {
    document: GeneratedDocument;
}

const GeneratedDocumentWidget: React.FC<GeneratedDocumentWidgetProps> = ({ document }) => {
    const { handleExportGeneratedDocument } = useAppContext();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(document.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const proseClasses = `prose prose-sm max-w-none leading-relaxed prose-zinc
                        prose-p:my-1.5
                        prose-headings:font-semibold prose-headings:pb-1 prose-headings:mb-3 prose-headings:mt-4
                        prose-h1:text-base prose-headings:text-zinc-900
                        prose-h2:text-sm
                        prose-strong:font-semibold prose-strong:text-zinc-800
                        prose-ul:my-2 prose-ul:pl-4
                        prose-ol:my-2 prose-ol:pl-4
                        prose-li:my-1
                        prose-a:text-indigo-600 hover:prose-a:text-indigo-700
                        prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:bg-zinc-200`;

    return (
        <div className="border-t-4 border-sky-400 mt-4 p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="flex items-center text-sm font-semibold text-sky-800">
                    <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-sky-500" />
                    {document.title}
                </h3>
                <div className="flex items-center space-x-1">
                    <button 
                        onClick={handleCopy}
                        className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                        aria-label="Copy to clipboard"
                    >
                        {copied ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <ClipboardCopyIcon className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => handleExportGeneratedDocument(document)}
                        className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                        aria-label="Download document"
                    >
                        <DocumentDownloadIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className={`p-4 rounded-lg bg-white border border-zinc-200 ${proseClasses}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{document.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default GeneratedDocumentWidget;