export const canPourLiquid = (
  fromTube: string[],
  toTube: string[],
  amountToMove: number
): boolean => {
  console.log(1, toTube.length + amountToMove <= 6);
  console.log(2, toTube.length === 0);
  console.log(3, toTube[toTube.length - 1] === fromTube[fromTube.length - 1]);
  console.log("toTube[toTube.length - 1]", toTube[toTube.length - 1]);
  console.log("fromTube[fromTube.length - 1]", fromTube[fromTube.length - 1]);
  return (
    toTube.length + amountToMove <= 6 && // Проверяем переполнение пробирки
    (toTube.length === 0 ||
      toTube[toTube.length - 1] === fromTube[fromTube.length - 1]) // Совпадение цвета
  );
};
