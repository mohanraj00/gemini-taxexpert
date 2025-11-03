
import React from 'react';
import { KeyFactCategory } from '../types';
import { ClipboardIcon } from './icons/Icons';

interface KeyFactsWidgetProps {
    facts: KeyFactCategory[];
}

const KeyFactsWidget: React.FC<KeyFactsWidgetProps> = ({ facts }) => {
    if (!facts || facts.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-slate-200 mt-4 p-4 bg-teal-50">
            <h3 className="flex items-center text-sm font-semibold text-teal-800 mb-4">
                <ClipboardIcon className="h-5 w-5 mr-2 text-teal-600" />
                Here Are the Key Facts
            </h3>
            <div className="space-y-4">
                {facts.map((category, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                        <h4 className="text-sm font-semibold text-slate-700 px-4 py-2 bg-teal-100 border-b border-slate-200">{category.category}</h4>
                        <dl className="p-4 space-y-2">
                            {category.facts.map((fact, factIndex) => (
                                <div key={factIndex} className="flex items-start text-sm">
                                    <dt className="w-1/4 flex-shrink-0 text-slate-600 break-words pr-4">{fact.label}</dt>
                                    <dd className="flex-1 font-medium text-slate-900 break-words">{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KeyFactsWidget;
