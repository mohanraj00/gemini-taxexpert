
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
        <div className="border-t-4 border-emerald-400 mt-4 p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center text-sm font-semibold text-emerald-800">
                    <ClipboardIcon className="h-5 w-5 mr-2 text-emerald-600" />
                    Here Are the Key Facts
                </h3>
            </div>
            <div className="space-y-4">
                {facts.map((category, index) => (
                    <div key={index} className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
                        <h4 className="text-sm font-semibold text-zinc-700 px-4 py-2 bg-zinc-100 border-b border-zinc-200">{category.category}</h4>
                        <dl className="p-4 space-y-3">
                            {category.facts.map((fact, factIndex) => (
                                <div key={factIndex} className="grid grid-cols-3 gap-4 items-start text-sm">
                                    <dt className="col-span-1 text-zinc-600 break-words">{fact.label}</dt>
                                    <dd className="col-span-2 font-medium text-zinc-900 break-words">{fact.value}</dd>
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
