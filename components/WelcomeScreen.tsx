
import React from 'react';
import { TaxInferenceIcon } from './icons/Icons';

const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
            <div className="max-w-md">
                <div className="flex justify-center items-center mb-4">
                    <TaxInferenceIcon className="h-10 w-10 text-teal-600" />
                    <h1 className="text-3xl font-bold text-zinc-800 tracking-tight ml-3">
                        Tax Inference
                    </h1>
                </div>
                <p className="text-zinc-600 leading-relaxed">
                    Your friendly guide to US tax research. Ready to dive in?
                    <br />
                    Just tell me about your tax situation or upload any relevant documents to get started.
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;