import MotionBlock from "./MotionBlock";
import Looks from "./Looks";

interface Props {
  selectedSprite: string; // Changed from "car1" | "car2" to string
}

export default function Controls({ selectedSprite }: Props) {
  return (
    <div className="space-y-3">
      {/* Motion Section */}
      <div className="border p-2 rounded bg-blue-50 border-blue-200">
        <h2 className="font-semibold text-base mb-2 text-blue-700 flex items-center gap-1">
          {/* Motion icon */}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Motion
        </h2>
        <div className="space-y-1">
          <MotionBlock label="Move ____ steps" type="move" spriteId={selectedSprite} />
          <MotionBlock label="Turn ____ degrees" type="turn" spriteId={selectedSprite} />
          <MotionBlock label="Go to x: ___ y: ____" type="goto" spriteId={selectedSprite} />
          <MotionBlock label="Repeat animation" type="repeat" spriteId={selectedSprite} />
        </div>
      </div>
      
      {/* Looks Section */}
      <Looks selectedSprite={selectedSprite} />
    </div>
  );
}
