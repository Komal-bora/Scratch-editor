import React from 'react';
import DraggableSprite from './DraggableSprite';

interface ExecutionStatus {
  currentStep: number;
  totalSteps: number;
  blockName: string;
}

interface SpriteWithOverlaysProps {
  sprite: {
    id: string;
    x: number;
    y: number;
    rotation: number;
  };
  src: string;
  selectedSprite: string;
  isExecuting: boolean;
  executionStatus: ExecutionStatus | null;
  onMove: (id: string, x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isColliding?: boolean; // New prop for collision detection
  isAnimating?: boolean; // New prop for swap animation
}

export default function SpriteWithOverlays({
  sprite,
  src,
  selectedSprite,
  isExecuting,
  executionStatus,
  onMove,
  canvasRef,
  isColliding = false,
  isAnimating = false
}: SpriteWithOverlaysProps) {
  return (
    <div key={sprite.id} className="relative">
      <DraggableSprite
        id={sprite.id}
        src={src}
        alt={sprite.id}
        x={sprite.x}
        y={sprite.y}
        onMove={onMove}
        canvasRef={canvasRef}
        rotation={sprite.rotation}
      />
      
      {/* Selection highlight */}
      {selectedSprite === sprite.id && (
        <div
          className="absolute border-3 border-blue-500 rounded-xl pointer-events-none animate-pulse shadow-lg"
          style={{
            left: sprite.x - 4,
            top: sprite.y - 4,
            width: 104,
            height: 104,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        />
      )}
      
      {/* Execution highlight */}
      {isExecuting && (
        <>
          <div
            className="absolute border-3 border-green-400 rounded-xl pointer-events-none animate-ping shadow-lg"
            style={{
              left: sprite.x - 6,
              top: sprite.y - 6,
              width: 108,
              height: 108,
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.7)',
            }}
          />
          
          {/* Step counter display during execution */}
          {executionStatus && !executionStatus.blockName.includes('completed') && 
           !executionStatus.blockName.startsWith('"') && !executionStatus.blockName.startsWith('*') && (
            <div
              className="absolute bg-green-500 text-white px-3 py-2 rounded-md text-xs font-bold shadow-lg pointer-events-none"
              style={{
                left: sprite.x + 48 - 40,
                top: sprite.y - 35,
                transform: 'translateX(-50%)',
                zIndex: 10,
                minWidth: '120px'
              }}
            >
              <div className="text-center">
                <div className="text-xs">{executionStatus.blockName}</div>
                <div className="text-xs mt-1">Step {executionStatus.currentStep} / {executionStatus.totalSteps}</div>
              </div>
            </div>
          )}
          
          {/* Speech bubble for "say" blocks */}
          {executionStatus && executionStatus.blockName.startsWith('"') && (
            <div
              className="absolute bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg pointer-events-none border-2 border-gray-300 animate-bounce"
              style={{
                left: sprite.x + 48 - 40,
                top: sprite.y - 45,
                transform: 'translateX(-50%)',
                zIndex: 10,
                minWidth: '100px',
                maxWidth: '200px'
              }}
            >
              <div className="text-center text-sm font-medium">
                {executionStatus.blockName}
              </div>
              {/* Speech bubble tail */}
              <div 
                className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
                style={{
                  left: '50%',
                  bottom: '-8px',
                  transform: 'translateX(-50%)'
                }}
              />
              <div 
                className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-300"
                style={{
                  left: '50%',
                  bottom: '-10px',
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          )}
          
          {/* Thought bubble for "think" blocks */}
          {executionStatus && executionStatus.blockName.startsWith('*') && (
            <div
              className="absolute bg-blue-50 text-gray-700 px-3 py-2 rounded-full shadow-lg pointer-events-none border-2 border-blue-200 animate-pulse"
              style={{
                left: sprite.x + 48 - 40,
                top: sprite.y - 45,
                transform: 'translateX(-50%)',
                zIndex: 10,
                minWidth: '100px',
                maxWidth: '200px'
              }}
            >
              <div className="text-center text-sm font-medium italic">
                {executionStatus.blockName.slice(1, -1)} {/* Remove asterisks */}
              </div>
              {/* Thought bubble circles */}
              <div 
                className="absolute w-3 h-3 bg-blue-50 border-2 border-blue-200 rounded-full"
                style={{
                  left: '50%',
                  bottom: '-12px',
                  transform: 'translateX(-50%)'
                }}
              />
              <div 
                className="absolute w-2 h-2 bg-blue-50 border border-blue-200 rounded-full"
                style={{
                  left: '45%',
                  bottom: '-20px',
                  transform: 'translateX(-50%)'
                }}
              />
              <div 
                className="absolute w-1 h-1 bg-blue-200 rounded-full"
                style={{
                  left: '40%',
                  bottom: '-25px',
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          )}
        </>
      )}
      
      {/* Completion message (shown after execution stops) */}
      {!isExecuting && executionStatus && executionStatus.blockName.includes('completed') && (
        <div
          className="absolute bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-bold shadow-lg pointer-events-none animate-bounce"
          style={{
            left: sprite.x + 48 - 40,
            top: sprite.y - 35,
            transform: 'translateX(-50%)',
            zIndex: 10,
            minWidth: '120px'
          }}
        >
          <div className="text-center">
            <div className="text-xs">{executionStatus.blockName}</div>
          </div>
        </div>
      )}

      {/* Collision highlight */}
      {isColliding && (
        <div
          className="absolute border-4 border-red-500 rounded-xl pointer-events-none animate-pulse shadow-lg"
          style={{
            left: sprite.x - 8,
            top: sprite.y - 8,
            width: 112,
            height: 112,
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.8)',
            animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}

      {/* Swap animation highlight */}
      {isAnimating && (
        <div
          className="absolute border-4 border-purple-500 rounded-xl pointer-events-none shadow-lg"
          style={{
            left: sprite.x - 12,
            top: sprite.y - 12,
            width: 120,
            height: 120,
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.9)',
            animation: 'spin 0.8s linear, pulse 0.4s ease-in-out infinite alternate'
          }}
        />
      )}

      {/* Swap particles effect */}
      {isAnimating && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full pointer-events-none"
              style={{
                left: sprite.x + 32 + Math.cos(i * Math.PI / 3) * 40,
                top: sprite.y + 32 + Math.sin(i * Math.PI / 3) * 40,
                animation: `ping 0.8s ease-out ${i * 0.1}s, fadeOut 0.8s ease-out ${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
