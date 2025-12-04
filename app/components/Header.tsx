import React from 'react';

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <button className="p-1 -ml-1" aria-label="Go back">
        <BackArrowIcon />
      </button>
      <h1 className="text-lg font-semibold text-gray-800 text-center flex-grow -ml-6">AI Coach</h1>
    </header>
  );
};

export default Header;
