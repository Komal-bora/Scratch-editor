import { useDrop } from "react-dnd";
import { ItemTypes } from "../dnd/ItemTypes";
import { useState, useRef, useEffect, useCallback } from "react";
import { MotionBlock } from "../types/MotionBlock";
import { Sprite, resetSprite } from "../types/Sprite";
import { useMotionExecution } from "../hooks/useMotionExecution";
import SpriteWithOverlays from "./SpriteWithOverlays";
import SpriteBlocks from "./SpriteBlocks";
import car1 from '../assets/car1.png';
import car2 from '../assets/car2.png';

interface Props {
  sprites: Sprite[];
  onSpritesUpdate: (sprites: Sprite[]) => void;
  heroMode: boolean;
  selectedSprite: string;
  playAllTrigger?: number;
  resetAllTrigger?: number;
  onExecutionChange?: (isExecuting: boolean) => void;
}

export default function SpriteCanvas({ 
  sprites,
  onSpritesUpdate,
  heroMode, 
  selectedSprite, 
  playAllTrigger = 0,
  resetAllTrigger = 0,
  onExecutionChange
}: Props) {
  const [motionBlocks, setMotionBlocks] = useState<MotionBlock[]>([]);
  const [collisions, setCollisions] = useState<string[]>([]); // Track colliding sprite pairs
  const [collisionAnimations, setCollisionAnimations] = useState<{[key: string]: boolean}>({}); // Track swap animations
  
  // Additional Debug Logs for monitoring state
  console.log("Current Sprites State:", sprites);
  console.log("Current Motion Blocks:", motionBlocks);
  
  const ref = useRef<HTMLDivElement | null>(null);
  
  // Convert sprites to the format expected by useMotionExecution
  const spritePositions = sprites.map(sprite => ({
    id: sprite.id,
    x: sprite.x,
    y: sprite.y,
    rotation: sprite.rotation
  }));
  
  const setSpritePositions = useCallback((updateFn: any) => {
    if (typeof updateFn === 'function') {
      const currentPositions = sprites.map(sprite => ({
        id: sprite.id,
        x: sprite.x,
        y: sprite.y,
        rotation: sprite.rotation
      }));
      const newPositions = updateFn(currentPositions);
      const updatedSprites = sprites.map(sprite => {
        const newPos = newPositions.find((pos: any) => pos.id === sprite.id);
        if (newPos && (newPos.x !== sprite.x || newPos.y !== sprite.y || newPos.rotation !== sprite.rotation)) {
          console.log(`🚗 Dynamic update: ${sprite.id} (${sprite.x.toFixed(1)}, ${sprite.y.toFixed(1)}, ${sprite.rotation.toFixed(1)}°) → (${newPos.x.toFixed(1)}, ${newPos.y.toFixed(1)}, ${newPos.rotation.toFixed(1)}°)`);
        }
        return newPos ? { ...sprite, x: newPos.x, y: newPos.y, rotation: newPos.rotation } : sprite;
      });
      onSpritesUpdate(updatedSprites);
    }
  }, [sprites, onSpritesUpdate]);

  const { isExecuting, executionStatus, executeAllBlocks, executeAllSprites, stopAllExecution} = useMotionExecution(
    spritePositions,
    setSpritePositions
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.MOTION_BLOCK, ItemTypes.SPRITE],
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && monitor.getItemType() === ItemTypes.MOTION_BLOCK && item.motionType) {
        const newBlock: MotionBlock = {
          id: `${item.spriteId}_${item.category || 'motion'}_${Date.now()}`,
          type: item.motionType,
          category: item.category || 'motion',
          spriteId: item.spriteId,
          label: item.label,
          value: item.value,
          x: item.x,
          y: item.y,
          text: item.text, // For "say" and "think" blocks
          duration: item.duration, // For "say" and "think" blocks
          order: motionBlocks.filter(b => b.spriteId === item.spriteId && b.category === (item.category || 'motion')).length
        };
        console.log(`🎯 New enhanced motion block created:`, newBlock);
        console.log(`📝 Enhanced block details: type=${newBlock.type}, value=${newBlock.value}, spriteId=${newBlock.spriteId}`);
        setMotionBlocks(prev => {
          const updatedBlocks = [...prev, newBlock];
          
          // Auto-execute the new block immediately after dropping for dynamic feedback
          setTimeout(() => {
            console.log(`🚀 Auto-executing enhanced new block for sprite ${item.spriteId}`);
            executeAllBlocks(item.spriteId, [newBlock]); // Execute just the new block for immediate feedback
          }, 100); // Slightly longer delay for better user experience
          
          return updatedBlocks;
        });
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  const handleSpriteMove = (id: string, x: number, y: number) => {
    const updatedSprites = sprites.map(sprite => 
      sprite.id === id ? { ...sprite, x, y } : sprite
    );
    onSpritesUpdate(updatedSprites);
    
    // Trigger collision detection immediately after movement
    if (heroMode) {
      setTimeout(() => detectCollisions(), 50);
    }
  };

  const handleAddBlock = (block: MotionBlock) => {
    setMotionBlocks(prev => [...prev, block]);
  };

  const handleRemoveBlock = (blockId: string) => {
    setMotionBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const handleClearMotionBlocks = (spriteId: string) => {
    setMotionBlocks(prev => prev.filter(block => 
      !(block.spriteId === spriteId && block.category === 'motion')
    ));
  };

  const handleClearLooksBlocks = (spriteId: string) => {
    setMotionBlocks(prev => prev.filter(block => 
      !(block.spriteId === spriteId && block.category === 'looks')
    ));
  };

  const handleRunSprite = async (spriteId: string) => {
    if (isExecuting[spriteId]) {
      return;
    }
    await executeAllBlocks(spriteId, motionBlocks);
  };

  const handlePlayAll = useCallback(async () => {
    // Prevent execution if already running
    const anyExecuting = Object.values(isExecuting).some(Boolean);
    if (anyExecuting) {
      console.log('⏸️  Some sprites are already executing, skipping play all');
      return;
    }
    
    if (motionBlocks.length === 0) {
      console.log('📭 No motion blocks to execute');
      return;
    }
    
    console.log('🎭 Play All button pressed - executing all sprite blocks');
    await executeAllSprites(motionBlocks);
  }, [executeAllSprites, motionBlocks, isExecuting]);

  const handleResetAll = useCallback(() => {
    console.log('🔄 Reset All button pressed - stopping execution and clearing blocks');
    
    // Stop all running executions
    stopAllExecution();
    
    // Reset all motion blocks and restore original sprite positions
    setMotionBlocks([]);
    const resetSprites = sprites.map(sprite => resetSprite(sprite));
    onSpritesUpdate(resetSprites);
  }, [sprites, onSpritesUpdate, stopAllExecution]);

  useEffect(() => {
    if (ref.current) drop(ref.current);
  }, [ref, drop]);

  // Listen for play all trigger
  useEffect(() => {
    if (playAllTrigger > 0) {
      handlePlayAll();
    }
  }, [playAllTrigger, handlePlayAll]);

  // Listen for reset all trigger
  useEffect(() => {
    if (resetAllTrigger > 0) {
      handleResetAll();
    }
  }, [resetAllTrigger, handleResetAll]);

  // Notify parent about execution state changes
  useEffect(() => {
    const anyExecuting = Object.values(isExecuting).some(Boolean);
    onExecutionChange?.(anyExecuting);
  }, [isExecuting, onExecutionChange]);

  // Handle collision effects with swap animation
  const handleCollision = useCallback((sprite1: Sprite, sprite2: Sprite) => {
    console.log(`🎯 Collision detected between ${sprite1.name} and ${sprite2.name}!`);
    
    // Add collision visual effect
    const collisionId = `${sprite1.id}-${sprite2.id}`;
    if (!collisions.includes(collisionId)) {
      setCollisions(prev => [...prev, collisionId]);
      
      // Trigger swap animation
      setCollisionAnimations(prev => ({
        ...prev,
        [sprite1.id]: true,
        [sprite2.id]: true
      }));
      
      // Collision swap block direction logic - reverse move block directions
      if (heroMode) {
        setMotionBlocks(prev => prev.map(block => {
          if (block.type === 'move') {
            if (block.spriteId === sprite1.id) {
              return { ...block, value: -(block.value || 0) };
            }
            if (block.spriteId === sprite2.id) {
              return { ...block, value: -(block.value || 0) };
            }
          }
          return block;
        }));
      }
      
      // Swap positions with animation
      if (heroMode) {
        // Create smooth swap animation by updating positions
        const swapDuration = 800; // 800ms animation
        const steps = 20;
        const stepDuration = swapDuration / steps;
        
        let currentStep = 0;
        const swapInterval = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          
          // Easing function for smooth animation
          const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const easedProgress = easeInOut(progress);
          
          const updatedSprites = sprites.map(sprite => {
            if (sprite.id === sprite1.id) {
              return {
                ...sprite,
                x: sprite1.x + (sprite2.x - sprite1.x) * easedProgress,
                y: sprite1.y + (sprite2.y - sprite1.y) * easedProgress,
                rotation: sprite.rotation + (360 * easedProgress) // Add spinning effect
              };
            } else if (sprite.id === sprite2.id) {
              return {
                ...sprite,
                x: sprite2.x + (sprite1.x - sprite2.x) * easedProgress,
                y: sprite2.y + (sprite1.y - sprite2.y) * easedProgress,
                rotation: sprite.rotation - (360 * easedProgress) // Spin in opposite direction
              };
            }
            return sprite;
          });
          
          onSpritesUpdate(updatedSprites);
          
          if (currentStep >= steps) {
            clearInterval(swapInterval);
            
            // Clear collision animations
            setCollisionAnimations(prev => ({
              ...prev,
              [sprite1.id]: false,
              [sprite2.id]: false
            }));
          }
        }, stepDuration);
      }
      
      // Play collision sound effect (optional - would need audio file)
      // const audio = new Audio('/collision-sound.mp3');
      // audio.play().catch(() => {}); // Ignore audio errors
      
      // Remove collision after animation completes
      setTimeout(() => {
        setCollisions(prev => prev.filter(id => id !== collisionId));
      }, 1000);
    }
  }, [collisions, heroMode, sprites, onSpritesUpdate]);

  // Collision detection function
  const detectCollisions = useCallback(() => {
    if (!heroMode) return [];
    
    const newCollisions: string[] = [];
    const spriteSize = 64; // Standard sprite size in pixels
    const collisionThreshold = spriteSize * 0.8; // 80% overlap for collision
    
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const sprite1 = sprites[i];
        const sprite2 = sprites[j];
        
        // Calculate distance between sprite centers
        const deltaX = sprite1.x - sprite2.x;
        const deltaY = sprite1.y - sprite2.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Check if sprites are colliding
        if (distance < collisionThreshold) {
          const collisionId = `${sprite1.id}-${sprite2.id}`;
          newCollisions.push(collisionId);
          
          // Trigger collision effects
          handleCollision(sprite1, sprite2);
        }
      }
    }
    
    return newCollisions;
  }, [sprites, heroMode, handleCollision]);

  // Continuous collision detection when hero mode is active
  useEffect(() => {
    if (!heroMode) {
      setCollisions([]); // Clear collisions when hero mode is disabled
      setCollisionAnimations({}); // Clear animations
      return;
    }
    
    // Continuous collision checking every 100ms when hero mode is active
    const collisionInterval = setInterval(() => {
      detectCollisions();
    }, 100);
    
    return () => clearInterval(collisionInterval);
  }, [heroMode, detectCollisions]);

  // Additional immediate collision check when sprites change position
  useEffect(() => {
    if (!heroMode) return;
    
    // Immediate collision check when sprites change position
    const timeoutId = setTimeout(() => {
      detectCollisions();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [sprites, heroMode, detectCollisions]);

  return (
    <div
      ref={ref}
      className={`relative w-full h-full min-h-[500px] border-2 rounded-lg transition-all duration-300 ${
        isOver 
          ? "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg" 
          : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm"
      }`}
    >
      {/* Canvas Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-white bg-opacity-80 px-3 py-1 rounded-full shadow-sm">
          <p className="text-sm font-medium text-gray-700">Sprite Canvas</p>
        </div>
        <div className="flex gap-2">
          {heroMode && (
            <div className="bg-orange-100 bg-opacity-90 px-3 py-1 rounded-full shadow-sm border border-orange-300">
              <p className="text-xs text-orange-700">
                🦸 Hero Mode: Collision Detection Active
              </p>
            </div>
          )}
          <div className="bg-white bg-opacity-80 px-3 py-1 rounded-full shadow-sm">
            <p className="text-xs text-gray-600">
              Selected: <span className="font-medium text-blue-600">{selectedSprite}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sprites */}
      {sprites.map((sprite) => {
        // Check if this sprite is currently colliding
        const isColliding = collisions.some(collisionId => 
          collisionId.includes(sprite.id)
        );
        
        // Check if this sprite is animating from collision
        const isAnimating = collisionAnimations[sprite.id] || false;
        
        return (
          <SpriteWithOverlays
            key={sprite.id}
            sprite={{
              id: sprite.id,
              x: sprite.x,
              y: sprite.y,
              rotation: sprite.rotation
            }}
            src={sprite.id === 'car1' ? car1 : sprite.id === 'car2' ? car2 : car1} // Default to car1 for new sprites
            selectedSprite={selectedSprite}
            isExecuting={isExecuting[sprite.id] || false}
            executionStatus={executionStatus[sprite.id] || null}
            onMove={handleSpriteMove}
            canvasRef={ref}
            isColliding={isColliding}
            isAnimating={isAnimating}
          />
        );
      })}

      {/* Motion Blocks Area - Compact Version */}
      <div className="absolute bottom-16 left-4 right-4">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-2 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="font-semibold text-sm text-gray-800">Sprite Programming</p>
              {heroMode && collisions.length > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  {collisions.length} Collision{collisions.length !== 1 ? 's' : ''}!
                </span>
              )}
              {heroMode && Object.values(collisionAnimations).some(Boolean) && (
                <span className="ml-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                  🔄 Swapping!
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {sprites.slice(0, 4).map((sprite) => {
              const spriteMotionBlocks = motionBlocks.filter(block => 
                block.spriteId === sprite.id && block.category === 'motion'
              );
              const spriteLooksBlocks = motionBlocks.filter(block => 
                block.spriteId === sprite.id && block.category === 'looks'
              );
              
              return (
                <SpriteBlocks
                  key={sprite.id}
                  spriteId={sprite.id}
                  spriteName={sprite.name}
                  motionBlocks={spriteMotionBlocks}
                  looksBlocks={spriteLooksBlocks}
                  onAddBlock={handleAddBlock}
                  onRemoveBlock={handleRemoveBlock}
                  onClearMotion={() => handleClearMotionBlocks(sprite.id)}
                  onClearLooks={() => handleClearLooksBlocks(sprite.id)}
                  onRunSprite={() => handleRunSprite(sprite.id)}
                  isExecuting={isExecuting[sprite.id] || false}
                />
              );
            })}
          </div>
          
          {sprites.length > 4 && (
            <div className="text-center text-xs text-gray-500 mt-1">
              Showing first 4 sprites. Total: {sprites.length}
            </div>
          )}
        </div>
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
}
