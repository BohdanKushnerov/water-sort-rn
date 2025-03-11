import { TubeCoordinates } from "@/screens/GameScreen/GameScreen";
import React, { useRef, useEffect, FC, forwardRef, useState } from "react";
import {
  Pressable,
  Animated,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from "react-native";
import PaintCoat from "../PaintCoat/PaintCoat";
import ActivePouringLiquid from "../ActivePouringLiquid/ActivePouringLiquid";
import { LIQUID_HEIGHT_COLOR } from "@/constants/constants";

interface TestTubeProps {
  colors: string[];
  onPress: () => void;
  isSelected: boolean;
  pouringFromTube: boolean;
  pouringToTube: boolean;
  selectedTubeCoordinates: TubeCoordinates | null;
  pouringColor: string | null;
  countPouringColors: number | null;
  countColorsInSourceTube: number | null;
  countColorsInTargetTube: number | null;
}

const TestTube = forwardRef<View, TestTubeProps>(
  (
    {
      colors,
      onPress,
      isSelected,
      pouringFromTube,
      pouringToTube,
      selectedTubeCoordinates,
      pouringColor,
      countColorsInTargetTube,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [tubeCoordinates, setTubeCoordinates] = useState({ x: 0, y: 0 });

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const borderAnim = useRef(new Animated.Value(0)).current;

    const startAnimationTranslateTube = useRef(false);

    useEffect(() => {
      Animated.timing(borderAnim, {
        toValue: isSelected ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isSelected]);

    useEffect(() => {
      if (pouringFromTube && selectedTubeCoordinates) {
        startAnimationTranslateTube.current = true;
        setIsVisible(false);

        // Анимация перемещения вперед
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: selectedTubeCoordinates.pageX - tubeCoordinates.x - 60,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: selectedTubeCoordinates.pageY - tubeCoordinates.y - 105,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [pouringFromTube, selectedTubeCoordinates]);

    useEffect(() => {
      if (
        !pouringFromTube &&
        !selectedTubeCoordinates &&
        startAnimationTranslateTube.current
      ) {
        console.log("backkkkkkkkkk");
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsVisible(true); // Показали пробирку по окончании анимации
          startAnimationTranslateTube.current = false;
        });
      }
    }, [pouringFromTube, selectedTubeCoordinates]);

    const borderColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["gray", "gold"],
    });

    const rotateInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "45deg"],
    });

    const onLayout = (event: LayoutChangeEvent) => {
      const { x, y } = event.nativeEvent.layout;
      setTubeCoordinates({ x, y });
    };

    return (
      <>
        {/* Основная (фантомная) пробирка */}
        <Pressable
          ref={ref}
          onPress={onPress}
          onLayout={onLayout}
          style={{ zIndex: 10 }}
        >
          <Animated.View
            style={[
              styles.tube,
              { borderColor, opacity: isVisible ? 1 : 0 }, // Ховаємо лише візуально
            ]}
          >
            {colors.map((color, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.liquid,
                  {
                    backgroundColor: color,
                    bottom: index * LIQUID_HEIGHT_COLOR,
                  },
                ]}
              />
            ))}
          </Animated.View>
        </Pressable>

        {/* Анимированная пробірка (поверх основной) */}

        <Animated.View
          style={[
            styles.tube,
            {
              position: "absolute",
              zIndex: isVisible ? 0 : 20,
              left: tubeCoordinates.x,
              top: tubeCoordinates.y,
              transform: [
                { translateX },
                { translateY },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <View style={[styles.innerAnimatedTubeWrap]}>
            <ActivePouringLiquid
              pouringFromTube={pouringFromTube}
              selectedTubeCoordinates={selectedTubeCoordinates}
              pouringColor={pouringColor}
              countColorsInTargetTube={countColorsInTargetTube}
            />
            {colors.map((color, index) => (
              // <PaintCoat key={index} color={color} index={index} />
              <Animated.View
                key={index}
                style={[
                  styles.liquid,
                  {
                    backgroundColor: color,
                    bottom: index * LIQUID_HEIGHT_COLOR,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  innerAnimatedTubeWrap: {
    width: "auto",
    height: "100%",
    position: "relative",
  },
  tube: {
    width: 60,
    height: 150,
    borderWidth: 3,
    borderRadius: 10,
    // overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#eee",
    position: "relative",
  },
  liquid: {
    position: "absolute",
    left: 1,
    width: 52,
    height: LIQUID_HEIGHT_COLOR,
  },
  activeLiquid: {
    borderColor: "green",
    width: 5,
    position: "absolute",
    zIndex: 10,
    top: 0,
    right: 0,
  },
});

export default TestTube;
