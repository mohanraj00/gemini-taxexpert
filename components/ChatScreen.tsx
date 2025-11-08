
import React, { useRef, useEffect } from 'react';
import { LoadingSpinner } from './icons/Icons';
import ChecklistPanel from './ChecklistPanel';
import ChatMessage from './ChatMessage';
import ChatInputArea from './ChatInputArea';
import { useAppContext } from '../contexts/AppContext';

const ChatScreen: React.FC = () => {
  const { chatHistory, isLoading, isChecklistOpen, closeChecklist } = useAppContext();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  return (
    <section className="flex-grow h-0 w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-6 py-4">
      {/* Main Chat Column */}
      <div className="flex flex-col md:col-span-2 overflow-hidden h-full">
          {/* Chat History */}
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-6 space-y-8 pr-4 -mr-4">
            {chatHistory.map((msg, index) => (
                <ChatMessage 
                    key={index}
                    msg={msg}
                />
            ))}
            {isLoading && (
              <div className="w-full flex flex-col items-start">
                  <div className="w-full max-w-[85%]">
                      <span className="text-xs font-bold mb-1.5 px-1 text-zinc-600">
                          Gemini TaxBro
                      </span>
                      <div className="rounded-xl shadow-sm bg-white border border-zinc-200/80 p-4">
                          <LoadingSpinner className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                  </div>
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <ChatInputArea />
      </div>
      
      {/* Desktop Checklist Panel Column */}
      <div className="hidden md:block md:col-span-1">
        <ChecklistPanel />
      </div>

      {/* Mobile/Tablet Checklist Panel Overlay */}
      {isChecklistOpen && (
        <>
            {/* Backdrop */}
            <div 
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" 
                onClick={closeChecklist}
                aria-hidden="true"
            ></div>
            {/* Panel */}
            <div 
                className="md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm bg-zinc-50 shadow-lg z-50 animate-slide-in-right p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="checklist-heading"
            >
                <ChecklistPanel onClose={closeChecklist} />
            </div>
        </>
      )}
    </section>
  );
};

export default ChatScreen;
