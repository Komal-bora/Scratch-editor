import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Controls from "./components/Controls";
import SpriteCanvas from "./components/SpriteCanvas";
import SpriteSelector from "./components/SpriteSelector";
import ControlFooter from "./components/ControlFooter";
import { useState } from "react";
import { Sprite, defaultSprites, createNewSprite } from "./types/Sprite";

export default function App() {
  const [sprites, setSprites] = useState<Sprite[]>(defaultSprites);
  const [selectedSprite, setSelectedSprite] = useState<string>("car1");
  const [heroMode, setHeroMode] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [playAllTrigger, setPlayAllTrigger] = useState(0);
  const [resetAllTrigger, setResetAllTrigger] = useState(0);

  const handlePlayAll = () => {
    setPlayAllTrigger(prev => prev + 1);
  };

  const handleResetAll = () => {
    setResetAllTrigger(prev => prev + 1);
  };

  const handleAddSprite = () => {
    const newSpriteId = `sprite_${Date.now()}`;
    const newSprite = createNewSprite(
      newSpriteId,
      `Sprite ${sprites.length + 1}`,
      100 + (sprites.length * 50), // Offset new sprites
      100 + (sprites.length * 30)
    );
    
    setSprites(prev => [...prev, newSprite]);
    setSelectedSprite(newSpriteId); // Auto-select the new sprite
  };

  const handleDeleteSprite = (spriteId: string) => {
    // Prevent deletion of default sprites
    if (spriteId === 'car1' || spriteId === 'car2') {
      return;
    }
    
    setSprites(prev => prev.filter(s => s.id !== spriteId));
    
    // If the deleted sprite was selected, select the first available sprite
    if (selectedSprite === spriteId) {
      const remainingSprites = sprites.filter(s => s.id !== spriteId);
      if (remainingSprites.length > 0) {
        setSelectedSprite(remainingSprites[0].id);
      }
    }
  };

  const handleSpriteUpdate = (updatedSprites: Sprite[]) => {
    setSprites(updatedSprites);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen p-4 space-x-4">
        {/* Left Panel */}
        <div className="w-1/3 space-y-4 overflow-auto">
          {/* Sprite Selection Section */}
          <SpriteSelector 
            sprites={sprites}
            selected={selectedSprite} 
            setSelected={setSelectedSprite}
            onAddSprite={handleAddSprite}
            onDeleteSprite={handleDeleteSprite}
          />
          
          {/* Motion Controls Section */}
          <Controls selectedSprite={selectedSprite} />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <SpriteCanvas 
            sprites={sprites}
            onSpritesUpdate={handleSpriteUpdate}
            heroMode={heroMode} 
            selectedSprite={selectedSprite}
            playAllTrigger={playAllTrigger}
            resetAllTrigger={resetAllTrigger}
            onExecutionChange={setIsExecuting}
          />
          <ControlFooter 
            onPlayAll={handlePlayAll}
            onResetAll={handleResetAll}
            isExecuting={isExecuting}
            heroMode={heroMode} 
            setHeroMode={setHeroMode}
          />
        </div>
      </div>
    </DndProvider>
  );
}
