export const clamp = (min: number, max: number, target: number) => {
  return Math.max(Math.min(max, target), min);
};
