
import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import ChatScreen from './components/ChatScreen';
import ExportOptionsModal from './components/ExportOptionsModal';
import { XMarkIcon } from './components/icons/Icons';

const AppContent: React.FC = () => {
    const { 
        errors, 
        removeError, 
        exportModalAnalysis, 
        closeExportModal,
        generateMemoHandler,
        generateLetterHandler,
    } = useAppContext();

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-800 flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col overflow-hidden">
                {errors.length > 0 && (
                    <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
                        {errors.map(error => (
                            <div key={error.id} className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg flex justify-between items-center" role="alert">
                                <div>
                                    <p className="font-bold">An error occurred</p>
                                    <p>{error.message}</p>
                                </div>
                                <button 
                                    onClick={() => removeError(error.id)} 
                                    className="p-1 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                                    aria-label="Dismiss error"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <ChatScreen />
            </main>
            <ExportOptionsModal
                analysis={exportModalAnalysis}
                onClose={closeExportModal}
                onGenerateMemo={generateMemoHandler}
                onGenerateLetter={generateLetterHandler}
            />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <AppContent />
    </AppProvider>
  );
};

export default App;