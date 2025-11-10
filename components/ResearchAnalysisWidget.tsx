
import React from 'react';
import { ResearchAnalysis } from '../types';
import { BookOpenIcon, ScaleIcon, BeakerIcon, LightBulbIcon } from './icons/Icons';

interface ResearchAnalysisWidgetProps {
    analysis: ResearchAnalysis;
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mt-4">
        <h4 className="flex items-center text-sm font-semibold text-zinc-700 mb-2">
            {icon}
            {title}
        </h4>
        <div className="pl-7 text-sm text-zinc-600 space-y-2">
            {children}
        </div>
    </div>
);

const ResearchAnalysisWidget: React.FC<ResearchAnalysisWidgetProps> = ({ analysis }) => {
    if (!analysis) {
        return null;
    }

    return (
        <div className="border-t-4 border-orange-400 mt-4 p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="flex items-center text-sm font-semibold text-orange-800">
                    <BookOpenIcon className="h-5 w-5 mr-2 text-orange-500" />
                    Research Analysis: {analysis.situationTitle}
                </h3>
            </div>
            <div className="p-4 rounded-lg bg-white border border-zinc-200">
                <p className="text-sm text-zinc-800 italic leading-relaxed">"{analysis.summary}"</p>

                <Section title="Applicable Law & Regulations" icon={<ScaleIcon className="h-5 w-5 mr-2 text-zinc-500" />}>
                    <ul className="list-none space-y-2">
                        {analysis.applicableLaw.map((law, index) => (
                            <li key={index} className="border-l-2 border-zinc-200 pl-3">
                                <p className="font-semibold text-zinc-800">{law.citation}</p>
                                <p>{law.description}</p>
                            </li>
                        ))}
                    </ul>
                </Section>
                
                <Section title="Key Implications" icon={<BeakerIcon className="h-5 w-5 mr-2 text-zinc-500" />}>
                    <ul className="list-disc list-outside pl-5 space-y-2">
                        {analysis.keyImplications.map((item, index) => (
                           <li key={index}>
                                {item.implication}
                                {item.justification && (
                                    <p className="text-xs text-zinc-500 italic mt-1 pl-2 border-l-2 border-zinc-200">
                                        Source: {item.justification.url ? (
                                            <a href={item.justification.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                                                {item.justification.text}
                                            </a>
                                        ) : item.justification.text}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section title="Planning Opportunities" icon={<LightBulbIcon className="h-5 w-5 mr-2 text-zinc-500" />}>
                     <ul className="list-disc list-outside pl-5 space-y-2">
                        {analysis.planningOpportunities.map((item, index) => (
                           <li key={index}>
                                {item.opportunity}
                                {item.justification && (
                                    <p className="text-xs text-zinc-500 italic mt-1 pl-2 border-l-2 border-zinc-200">
                                        Source: {item.justification.url ? (
                                            <a href={item.justification.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                                                {item.justification.text}
                                            </a>
                                        ) : item.justification.text}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>
            </div>
        </div>
    );
};

export default ResearchAnalysisWidget;