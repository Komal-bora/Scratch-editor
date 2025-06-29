import { useDrag } from "react-dnd";
import { ItemTypes } from "../dnd/ItemTypes";
import { useState, useRef, useEffect } from "react";

interface Props {
  spriteId: string; // Changed from "car1" | "car2" to string
}

export default function ThinkMotionBlock({ spriteId }: Props) {
  const [text, setText] = useState("Hmm...");
  const [duration, setDuration] = useState(2);
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MOTION_BLOCK,
    item: {
      motionType: "think",
      spriteId,
      label: `Think "${text}" for ${duration} seconds`,
      text,
      duration,
      category: 'looks' // Think blocks are looks category
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
        bg-gradient-to-r from-indigo-500 to-blue-500 
        text-white p-2 rounded cursor-grab shadow-md 
        transition-all duration-200 hover:shadow-lg hover:scale-105
        ${isDragging ? "opacity-50 rotate-3 scale-95" : ""}
        border border-indigo-300 hover:border-indigo-200
      `}
    >
      <div className="flex items-center gap-1 text-xs font-medium">
        {/* Thought bubble icon */}
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <circle cx="6" cy="15" r="1.5" opacity="0.7" />
          <circle cx="4" cy="17" r="1" opacity="0.5" />
        </svg>
        
        <span>Think</span>
        
        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hmm..."
          className="
            bg-white bg-opacity-20 border border-white border-opacity-30 
            rounded px-1 py-0.5 text-white placeholder-blue-100 text-xs
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
