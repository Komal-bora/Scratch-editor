import { useDrag } from "react-dnd";
import { ItemTypes } from "../dnd/ItemTypes";
import { useState, useRef, useEffect } from "react";

interface Props {
  spriteId: string; // Changed from "car1" | "car2" to string
}

export default function SayMotionBlock({ spriteId }: Props) {
  const [text, setText] = useState("Hello!");
  const [duration, setDuration] = useState(2);
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MOTION_BLOCK,
    item: {
      motionType: "say",
      spriteId,
      label: `Say "${text}" for ${duration} seconds`,
      text,
      duration,
      category: 'looks' // Say blocks are looks category
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [text, duration, spriteId]);

  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [ref, drag]);

  return (
    <div
      ref={ref}
      className={`
        bg-gradient-to-r from-purple-500 to-pink-500 
        text-white p-2 rounded cursor-grab shadow-md 
        transition-all duration-200 hover:shadow-lg hover:scale-105
        ${isDragging ? "opacity-50 rotate-3 scale-95" : ""}
        border border-purple-300 hover:border-purple-200
      `}
    >
      <div className="flex items-center gap-1 text-xs font-medium">
        {/* Speech bubble icon */}
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        
        <span>Say</span>
        
        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hi!"
          className="
            bg-white bg-opacity-20 border border-white border-opacity-30 
            rounded px-1 py-0.5 text-white placeholder-pink-100 text-xs
            focus:outline-none focus:ring-1 focus:ring-white focus:ring-opacity-50
            min-w-0 flex-shrink
          "
          style={{ width: `${Math.max(40, text.length * 6 + 16)}px` }}
          onClick={(e) => e.stopPropagation()}
        />
        
        <span>for</span>
        
        {/* Duration input */}
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Math.max(0.5, parseFloat(e.target.value) || 1))}
          min="0.5"
          max="10"
          step="0.5"
          className="
            bg-white bg-opacity-20 border border-white border-opacity-30 
            rounded px-1 py-0.5 text-white text-xs w-10
            focus:outline-none focus:ring-1 focus:ring-white focus:ring-opacity-50
          "
          onClick={(e) => e.stopPropagation()}
        />
        
        <span>s</span>
      </div>
    </div>
  );
}
