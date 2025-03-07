import { TubeCoordinates } from "@/screens/GameScreen/GameScreen";
import React, { FC, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Animated } from "react-native";

interface ActivePouringLiquidProps {
  pouringFromTube: boolean;
  selectedTubeCoordinates: TubeCoordinates | null;
  pouringColor: string | null;
}

const ActivePouringLiquid: FC<ActivePouringLiquidProps> = ({
  pouringFromTube,
  selectedTubeCoordinates,
  pouringColor,
}) => {
  const heightActiveLiquidAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pouringFromTube && selectedTubeCoordinates) {
      // Запускаем анимацию изменения высоты от 0 до 1
      Animated.timing(heightActiveLiquidAnim, {
        toValue: 1,
        duration: 300,
        delay: 300,

        useNativeDriver: false,
      }).start();
    }

    if (!pouringFromTube && !selectedTubeCoordinates) {
      Animated.timing(heightActiveLiquidAnim, {
        toValue: 0,
        duration: 100,
        delay: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [pouringFromTube, selectedTubeCoordinates]);

  const heightActiveLiquid = heightActiveLiquidAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  return (
    <Animated.View
      style={[
        styles.activeLiquid,
        {
          backgroundColor: pouringColor ? pouringColor : "",
          height: heightActiveLiquid,
          transformOrigin: "top right",
          transform: [{ rotate: "-45deg" }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  activeLiquid: {
    borderColor: "green",
    width: 5,
    position: "absolute",
    zIndex: 10,
    top: 0,
    right: 0,
  },
});

export default ActivePouringLiquid;
