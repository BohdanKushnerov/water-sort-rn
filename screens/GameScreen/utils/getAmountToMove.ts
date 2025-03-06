export const getAmountToMove = (fromTube: string[]): number => {
  let amountToMove = 0;
  const movingLiquid = fromTube[fromTube.length - 1]; // Жидкость, которую нужно перелить

  // Определяем, сколько одинаковых сверху слоев можно перелить
  for (let i = fromTube.length - 1; i >= 0; i--) {
    if (fromTube[i] === movingLiquid) {
      amountToMove++;
    } else {
      break;
    }
  }

  return amountToMove;
};