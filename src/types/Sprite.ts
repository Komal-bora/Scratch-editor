/**
 * Sprite Interface
 * 
 * Represents a sprite in the Scratch-like editor with independent Motion and Looks functionality.
 * Each sprite maintains its own block lists, execution state, and visual properties.
 */
export interface Sprite {
  id: string;                        // Unique identifier for the sprite
  name: string;                      // Display name shown in UI
  image: string;                     // Path to sprite image asset
  x: number;                         // X position on canvas
  y: number;                         // Y position on canvas
  rotation: number;                  // Rotation angle in degrees
  visible: boolean;                  // Whether sprite is visible on canvas
  created?: number;                  // Timestamp when sprite was created
  motionBlocks?: string[];           // IDs of motion blocks (move, turn, goto, repeat) assigned to this sprite
  looksBlocks?: string[];            // IDs of looks blocks (say, think) assigned to this sprite
  isExecuting?: boolean;             // Individual execution state per sprite
  currentlyShowingText?: string;     // Text currently displayed in speech/thought bubble
  textStartTime?: number;            // When text started showing (for duration tracking)
  textDuration?: number;             // How long to show text in milliseconds
}

export const defaultSprites: Sprite[] = [
  {
    id: 'car1',
    name: 'Car 1',
    image: '/src/assets/car1.png',
    x: 20,
    y: 150,
    rotation: 0,
    visible: true,
    motionBlocks: [],
    looksBlocks: [],
    isExecuting: false,
    currentlyShowingText: undefined,
    textStartTime: undefined,
    textDuration: undefined
  },
  {
    id: 'car2',
    name: 'Car 2', 
    image: '/src/assets/car2.png',
    x: 250,
    y: 150,
    rotation: 0,
    visible: true,
    motionBlocks: [],
    looksBlocks: [],
    isExecuting: false,
    currentlyShowingText: undefined,
    textStartTime: undefined,
    textDuration: undefined
  }
];

/**
 * Utility function to create a new sprite with all required properties for independent Motion and Looks functionality.
 * Ensures proper initialization of block arrays and execution state.
 * 
 * @param id - Unique identifier for the sprite
 * @param name - Display name for the sprite
 * @param x - Initial X position (default: 100)
 * @param y - Initial Y position (default: 100)
 * @param image - Path to sprite image asset (default: '/src/assets/car1.png')
 * @returns Fully initialized Sprite object
 */
export function createNewSprite(
  id: string, 
  name: string, 
  x: number = 100, 
  y: number = 100,
  image: string = '/src/assets/car1.png'
): Sprite {
  return {
    id,
    name,
    image,
    x,
    y,
    rotation: 0,
    visible: true,
    created: Date.now(),
    motionBlocks: [],
    looksBlocks: [],
    isExecuting: false,
    currentlyShowingText: undefined,
    textStartTime: undefined,
    textDuration: undefined
  };
}

/**
 * Utility function to reset a sprite to its default state.
 * Clears all blocks, resets position based on sprite type, and stops execution.
 * 
 * @param sprite - Sprite to reset
 * @returns Sprite with cleared blocks and reset state
 */
export function resetSprite(sprite: Sprite): Sprite {
  return {
    ...sprite,
    x: sprite.id === 'car1' ? 20 : sprite.id === 'car2' ? 250 : 100,
    y: sprite.id === 'car1' ? 150 : sprite.id === 'car2' ? 150 : 100,
    rotation: 0,
    motionBlocks: [],
    looksBlocks: [],
    isExecuting: false,
    currentlyShowingText: undefined,
    textStartTime: undefined,
    textDuration: undefined
  };
}
