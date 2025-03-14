import { LIQUID_HEIGHT_COLOR } from "@/constants/constants";
import { TubeCoordinates } from "@/screens/GameScreen/GameScreen";
import React, { FC, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Animated } from "react-native";

interface ActivePouringLiquidProps {
  angle: number;
  pouringFromTube: boolean;
  selectedTubeCoordinates: TubeCoordinates | null;
  pouringColor: string | null;
  countColorsInTargetTube: number | null;
}

const ActivePouringLiquid: FC<ActivePouringLiquidProps> = ({
  angle,
  pouringFromTube,
  selectedTubeCoordinates,
  pouringColor,
  countColorsInTargetTube,
}) => {
  const heightActiveLiquidAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pouringFromTube && selectedTubeCoordinates) {
      // Запускаем анимацию изменения высоты от 0 до 1
      Animated.timing(heightActiveLiquidAnim, {
        toValue: 1,
        duration: 300,
        delay: 600,
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
    outputRange: [
      0,
      // 173 - LIQUID_HEIGHT_COLOR * (countColorsInTargetTube ?? 0),
      100,
    ],
  });

  return (
    <Animated.View
      style={[
        styles.activeLiquid,
        {
          backgroundColor: pouringColor ? pouringColor : "",
          height: heightActiveLiquid,
          transformOrigin: "top right",
          transform: [{ rotate: `-${angle}deg` }],
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
