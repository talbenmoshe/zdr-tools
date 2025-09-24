export function generateRandomInteger(min: number, max: number) { // min included and max exncluded
  return Math.floor(Math.random() * (max - min) + min);
}
