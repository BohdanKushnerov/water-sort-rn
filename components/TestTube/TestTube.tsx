import { TubeCoordinates } from "@/screens/GameScreen/GameScreen";
import React, { useRef, useEffect, FC, forwardRef, useState } from "react";
import { Pressable, Animated, StyleSheet } from "react-native";

interface TestTubeProps {
  colors: string[];
  onPress: () => void;
  isSelected: boolean;
  pouringFromTube: boolean;
  pouringToTube: boolean;
  selectedTubeCoordinates: TubeCoordinates | null;
}

const TestTube: FC<TestTubeProps> = forwardRef(
  (
    {
      colors,
      onPress,
      isSelected,
      pouringFromTube,
      pouringToTube,
      selectedTubeCoordinates,
    }: TestTubeProps,
    ref
  ) => {
    const [tubeCoordinates, setTubeCoordinates] = useState({ x: 0, y: 0 });

    const borderAnim = useRef(new Animated.Value(0)).current;
    const liquidPosition = useRef(new Animated.Value(0)).current;
    const pouringToAnim = useRef(new Animated.Value(-30)).current;

    // Анімація для переміщення пробірки
    const translateX = useRef(new Animated.Value(0)).current; // Анімація для переміщення по осі X
    const translateY = useRef(new Animated.Value(0)).current; // Анімація для переміщення по осі Y

    const onLayout = (event) => {
      console.log("event.nativeEvent.layout", event.nativeEvent.layout);
      const { x, y } = event.nativeEvent.layout;
      setTubeCoordinates({ x, y });
    };

    console.log("tubeCoordinates", tubeCoordinates);
    // console.log("translateX", translateX);
    // console.log("translateY", translateY);

    useEffect(() => {
      Animated.timing(borderAnim, {
        toValue: isSelected ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isSelected]);

    useEffect(() => {
      if (pouringFromTube) {
        // Піднімання рідини перед переливанням
        Animated.sequence([
          Animated.timing(liquidPosition, {
            toValue: -20,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(liquidPosition, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }, [pouringFromTube]);

    useEffect(() => {
      if (pouringToTube && selectedTubeCoordinates) {
        // Анімуємо переміщення пробірки до нової позиції
        Animated.timing(translateX, {
          toValue: selectedTubeCoordinates.pageX, // Переміщуємо по осі X
          duration: 5000,
          useNativeDriver: true, // Використовуємо рідний драйвер для швидкої анімації
        }).start();

        Animated.timing(translateY, {
          toValue: selectedTubeCoordinates.pageY, // Переміщуємо по осі Y
          duration: 5000,
          useNativeDriver: true,
        }).start();
      }
    }, [pouringToTube, selectedTubeCoordinates]);

    const borderColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["black", "gold"],
    });

    return (
      <Pressable onPress={onPress} onLayout={onLayout}>
        <Animated.View
          ref={ref} // Застосовуємо реф до Animated.View
          onPress={onPress}
          style={[
            styles.tube,
            { borderColor },
            pouringToTube && selectedTubeCoordinates
              ? {
                  // Тепер позиціонуємо елемент з новими координатами
                  position: "absolute",
                  transform: [{ translateX }, { translateY }],
                }
              : {},
          ]}
        >
          {colors.map((color, index) => (
            <Animated.View
              key={index}
              style={[
                styles.liquid,
                { backgroundColor: color, bottom: index * 25 },
                pouringFromTube && index === colors.length - 1
                  ? { transform: [{ translateY: liquidPosition }] }
                  : {},
                pouringToTube && index === colors.length - 1
                  ? { transform: [{ translateY: pouringToAnim }] }
                  : {},
              ]}
            />
          ))}
        </Animated.View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  tube: {
    width: 60,
    height: 150,
    borderWidth: 3,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#eee",
    position: "relative",
  },
  liquid: {
    position: "absolute",
    left: 2,
    width: 56,
    height: 25,
  },
});

export default TestTube;
