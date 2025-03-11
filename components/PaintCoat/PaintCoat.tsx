import { LIQUID_HEIGHT_COLOR } from "@/constants/constants";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";

interface PaintCoatProps {
  color: string;
  index: number;
}

const PaintCoat: FC<PaintCoatProps> = ({ color, index }) => {
  const heightAnim = useRef(new Animated.Value(LIQUID_HEIGHT_COLOR)).current; // Начальная высота LIQUID_HEIGHT_COLOR
  const [isVisible, setIsVisible] = useState(true); // Состояние для видимости

  useEffect(() => {
    // Анимация уменьшения высоты при размонтировании компонента
    return () => {
      // console.log('unmount')
      Animated.timing(heightAnim, {
        toValue: 0, // Уменьшаем высоту до 0
        duration: 200,
        useNativeDriver: false,
      }).start();

      // Скрываем компонент после завершения анимации
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // После завершения анимации
    };
  }, []);

  if (!isVisible) {
    return null; // Если компонент не видим, не рендерим его
  }

  return (
    <Animated.View
      style={[
        styles.liquid,
        {
          backgroundColor: color,
          bottom: index * LIQUID_HEIGHT_COLOR,
          height: heightAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  liquid: {
    position: "absolute",
    left: 1,
    width: 52,
    height: LIQUID_HEIGHT_COLOR,
  },
});

export default PaintCoat;
