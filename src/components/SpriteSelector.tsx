import React from 'react';
import { Sprite } from '../types/Sprite';
import car1 from '../assets/car1.png';
import car2 from '../assets/car2.png';

interface Props {
  sprites: Sprite[];
  selected: string;
  setSelected: (spriteId: string) => void;
  onAddSprite: () => void;
  onDeleteSprite: (spriteId: string) => void;
}

const spriteImages: { [key: string]: string } = {
  'car1': car1,
  'car2': car2,
};

export default function SpriteSelector({ 
  sprites, 
  selected, 
  setSelected, 
  onAddSprite,
  onDeleteSprite 
}: Props) {
  const selectedSprite = sprites.find(s => s.id === selected);

  return (
    <div className="border rounded bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">Sprites</h2>
        <button
          onClick={onAddSprite}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
          title="Add New Sprite"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add
        </button>
      </div>
      
      {/* Sprite Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-3 max-h-32 overflow-y-auto">
        {sprites.map((sprite) => (
          <button
            key={sprite.id}
            onClick={() => setSelected(sprite.id)}
            className={`relative px-2 py-2 rounded text-xs font-medium transition-colors flex flex-col items-center ${
              selected === sprite.id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <img 
              src={spriteImages[sprite.id] || car1} 
              alt={sprite.name} 
              className="w-8 h-auto mb-1"
            />
            <span className="truncate w-full text-center">{sprite.name}</span>
            
            {/* Delete button for non-default sprites */}
            {sprite.id !== 'car1' && sprite.id !== 'car2' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSprite(sprite.id);
                }}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                title="Delete Sprite"
              >
                ×
              </button>
            )}
          </button>
        ))}
      </div>

      {/* Current Sprite Display */}
      {selectedSprite && (
        <div className="bg-white rounded p-3 text-center">
          <div className="mb-2">
            <img 
              src={spriteImages[selectedSprite.id] || car1} 
              alt={selectedSprite.name} 
              className="w-16 h-auto mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {selectedSprite.name} Selected
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Click and drag in canvas to move
          </p>
          <div className="text-xs text-gray-500 mt-2">
            Position: ({Math.round(selectedSprite.x)}, {Math.round(selectedSprite.y)})
          </div>
        </div>
      )}

      {/* Sprite Properties */}
      <div className="mt-3 space-y-2">
        <div className="text-sm">
          <span className="font-medium">Properties:</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Total Sprites: {sprites.length}</div>
          <div>• Size: 64px width</div>
          <div>• Draggable: Yes</div>
        </div>
      </div>
    </div>
  );
}
