
import React, { useRef, useEffect } from 'react';
import { LoadingSpinner } from './icons/Icons';
import ChecklistPanel from './ChecklistPanel';
import ChatMessage from './ChatMessage';
import ChatInputArea from './ChatInputArea';
import { useAppContext } from '../contexts/AppContext';
import WelcomeScreen from './WelcomeScreen';
import { ActionNames } from '../constants';

const ChatScreen: React.FC = () => {
  const { chatHistory, isLoading, isChecklistOpen, closeChecklist, currentAction, currentActionTitle, currentActionSubStep } = useAppContext();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const getLoadingMessage = (): React.ReactNode => {
    if (!currentAction) return <span className="italic">Thinking...</span>;

    if (currentAction.startsWith(ActionNames.RESEARCH) && currentActionTitle) {
        return (
            <div className="flex flex-col items-start -my-1">
                <span className="font-medium text-zinc-700">Researching: {currentActionTitle}</span>
                {currentActionSubStep && <span className="text-xs text-zinc-500 italic mt-0.5">{currentActionSubStep}</span>}
            </div>
        );
    }
    
    if (currentAction.startsWith(ActionNames.GENERATE_MEMO) && currentActionTitle) {
        return (
             <span className="italic">Generating tax memo for: {currentActionTitle}...</span>
        );
    }

    if (currentAction.startsWith(ActionNames.GENERATE_LETTER) && currentActionTitle) {
        return (
             <span className="italic">Generating client letter for: {currentActionTitle}...</span>
        );
    }
    
    let message = 'Working on it...';
    switch (currentAction) {
        case ActionNames.PULL_FACTS:
            message = 'Pulling key facts...';
            break;
        case ActionNames.IDENTIFY_SITUATIONS:
            message = 'Identifying tax situations...';
            break;
        case ActionNames.REFINE_OBJECTIVES:
            message = 'Refining objectives...';
            break;
        case ActionNames.CHAT:
            message = 'Thinking...';
            break;
    }
    return <span className="italic">{message}</span>;
  };

  return (
    <section className="flex-grow h-0 w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-6 py-4">
      {/* Main Chat Column */}
      <div className="flex flex-col md:col-span-2 overflow-hidden h-full">
          {chatHistory.length > 0 ? (
            <>
              {/* Chat History */}
              <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-6 pr-4 -mr-4">
                {chatHistory.map((msg, index) => (
                    <ChatMessage 
                        key={index}
                        msg={msg}
                    />
                ))}
                {isLoading && (
                  <div className="w-full flex flex-col items-start">
                      <div className="w-full max-w-[85%]">
                          <span className="text-xs font-semibold mb-1 px-1 text-zinc-500">
                              Tax Inference
                          </span>
                          <div className="rounded-xl shadow-sm bg-white border border-zinc-200/80 p-3 flex items-center space-x-2">
                              <LoadingSpinner className="w-5 h-5 animate-spin text-teal-600" />
                              <div className="text-sm text-zinc-600">{getLoadingMessage()}</div>
                          </div>
                      </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <WelcomeScreen />
          )}

          {/* Chat Input Area */}
          <ChatInputArea />
      </div>
      
      {/* Desktop Checklist Panel Column */}
      <div className="hidden md:block md:col-span-1 h-full">
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