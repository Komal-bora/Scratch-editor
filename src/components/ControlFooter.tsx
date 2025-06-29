interface ControlFooterProps {
  onPlayAll: () => void;
  onResetAll: () => void;
  isExecuting: boolean;
  heroMode: boolean;
  setHeroMode: (val: boolean) => void;
}

export default function ControlFooter({ 
  onPlayAll, 
  onResetAll, 
  isExecuting, 
  heroMode, 
  setHeroMode 
}: ControlFooterProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Play All Button */}
          <button 
            onClick={onPlayAll}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              isExecuting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 hover:scale-105 shadow-md hover:shadow-lg'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {isExecuting ? 'Running...' : 'Play All'}
          </button>

          {/* Reset All Button */}
          <button 
            onClick={onResetAll}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset All
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Hero Mode Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Hero Mode</label>
            <button
              onClick={() => setHeroMode(!heroMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                heroMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  heroMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
