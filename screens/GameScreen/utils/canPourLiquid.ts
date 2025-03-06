export const canPourLiquid = (
  fromTube: string[],
  toTube: string[],
  amountToMove: number
): boolean => {
  return (
    toTube.length + amountToMove <= 6 && // Проверяем переполнение пробирки
    (toTube.length === 0 ||
      toTube[toTube.length - 1] === fromTube[fromTube.length - 1]) // Совпадение цвета
  );
};
