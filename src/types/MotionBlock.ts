export interface MotionBlock {
  id: string;
  type: "move" | "turn" | "goto" | "repeat" | "say" | "think";
  category: "motion" | "looks"; // Categorize blocks for better organization
  spriteId: string; // Changed from "car1" | "car2" to support dynamic sprites
  label: string;
  value?: number;
  x?: number;
  y?: number;
  text?: string; // For the "say" and "think" block text
  duration?: number; // For the "say" and "think" block duration in seconds
  order?: number; // Execution order within sprite
}
