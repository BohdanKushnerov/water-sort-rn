export const canPourLiquid = (
  fromTube: string[],
  toTube: string[],
  amountToMove: number
): boolean => {
  // Проверяем, есть ли место в целевой пробирке
  const spaceInTargetTube = toTube.length + amountToMove <= 6;

  // Проверяем, можно ли наливать в целевую пробирку:
  // 1. Если пробирка пустая, можно наливать любой цвет
  // 2. Если пробирка не пустая, цвет в последней позиции должен совпадать с цветом из откуда переливаем
  const canPour =
    toTube[toTube.length - 1] === fromTube[fromTube.length - 1] ||
    toTube[toTube.length - 1] === "";

  return spaceInTargetTube && canPour;
};
