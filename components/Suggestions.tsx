import React from 'react';

interface SuggestionsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4a14.95 14.95 0 0113.138 5.5M20 20a14.95 14.95 0 01-13.138-5.5"></path></svg>
)

const Suggestions: React.FC<SuggestionsProps> = ({ prompts, onSelect }) => {
  return (
    <div className="px-4 pb-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-600">You may ask like this</p>
        <button className="p-1 hover:bg-gray-200 rounded-full"><RefreshIcon/></button>
      </div>
      <div className="flex flex-col gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelect(prompt)}
            className="w-full text-left bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
