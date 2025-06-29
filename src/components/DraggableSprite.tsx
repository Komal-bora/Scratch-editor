import { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../dnd/ItemTypes';

interface Props {
  id: string;
  src: string;
  alt: string;
  x: number;
  y: number;
  onMove: (id: string, x: number, y: number) => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  rotation?: number;
}

export default function DraggableSprite({ id, src, alt, x, y, onMove, canvasRef, rotation = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SPRITE,
    item: { id, x, y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [x, y]);

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    const canvasRect = canvasRef?.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const spriteWidth = ref.current?.offsetWidth || 96;
    const spriteHeight = ref.current?.offsetHeight || 96;

    const offsetX = e.clientX - canvasRect.left - x;
    const offsetY = e.clientY - canvasRect.top - y;

    const handleMouseMove = (e: MouseEvent) => {
      const newMouseX = e.clientX - canvasRect.left;
      const newMouseY = e.clientY - canvasRect.top;

      let newX = newMouseX - offsetX;
      let newY = newMouseY - offsetY;

      const maxX = canvasRect.width - spriteWidth;
      const maxY = canvasRect.height - spriteHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      onMove(id, newX, newY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={ref}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isDragging ? 'opacity-70 scale-105' : 'opacity-100 scale-100'
      } hover:scale-105 hover:shadow-lg`}
      style={{
        left: x,
        top: y,
        zIndex: isDragging ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Car Image with enhanced styling */}
      <div className="relative">
        <img 
          src={src} 
          alt={alt} 
          className="w-24 h-auto pointer-events-none rounded-lg shadow-md transition-all duration-200" 
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        />
        
        {/* Glow effect when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-400 opacity-30 rounded-lg blur-sm -z-10"></div>
        )}
      </div>
      
      {/* Improved coordinate display */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-gray-700 bg-white bg-opacity-90 px-2 py-1 rounded-full shadow-sm pointer-events-none">
          {alt}: ({Math.round(x)}, {Math.round(y)})
        </p>
      </div>
    </div>
  );
}
