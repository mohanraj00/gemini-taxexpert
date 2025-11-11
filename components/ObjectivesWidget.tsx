import React from 'react';
import { Objective } from '../types';
import { CheckCircleIcon } from './icons/Icons';

const ObjectivesWidget: React.FC<{ objectives: Objective[] }> = ({ objectives }) => {
    if (!objectives || objectives.length === 0) {
        return null;
    }

    return (
        <div className="border-t-4 border-purple-400 mt-4 p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center text-sm font-semibold text-purple-800">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Proposed Case Objectives
                </h3>
            </div>
            <div className="space-y-3">
                {objectives.map((objective) => (
                    <div key={objective.id} className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm">
                        <p className="font-semibold text-sm text-zinc-800">{objective.title}</p>
                        <p className="text-sm text-zinc-600 mt-1">{objective.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ObjectivesWidget;
