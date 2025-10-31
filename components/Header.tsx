
import React from 'react';
import { ScalesIcon } from './icons/Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <ScalesIcon className="h-8 w-8 text-slate-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-700 tracking-tight">
          AI Tax Research Expert
        </h1>
      </div>
    </header>
  );
};

export default Header;
