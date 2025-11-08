
import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import ChatScreen from './components/ChatScreen';

const AppContent: React.FC = () => {
    const { error } = useAppContext();
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-800 flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col overflow-hidden">
                {error && (
                    <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mx-auto w-full max-w-4xl" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                <ChatScreen />
            </main>
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
