import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '../dnd/ItemTypes';
import { MotionBlock } from '../types/MotionBlock';

/**
 * SpriteBlocks Component
 * 
 * This component pro              <div className="space-y-1">
                {looksBlocks.slice(0, 2).map((block, idx) => {
                  // Generate display text based on block type and values
                  let displayText = `${idx + 1}. ${block.label}`;
                  if (block.type === 'say') {
                    displayText = `${idx + 1}. Say "${block.text || 'Hello'}" (${block.duration || 2}s)`;
                  } else if (block.type === 'think') {
                    displayText = `${idx + 1}. Think "${block.text || 'Hmm'}" (${block.duration || 2}s)`;
                  }
                  
                  return (
                    <div key={block.id} className="flex justify-between items-center bg-white border rounded px-1 py-1 shadow-sm">
                      <span className="text-xs font-medium flex-1 truncate">{displayText}</span>
                      <button
                        onClick={() => onRemoveBlock(block.id)}
                        className="text-red-500 hover:text-red-700 text-xs ml-1"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}ndent Motion and Looks block functionality for each sprite.
 * Each sprite has its own:
 * - Motion blocks drop zone and list (move, turn, goto, repeat)
 * - Looks blocks drop zone and list (say, think)
 * - Individual run/clear controls
 * - Execution state tracking
 * 
 * The component ensures complete isolation between sprites - blocks dropped for one sprite
 * will not affect any other sprite's blocks or execution.
 */

interface SpriteBlocksProps {
  spriteId: string;
  spriteName: string;
  motionBlocks: MotionBlock[];
  looksBlocks: MotionBlock[];
  onAddBlock: (block: MotionBlock) => void;
  onRemoveBlock: (blockId: string) => void;
  onClearMotion: () => void;
  onClearLooks: () => void;
  onRunSprite: () => void;
  isExecuting: boolean;
}

export default function SpriteBlocks({ 
  spriteId,
  spriteName,
  motionBlocks,
  looksBlocks,
  onAddBlock,
  onRemoveBlock,
  onClearMotion,
  onClearLooks,
  onRunSprite,
  isExecuting
}: SpriteBlocksProps) {
  const motionDropRef = useRef<HTMLDivElement>(null);
  const looksDropRef = useRef<HTMLDivElement>(null);

  // Motion blocks drop zone
  const [{ isOverMotion }, dropMotion] = useDrop(() => ({
    accept: ItemTypes.MOTION_BLOCK,
    drop: (item: any) => {
      if (item.motionType && ['move', 'turn', 'goto', 'repeat'].includes(item.motionType)) {
        const newBlock: MotionBlock = {
          id: `${spriteId}_motion_${Date.now()}`,
          type: item.motionType,
          category: 'motion',
          spriteId: spriteId,
          label: item.label,
          value: item.value,
          x: item.x,
          y: item.y,
          order: motionBlocks.length
        };
        onAddBlock(newBlock);
      }
    },
    collect: (monitor) => ({
      isOverMotion: monitor.isOver(),
    }),
  }), [spriteId, motionBlocks.length]);

  // Looks blocks drop zone
  const [{ isOverLooks }, dropLooks] = useDrop(() => ({
    accept: ItemTypes.MOTION_BLOCK,
    drop: (item: any) => {
      if (item.motionType && ['say', 'think'].includes(item.motionType)) {
        const newBlock: MotionBlock = {
          id: `${spriteId}_looks_${Date.now()}`,
          type: item.motionType,
          category: 'looks',
          spriteId: spriteId,
          label: item.label,
          text: item.text,
          duration: item.duration,
          order: looksBlocks.length
        };
        onAddBlock(newBlock);
      }
    },
    collect: (monitor) => ({
      isOverLooks: monitor.isOver(),
    }),
  }), [spriteId, looksBlocks.length]);

  useEffect(() => {
    if (motionDropRef.current) dropMotion(motionDropRef.current);
  }, [dropMotion]);

  useEffect(() => {
    if (looksDropRef.current) dropLooks(looksDropRef.current);
  }, [dropLooks]);

  const getSpriteColors = (spriteId: string) => {
    if (spriteId === 'car1') {
      return { primary: 'blue', bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800' };
    } else if (spriteId === 'car2') {
      return { primary: 'green', bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800' };
    } else {
      // Generate dynamic colors for new sprites based on their ID
      const colors = ['purple', 'orange', 'pink', 'indigo', 'teal', 'red', 'yellow'];
      const hash = spriteId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      const colorIndex = Math.abs(hash) % colors.length;
      const color = colors[colorIndex];
      return { 
        primary: color, 
        bg: `bg-${color}-50`, 
        border: `border-${color}-400`, 
        text: `text-${color}-800` 
      };
    }
  };

  const colors = getSpriteColors(spriteId);

  return (
    <div className={`border rounded-lg p-2 ${colors.bg} ${colors.border}`}>
      {/* Sprite Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-sm ${colors.text} flex items-center gap-1`}>
          <div className={`w-2 h-2 bg-${colors.primary}-500 rounded-full`}></div>
          {spriteName}
        </h3>
        <button
          onClick={onRunSprite}
          disabled={isExecuting}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            isExecuting 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : `bg-${colors.primary}-500 hover:bg-${colors.primary}-600 text-white`
          }`}
        >
          {isExecuting ? 'Running...' : 'Run'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* Motion Blocks Section - Compact */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-xs ${colors.text} flex items-center gap-1`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Motion ({motionBlocks.length})
            </h4>
            {motionBlocks.length > 0 && (
              <button
                onClick={onClearMotion}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            )}
          </div>
          
          <div
            ref={motionDropRef}
            className={`min-h-12 border-2 border-dashed rounded p-1 transition-all ${
              isOverMotion 
                ? `border-${colors.primary}-400 bg-${colors.primary}-100` 
                : `border-${colors.primary}-300 bg-white`
            }`}
          >
            {motionBlocks.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-1">
                Drop Motion blocks
              </p>
            ) : (
              <div className="space-y-1">
                {motionBlocks.slice(0, 2).map((block, idx) => {
                  // Generate display text based on block type and values
                  let displayText = `${idx + 1}. ${block.label}`;
                  if (block.type === 'move') {
                    displayText = `${idx + 1}. Move ${block.value || 0} steps`;
                  } else if (block.type === 'turn') {
                    displayText = `${idx + 1}. Turn ${block.value || 0}°`;
                  } else if (block.type === 'goto') {
                    displayText = `${idx + 1}. Go to (${block.x || 0}, ${block.y || 0})`;
                  } else if (block.type === 'say') {
                    displayText = `${idx + 1}. Say "${block.text || 'Hello'}"`;
                  } else if (block.type === 'think') {
                    displayText = `${idx + 1}. Think "${block.text || 'Hmm'}"`;
                  }
                  
                  return (
                    <div key={block.id} className="flex justify-between items-center bg-white border rounded px-1 py-1 shadow-sm">
                      <span className="text-xs font-medium flex-1 truncate">{displayText}</span>
                      <button
                        onClick={() => onRemoveBlock(block.id)}
                        className="text-red-500 hover:text-red-700 text-xs ml-1"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                {motionBlocks.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{motionBlocks.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Looks Blocks Section - Compact */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-xs ${colors.text} flex items-center gap-1`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Looks ({looksBlocks.length})
            </h4>
            {looksBlocks.length > 0 && (
              <button
                onClick={onClearLooks}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            )}
          </div>
          
          <div
            ref={looksDropRef}
            className={`min-h-12 border-2 border-dashed rounded p-1 transition-all ${
              isOverLooks 
                ? 'border-purple-400 bg-purple-100' 
                : 'border-purple-300 bg-white'
            }`}
          >
            {looksBlocks.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-1">
                Drop Looks blocks
              </p>
            ) : (
              <div className="space-y-1">
                {looksBlocks.slice(0, 2).map((block, idx) => (
                  <div key={block.id} className="flex justify-between items-center bg-white border rounded px-1 py-1 shadow-sm">
                    <span className="text-xs font-medium flex-1 truncate">{idx + 1}. {block.label}</span>
                    <button
                      onClick={() => onRemoveBlock(block.id)}
                      className="text-red-500 hover:text-red-700 text-xs ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {looksBlocks.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{looksBlocks.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
