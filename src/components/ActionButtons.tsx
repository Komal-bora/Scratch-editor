interface Props {
  heroMode: boolean;
  setHeroMode: (val: boolean) => void;
  onPlayAll: () => void;
  onResetAll: () => void;
  isExecuting: boolean;
}

export default function ActionButtons({ 
  heroMode, 
  setHeroMode, 
  onPlayAll, 
  onResetAll, 
  isExecuting 
}: Props) {
  return (
    <div className="absolute bottom-2 left-2 flex space-x-2">
      <button 
        onClick={onPlayAll}
        disabled={isExecuting}
        className={`px-3 py-1 rounded text-white text-sm transition-colors ${
          isExecuting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isExecuting ? 'Running...' : 'Play All'}
      </button>
      <button 
        onClick={onResetAll}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
      >
        Reset All
      </button>
      <label className="flex items-center space-x-1 text-sm">
        <input 
          type="checkbox" 
          checked={heroMode} 
          onChange={() => setHeroMode(!heroMode)} 
          className="rounded"
        />
        <span className="text-gray-700">Hero Mode</span>
      </label>
    </div>
  );
}
