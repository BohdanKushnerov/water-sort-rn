import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaterStreamProps {
  streamHeight: number; // Высота воды
  pouring: boolean; // Флаг начала анимации (истинно при начале наливания)
}

const WaterStream: React.FC<WaterStreamProps> = ({ streamHeight, pouring }) => {
  const [height, setHeight] = useState(100); // Начальная высота равна 0
  const waveOffset = useSharedValue(0);

  // Анимация высоты воды, если начинается наливание
  useEffect(() => {
    if (pouring) {
      // Начинаем анимацию высоты воды
      setHeight(streamHeight);
    } else {
      // Если вода не сливается, высота становится 0
      setHeight(0);
    }
  }, [pouring, streamHeight]);

  // Анимация движения волны
  waveOffset.value = withRepeat(
    withTiming(1, { duration: 1000, easing: Easing.linear }),
    -1,
    true
  );

  const animatedProps = useAnimatedProps(() => {
    const waveY = height + Math.sin(waveOffset.value * Math.PI * 2) * 5; // Волна
    return {
      d: `
        M100,0 
        L104,${height} 
        Q106,${waveY + 5} 108,${waveY} 
        T112,${waveY} 
        L116,${height} 
        Z
      `,
    };
  });

  return (
    <View>
      <Svg width="200" height={height + 30}>
        {/* Статическая верхняя часть струи */}
        <Path d="M100,0 L104,0 L112,0 L116,0 Z" fill="blue" />

        {/* Анимированная струя воды вниз */}
        <AnimatedPath fill="blue" animatedProps={animatedProps} />
      </Svg>
    </View>
  );
};

export default WaterStream;
