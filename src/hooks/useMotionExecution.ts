import { useState, useRef, useCallback } from 'react';
import { MotionBlock } from '../types/MotionBlock';

interface SpritePosition {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

interface ExecutionStatus {
  currentStep: number;
  totalSteps: number;
  blockName: string;
}

// React hook to store animation sequence for each sprite with enhanced dynamic movement
export function useMotionExecution(
  spritePositions: SpritePosition[],
  setSpritePositions: React.Dispatch<React.SetStateAction<SpritePosition[]>>
) {
  const [isExecuting, setIsExecuting] = useState<{ [key: string]: boolean }>({});
  const [executionStatus, setExecutionStatus] = useState<{ 
    [key: string]: ExecutionStatus | null; 
  }>({});
  
  // Keep track of running animations to prevent conflicts
  const animationRefs = useRef<{ [key: string]: number }>({});
  const animationSequences = useRef<{ [key: string]: MotionBlock[] }>({});

  const stopSpriteExecution = useCallback((spriteId: string) => {
    if (animationRefs.current[spriteId]) {
      cancelAnimationFrame(animationRefs.current[spriteId]);
      delete animationRefs.current[spriteId];
    }
    setIsExecuting(prev => ({ ...prev, [spriteId]: false }));
    setExecutionStatus(prev => ({ ...prev, [spriteId]: null }));
    delete animationSequences.current[spriteId];
  }, []);

  // Function to update sprite position with smooth dynamic movement
  const updateSpritePosition = useCallback((spriteId: string, deltaX: number, deltaY: number, deltaRotation: number = 0) => {
    setSpritePositions(prev => {
      return prev.map(sprite => {
        if (sprite.id !== spriteId) return sprite;
        
        let newX = sprite.x + deltaX;
        let newY = sprite.y + deltaY;
        let newRotation = sprite.rotation + deltaRotation;
        
        // Apply canvas boundaries (with sprite size consideration)
        // Boundary check: canvas is sized so that newX max is 468, newY max is 368
        newX = Math.max(0, Math.min(newX, 468)); // Canvas width - sprite size
        newY = Math.max(0, Math.min(newY, 368)); // Canvas height - sprite size
        
        // Normalize rotation to 0-360 range
        while (newRotation < 0) newRotation += 360;
        while (newRotation >= 360) newRotation -= 360;
        
        return { ...sprite, x: newX, y: newY, rotation: newRotation };
      });
    });
  }, [setSpritePositions]);

  // Enhanced easing function for smooth animations
  const easeInOutCubic = useCallback((t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }, []);

  // Function to animate sprite for Say block using setTimeout
  const animateSayBlock = useCallback((block: MotionBlock): Promise<void> => {
    return new Promise((resolve) => {
      const sayText = block.text || "Hello!";
      const sayDuration = (block.duration || 2) * 1000;
      
      console.log(`💬 Starting Say animation: "${sayText}" for ${block.spriteId}`);
      
      setExecutionStatus(prev => ({
        ...prev,
        [block.spriteId]: {
          currentStep: 1,
          totalSteps: 1,
          blockName: `"${sayText}"`
        }
      }));
      
      const timeoutId = setTimeout(() => {
        setExecutionStatus(prev => ({ ...prev, [block.spriteId]: null }));
        console.log(`💬 Say completed for ${block.spriteId}: "${sayText}"`);
        resolve();
      }, sayDuration);
      
      // Store timeout as animation reference for cleanup
      animationRefs.current[block.spriteId] = timeoutId as any;
    });
  }, []);

  const animateThinkBlock = useCallback((block: MotionBlock): Promise<void> => {
    return new Promise((resolve) => {
      const thinkText = block.text || "Hmm...";
      const thinkDuration = (block.duration || 2) * 1000;
      
      console.log(`💭 Starting Think animation: "${thinkText}" for ${block.spriteId}`);
      
      setExecutionStatus(prev => ({
        ...prev,
        [block.spriteId]: {
          currentStep: 1,
          totalSteps: 1,
          blockName: `*${thinkText}*`
        }
      }));
      
      const timeoutId = setTimeout(() => {
        setExecutionStatus(prev => ({ ...prev, [block.spriteId]: null }));
        console.log(`💭 Think completed for ${block.spriteId}: "${thinkText}"`);
        resolve();
      }, thinkDuration);
      
      // Store timeout as animation reference for cleanup
      animationRefs.current[block.spriteId] = timeoutId as any;
    });
  }, []);

  // Enhanced dynamic move block animation with smooth acceleration/deceleration
  const animateMoveBlock = useCallback((block: MotionBlock): Promise<void> => {
    return new Promise((resolve) => {
      const moveDistance = block.value || 10;
      const pixelsPerStep = 20; // Increased for more visible movement
      const totalPixels = Math.abs(moveDistance) * pixelsPerStep;
      const direction = moveDistance > 0 ? 1 : -1;
      const animationDuration = Math.max(1200, Math.abs(moveDistance) * 120); // Longer for smoother animation
      
      console.log(`🚗 Starting enhanced move animation: ${moveDistance} steps for ${block.spriteId}`);
      console.log(`📏 Total pixels to move: ${totalPixels}, Duration: ${animationDuration}ms`);
      
      setExecutionStatus(prev => ({
        ...prev,
        [block.spriteId]: {
          currentStep: 0,
          totalSteps: Math.abs(moveDistance),
          blockName: `Moving ${moveDistance} step${Math.abs(moveDistance) !== 1 ? 's' : ''}`
        }
      }));
      
      const startTime = performance.now();
      let currentStep = 0;
      let totalMoved = 0;
      
      const animateFrame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Use easing function for smooth acceleration/deceleration
        const easedProgress = easeInOutCubic(progress);
        const targetPixels = totalPixels * easedProgress;
        const pixelsToMove = targetPixels - totalMoved;
        
        if (pixelsToMove > 0.1) {
          // Move along X-axis only for forward movement
          const deltaX = pixelsToMove * direction;
          updateSpritePosition(block.spriteId, deltaX, 0);
          totalMoved = targetPixels;
          
          // Update step counter
          const newStepCount = Math.floor((totalMoved / pixelsPerStep));
          if (newStepCount > currentStep) {
            currentStep = newStepCount;
            setExecutionStatus(prev => ({
              ...prev,
              [block.spriteId]: prev[block.spriteId] ? {
                ...prev[block.spriteId]!,
                currentStep: Math.min(currentStep, Math.abs(moveDistance))
              } : null
            }));
          }
        }
        
        if (progress < 1) {
          animationRefs.current[block.spriteId] = requestAnimationFrame(animateFrame);
        } else {
          // Animation completed
          delete animationRefs.current[block.spriteId];
          
          setExecutionStatus(prev => ({
            ...prev,
            [block.spriteId]: {
              currentStep: Math.abs(moveDistance),
              totalSteps: Math.abs(moveDistance),
              blockName: `Moved ${Math.abs(moveDistance)} step${Math.abs(moveDistance) !== 1 ? 's' : ''}!`
            }
          }));
          
          setTimeout(() => {
            setExecutionStatus(prev => ({ ...prev, [block.spriteId]: null }));
            console.log(`✅ Enhanced move animation completed: ${block.spriteId} moved ${Math.abs(moveDistance)} steps (${totalPixels}px)`);
            resolve();
          }, 600);
        }
      };
      
      animationRefs.current[block.spriteId] = requestAnimationFrame(animateFrame);
    });
  }, [updateSpritePosition, easeInOutCubic]);

  // Enhanced dynamic turn block animation with smooth rotation
  const animateTurnBlock = useCallback((block: MotionBlock): Promise<void> => {
    return new Promise((resolve) => {
      const turnAmount = block.value || 90;
      const animationDuration = Math.max(800, Math.abs(turnAmount) * 10); // Longer for smoother rotation
      
      console.log(`🔄 Starting enhanced turn animation: ${turnAmount}° for ${block.spriteId}`);
      
      setExecutionStatus(prev => ({
        ...prev,
        [block.spriteId]: {
          currentStep: 0,
          totalSteps: Math.abs(turnAmount),
          blockName: `Turning ${turnAmount}°`
        }
      }));
      
      const startTime = performance.now();
      let currentDegree = 0;
      let totalTurned = 0;
      
      const animateFrame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Use easing function for smooth acceleration/deceleration
        const easedProgress = easeInOutCubic(progress);
        const targetDegrees = Math.abs(turnAmount) * easedProgress;
        const degreesToTurn = targetDegrees - totalTurned;
        
        if (degreesToTurn > 0.1) {
          // Apply rotation direction
          const deltaRotation = degreesToTurn * (turnAmount > 0 ? 1 : -1);
          updateSpritePosition(block.spriteId, 0, 0, deltaRotation);
          totalTurned = targetDegrees;
          
          // Update degree counter
          const newDegreeCount = Math.floor(totalTurned);
          if (newDegreeCount > currentDegree) {
            currentDegree = newDegreeCount;
            setExecutionStatus(prev => ({
              ...prev,
              [block.spriteId]: prev[block.spriteId] ? {
                ...prev[block.spriteId]!,
                currentStep: Math.min(currentDegree, Math.abs(turnAmount))
              } : null
            }));
          }
        }
        
        if (progress < 1) {
          animationRefs.current[block.spriteId] = requestAnimationFrame(animateFrame);
        } else {
          // Animation completed
          delete animationRefs.current[block.spriteId];
          
          setExecutionStatus(prev => ({
            ...prev,
            [block.spriteId]: {
              currentStep: Math.abs(turnAmount),
              totalSteps: Math.abs(turnAmount),
              blockName: `Turned ${turnAmount}°!`
            }
          }));
          
          setTimeout(() => {
            setExecutionStatus(prev => ({ ...prev, [block.spriteId]: null }));
            console.log(`✅ Enhanced turn animation completed: ${block.spriteId} turned ${turnAmount}°`);
            resolve();
          }, 500);
        }
      };
      
      animationRefs.current[block.spriteId] = requestAnimationFrame(animateFrame);
    });
  }, [updateSpritePosition, easeInOutCubic]);

  const animateGotoBlock = useCallback((block: MotionBlock): Promise<void> => {
    return new Promise((resolve) => {
      const targetX = block.x || 100;
      const targetY = block.y || 100;
      
      console.log(`📍 Starting goto animation: (${targetX}, ${targetY}) for ${block.spriteId}`);
      
      setExecutionStatus(prev => ({
        ...prev,
        [block.spriteId]: {
          currentStep: 1,
          totalSteps: 1,
          blockName: `Go to (${targetX}, ${targetY})`
        }
      }));
      
      // Find current sprite position
      const currentSprite = spritePositions.find(s => s.id === block.spriteId);
      if (!currentSprite) {
        resolve();
        return;
      }
      
      const startX = currentSprite.x;
      const startY = currentSprite.y;
      const deltaX = targetX - startX;
      const deltaY = targetY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const animationDuration = Math.max(800, distance * 2); // Dynamic duration based on distance
      
      const startTime = performance.now();
      
      const animateFrame = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = easeInOutCubic(progress);
        
        const currentX = startX + (deltaX * easedProgress);
        const currentY = startY + (deltaY * easedProgress);
        
        setSpritePositions(prev => 
          prev.map(sprite => {
            if (sprite.id !== block.spriteId) return sprite;
            return {
              ...sprite,
              x: Math.max(0, Math.min(currentX, 468)),
              y: Math.max(0, Math.min(currentY, 368))
            };
          })
        );
        
        if (progress < 1) {
          animationRefs.current[block.spriteId] = requestAnimationFrame(animateFrame);
        } else {
          delete animationRefs.current[block.spriteId];
          setTimeout(() => {
            setExecutionStatus(prev => ({ ...prev, [block.spriteId]: null }));
            console.log(`📍 Goto completed: ${block.spriteId} moved to (${targetX}, ${targetY})`);
            resolve();
          }, 400);
        }
      };
      
      animationRefs.current[block.spriteId] = requestAnimationFrame(animateFrame);
    });
  }, [setSpritePositions, spritePositions, easeInOutCubic]);

  const executeMotionBlock = useCallback(async (block: MotionBlock): Promise<void> => {
    console.log(`🎬 Executing enhanced motion block for ${block.spriteId}:`, block.type, block.value);
    
    switch (block.type) {
      case 'move':
        return animateMoveBlock(block);
      case 'turn':
        return animateTurnBlock(block);
      case 'goto':
        return animateGotoBlock(block);
      case 'say':
        return animateSayBlock(block);
      case 'think':
        return animateThinkBlock(block);
      case 'repeat':
        const repeatCount = block.value || 2; 
        const repeatedBlocks = animationSequences.current[block.spriteId]?.filter(b => b.id !== block.id) || [];
        
        for (let i = 0; i < repeatCount; i++) {
            for (const innerBlock of repeatedBlocks) {
            await executeMotionBlock(innerBlock);
            await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        return Promise.resolve();
      default:
        console.warn(`⚠️  Unknown block type: ${block.type}`);
        return Promise.resolve();
    }
  }, [animateMoveBlock, animateTurnBlock, animateGotoBlock, animateSayBlock, animateThinkBlock]);

  // Ensure each Sprite has independent Motion and Looks block functionality
  const executeAllBlocks = useCallback(async (spriteId: string, blocks: MotionBlock[]) => {
    if (isExecuting[spriteId]) {
      console.log(`⏸️  Sprite ${spriteId} is already executing, skipping`);
      return;
    }
    
    const spriteBlocks = blocks.filter(block => block.spriteId === spriteId);
    if (spriteBlocks.length === 0) {
      console.log(`📭 No blocks found for sprite ${spriteId}`);
      return;
    }
    
    console.log(`🚀 Executing ${spriteBlocks.length} enhanced blocks for sprite ${spriteId}`);
    setIsExecuting(prev => ({ ...prev, [spriteId]: true }));
    animationSequences.current[spriteId] = spriteBlocks;
    
    try {
      // Execute each block sequentially for this specific sprite
      for (let i = 0; i < spriteBlocks.length; i++) {
        const block = spriteBlocks[i];
        console.log(`📋 Enhanced Block ${i + 1}/${spriteBlocks.length} for ${spriteId}:`, block.type, block.value);
        await executeMotionBlock(block);
        
        // Short pause between blocks for visual separation
        if (i < spriteBlocks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Show completion message
      setExecutionStatus(prev => ({
        ...prev,
        [spriteId]: {
          currentStep: 1,
          totalSteps: 1,
          blockName: `${spriteId.toUpperCase()} - All ${spriteBlocks.length} blocks completed! 🎉`
        }
      }));
      
      setTimeout(() => {
        setExecutionStatus(prev => ({ ...prev, [spriteId]: null }));
      }, 2000);
      
    } finally {
      setIsExecuting(prev => ({ ...prev, [spriteId]: false }));
      delete animationSequences.current[spriteId];
    }
  }, [isExecuting, executeMotionBlock]);

  // Button to trigger animations for all sprites on click
  const executeAllSprites = useCallback(async (allBlocks: MotionBlock[]) => {
    const spriteIds = Array.from(new Set(allBlocks.map(block => block.spriteId)));
    
    if (spriteIds.length === 0) {
      console.log(`📭 No blocks found for any sprites`);
      return;
    }
    
    console.log(`🎭 Executing enhanced blocks for ${spriteIds.length} sprites simultaneously`);
    
    // Execute all sprites in parallel
    await Promise.all(
      spriteIds.map(spriteId => executeAllBlocks(spriteId, allBlocks))
    );
    
    console.log(`🎉 All sprites enhanced execution completed!`);
  }, [executeAllBlocks]);

  const stopAllExecution = useCallback(() => {
    console.log(`🛑 Stopping all enhanced sprite execution`);
    
    // Clear all running animations
    Object.keys(animationRefs.current).forEach(spriteId => {
      if (animationRefs.current[spriteId]) {
        if (typeof animationRefs.current[spriteId] === 'number') {
          // RequestAnimationFrame ID
          cancelAnimationFrame(animationRefs.current[spriteId]);
        } else {
          // Timeout ID
          clearTimeout(animationRefs.current[spriteId] as any);
        }
        delete animationRefs.current[spriteId];
      }
    });
    
    // Reset all execution states
    setIsExecuting({});
    setExecutionStatus({});
    animationSequences.current = {};
  }, []);

  return {
    isExecuting,
    executionStatus,
    executeAllBlocks,
    executeAllSprites,
    stopAllExecution,
    stopSpriteExecution
  };
}
