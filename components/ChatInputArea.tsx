
import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner, PlusIcon, XCircleIcon, DocumentTextIcon, SendIcon } from './icons/Icons';
import ActionButtons from './ActionButtons';
import { useAppContext } from '../contexts/AppContext';

const ChatInputArea: React.FC = () => { 
    const { isLoading, sendMessage } = useAppContext();
    const [newMessage, setNewMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<Map<File, string>>(new Map());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

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
            textareaRef.current.style.height = 'auto';
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
            sendMessage(textForSubmission, files.length > 0 ? files : undefined);
            setNewMessage('');
            setFiles([]);
            textareaRef.current?.focus();
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

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

    const acceptedFileTypes = "image/*,.pdf,.md,.doc,.docx,.txt,.xls,.xlsx,application/pdf,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const hasInput = newMessage.trim() !== '' || files.length > 0;

    return (
        <div className="flex-shrink-0 pt-4">
            {files.length > 0 && (
                <div className="mb-3 p-2 bg-zinc-100 border border-zinc-200 rounded-lg animate-fade-in-up">
                    <div className="flex flex-wrap gap-2">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="p-1.5 bg-white border rounded-lg flex items-center gap-2 max-w-full shadow-sm">
                                {previews.get(file) ? (
                                    <img src={previews.get(file)} alt={file.name} className="h-10 w-10 object-cover rounded flex-shrink-0" />
                                ) : (
                                    <DocumentTextIcon className="h-8 w-8 text-zinc-500 flex-shrink-0 mx-1" />
                                )}
                                <span className="text-sm text-zinc-700 font-medium truncate shrink min-w-0">{file.name}</span>
                                <button onClick={() => removeFile(file)} type="button" className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 transition-colors flex-shrink-0">
                                    <XCircleIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <ActionButtons hasInput={hasInput} />

            <form ref={formRef} id="chat-form" onSubmit={handleSendMessage} className="relative flex items-center bg-white border border-zinc-200/80 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500 transition-all p-1">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-3 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors flex-shrink-0 disabled:opacity-50">
                   <PlusIcon className="h-6 w-6" />
                </button>
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
                    placeholder="Ask me anything, or upload a document to start..."
                    className="flex-grow px-2 py-3 bg-transparent text-zinc-800 placeholder-zinc-500 focus:outline-none transition resize-none leading-relaxed"
                    style={{maxHeight: '200px'}}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !hasInput} className="p-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                    {isLoading ? <LoadingSpinner className="h-6 w-6 animate-spin text-zinc-500" /> : <SendIcon className="h-6 w-6" />}
                </button>
            </form>
        </div>
    );
};

export default ChatInputArea;