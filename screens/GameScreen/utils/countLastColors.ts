export const countLastColors = (colors: string[]) => {
  if (colors.length === 0) return 0;

  let count = 1;
  let lastColor = colors[colors.length - 1];

  for (let i = colors.length - 2; i >= 0; i--) {
    if (colors[i] === lastColor) {
      count++;
    } else {
      break;
    }
  }

  return count;
};
