import React, { useState, useRef } from 'react';
import { SparklesIcon, LoadingSpinner, PaperclipIcon, XCircleIcon } from './icons/Icons';

interface ScenarioInputProps {
  onAnalyze: (scenario: string, file?: File) => void;
  isLoading: boolean;
}

const ScenarioInput: React.FC<ScenarioInputProps> = ({ onAnalyze, isLoading }) => {
  const [scenario, setScenario] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(scenario, file || undefined);
  };
  
  const handleFileButtonClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
          setFile(selectedFile);
      } else if (selectedFile) {
          alert("Please upload a PDF file.");
      }
  };

  const removeFile = () => {
    setFile(null);
    if(fileInputRef.current){
        fileInputRef.current.value = "";
    }
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit}>
        <label htmlFor="tax-scenario" className="block text-lg font-semibold text-slate-700 mb-2">
          Describe the Tax Scenario
        </label>
        <p className="text-sm text-slate-500 mb-4">
          Provide details below, or upload a PDF document containing the client's situation. The AI will analyze the content to begin the research process.
        </p>
        <textarea
          id="tax-scenario"
          rows={8}
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          placeholder="e.g., A client sold their primary residence for $800,000. They bought it 10 years ago for $300,000..."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          disabled={isLoading}
        />
        <div className="mt-4 flex items-center justify-between">
            <div>
                 <input 
                    type="file" 
                    accept="application/pdf"
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={handleFileButtonClick}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                    <PaperclipIcon className="-ml-1 mr-2 h-5 w-5 text-slate-500" />
                    Upload PDF
                </button>
                {file && (
                    <div className="mt-2 text-sm text-slate-600 inline-flex items-center ml-4 p-2 bg-slate-100 rounded-md">
                        <span>{file.name}</span>
                        <button onClick={removeFile} type="button" className="ml-2 text-slate-500 hover:text-slate-700">
                            <XCircleIcon className="h-5 w-5"/>
                        </button>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || (!scenario.trim() && !file)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                <>
                    <LoadingSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Analyzing...
                </>
                ) : (
                <>
                    <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                    Analyze Scenario
                </>
                )}
            </button>
        </div>
      </form>
    </section>
  );
};

export default ScenarioInput;
