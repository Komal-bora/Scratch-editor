import SayMotionBlock from "./SayMotionBlock";
import ThinkMotionBlock from "./ThinkMotionBlock";

interface Props {
  selectedSprite: string; // Changed from "car1" | "car2" to string
}

export default function Looks({ selectedSprite }: Props) {
  return (
    <div className="border p-2 rounded bg-purple-50 border-purple-200">
      <h2 className="font-semibold text-base mb-2 text-purple-700 flex items-center gap-1">
        {/* Looks icon */}
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        Looks
      </h2>
      <div className="space-y-1">
        <SayMotionBlock spriteId={selectedSprite} />
        <ThinkMotionBlock spriteId={selectedSprite} />
      </div>
    </div>
  );
}
