export type CardType = 'noteCardDetail' | 'contactCardDetail';

export interface CardIndex {
  component: CardType;
  id: number;
}

export function createSourceRecord(component: CardType, id: number): CardIndex {
  return { component, id };
}

// Global array to track all CardIndex objects
let globalCardIndexArray: CardIndex[] = [];

// Function to add a CardIndex to the global array
export function addToCardIndexArray(cardIndex: CardIndex): void {
  globalCardIndexArray.push(cardIndex);
  console.log('Added to globalCardIndexArray:', cardIndex);
  console.log('Current array length:', globalCardIndexArray.length);
  console.log('Full array:', globalCardIndexArray);
}

// Function to get the current global array
export function getCardIndexArray(): CardIndex[] {
  return [...globalCardIndexArray]; // Return a copy to prevent direct mutations
}

// Function to clear the global array
export function clearCardIndexArray(): void {
  globalCardIndexArray = [];
}

// Function to remove the last item from the array (for back navigation)
export function popCardIndexArray(): CardIndex | undefined {
  return globalCardIndexArray.pop();
}

// Function to get the last item without removing it
export function peekCardIndexArray(): CardIndex | undefined {
  return globalCardIndexArray[globalCardIndexArray.length - 1];
}

// Function to get array length
export function getCardIndexArrayLength(): number {
  return globalCardIndexArray.length;
}