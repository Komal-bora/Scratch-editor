import { useDrag } from "react-dnd";
import { ItemTypes } from "../dnd/ItemTypes";
import { useRef, useEffect, useState } from "react";

interface MotionBlockProps {
  label: string;
  type: "move" | "turn" | "goto" | "repeat";
  spriteId: string; // Changed from "car1" | "car2" to string
}

export default function MotionBlock({ label, type, spriteId }: MotionBlockProps) {
  const [value, setValue] = useState<number>(type === "move" ? 50 : type === "turn" ? 90 : 0); // Increased move steps for more dynamic movement
  const [x, setX] = useState<number>(type === "goto" ? 200 : 0); // Better default position
  const [y, setY] = useState<number>(type === "goto" ? 200 : 0); // Better default position

  console.log('Enhanced MotionBlock rendered:', { label, type, spriteId, value, x, y });

  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MOTION_BLOCK,
    item: () => {
      // Generate dynamic label based on current values
      let dynamicLabel = label;
      if (type === "move") {
        dynamicLabel = `Move ${value} steps`;
      } else if (type === "turn") {
        dynamicLabel = `Turn ${value}°`;
      } else if (type === "goto") {
        dynamicLabel = `Go to (${x}, ${y})`;
      }
      
      const dragItem = { 
        motionType: type, // Rename to avoid confusion with DnD type
        value, 
        x, 
        y, 
        spriteId, 
        label: dynamicLabel, // Use dynamic label with current values
        category: 'motion' // All MotionBlock components are motion category
      };
      console.log('Enhanced MotionBlock drag started with item:', dragItem);
      return dragItem;
    }, // Pass all data including spriteId and label
    end: (item, monitor) => {
      console.log('MotionBlock drag ended');
      console.log('Drop result:', monitor.getDropResult());
      console.log('Did drop?', monitor.didDrop());
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [type, value, x, y, spriteId, label]); // Add type to dependencies

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [ref, drag]);

  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-center space-x-1 border rounded px-2 py-1 bg-white cursor-move text-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {type === "move" && (
        <>
          <span className="text-xs">Move</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="border px-1 w-12 text-xs"
          />
          <span className="text-xs">steps</span>
        </>
      )}
      {type === "turn" && (
        <>
          <span className="text-xs">Turn</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="border px-1 w-12 text-xs"
          />
          <span className="text-xs">°</span>
        </>
      )}
      {type === "goto" && (
        <>
          <span className="text-xs">Go to</span>
          <input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="border px-1 w-10 text-xs"
          />
          <span className="text-xs">,</span>
          <input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="border px-1 w-10 text-xs"
          />
        </>
      )}
      {type === "repeat" && (
        <>
          <span className="text-xs">Repeat</span>
        </>
      )}
    </div>
  );
}
