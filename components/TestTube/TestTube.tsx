import { TubeCoordinates } from "@/screens/GameScreen/GameScreen";
import React, {
  useRef,
  useEffect,
  FC,
  forwardRef,
  useState,
  memo,
} from "react";
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
  indexOfTube: number;
  colors: string;
  handleTubePress: () => void;
  isSelected: boolean;
  pouringFromTube: boolean;
  pouringToTube: boolean;
  selectedTubeCoordinates: TubeCoordinates | null;
  pouringColor: string | null;
  countPouringColors: number | null;
  countColorsInSourceTube: number | null;
  countColorsInTargetTube: number | null;
}

const TestTube = memo(
  forwardRef<View, TestTubeProps>(
    (
      {
        indexOfTube,
        colors,
        handleTubePress,
        isSelected,
        pouringFromTube,
        pouringToTube,
        selectedTubeCoordinates,
        pouringColor,
        countColorsInTargetTube,
        countPouringColors,
        countColorsInSourceTube,
      },
      ref
    ) => {
      const [angle, setAngle] = useState(() => {
        const heightOfPouredLayers = colors.split(", ").length * 25;
        const percentagePoured = heightOfPouredLayers / 150;
        return Math.round((1 - percentagePoured) * 90);
      });
      const [isVisible, setIsVisible] = useState(true);
      const [tubeCoordinates, setTubeCoordinates] = useState({ x: 0, y: 0 });
      // const [tubeOnPouringPosition, setTubeOnPouringPosition] = useState(false);

      const translateX = useRef(new Animated.Value(0)).current;
      const translateY = useRef(new Animated.Value(0)).current;
      const rotateAnim = useRef(new Animated.Value(0)).current;
      const borderAnim = useRef(new Animated.Value(0)).current;

      const startAnimationTranslateTube = useRef(false);

      useEffect(() => {
        if (startAnimationTranslateTube.current === false) {
          const heightOfPouredLayers = colors.split(", ").length * 25;
          const percentagePoured = heightOfPouredLayers / 150;

          // Использование countPouringColors в вычислениях
          const adjustedPercentage =
            percentagePoured * (countPouringColors || 1); // Учитываем countPouringColors в расчете
          // Вычисление угла
          const angle = Math.round((1 - adjustedPercentage) * 90);

          console.log("angle", angle);

          setAngle(angle);
        }
      }, [colors]);

      useEffect(() => {
        // console.log("borderAnim");
        Animated.timing(borderAnim, {
          toValue: isSelected ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }, [isSelected]);
      // }, [isSelected]);

      // useEffect(() => {
      //   if (tubeOnPouringPosition) {
      //     Animated.timing(rotateAnim, {
      //       toValue: 1,
      //       duration: 500,
      //       useNativeDriver: true,
      //     }).start(() => {
      //       Animated.timing(rotateAnim, {
      //         toValue: 0,
      //         duration: 500,
      //         useNativeDriver: true,
      //       }).start(); // You need to call .start() for the second animation
      //     });
      //   }
      // }, [tubeOnPouringPosition]);

      useEffect(() => {
        if (pouringFromTube && selectedTubeCoordinates) {
          startAnimationTranslateTube.current = true;
          setIsVisible(false);

          // Анимация перемещения вперед
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: selectedTubeCoordinates.pageX - tubeCoordinates.x - 68,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: selectedTubeCoordinates.pageY - tubeCoordinates.y - 105,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
            // setTubeOnPouringPosition(true);
          });
        }
      }, [pouringFromTube, selectedTubeCoordinates]);

      // translate back tube
      useEffect(() => {
        if (
          !pouringFromTube &&
          !selectedTubeCoordinates &&
          startAnimationTranslateTube.current
        ) {
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 300,
            delay: 300,
            useNativeDriver: true,
          }).start(() => {
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setIsVisible(true);
              startAnimationTranslateTube.current = false;
            });
          });
        }
      }, [pouringFromTube, selectedTubeCoordinates]);

      const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["gray", "gold"],
      });

      const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", `${angle}deg`],
        // outputRange: ["0deg", "45deg"],
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
            onPress={handleTubePress}
            onLayout={onLayout}
            style={{ zIndex: 10 }}
          >
            <Animated.View
              style={[
                styles.tube,
                {
                  borderColor,
                  opacity: isVisible ? 1 : 0,
                },
              ]}
            >
              {colors.split(", ").map((color, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.liquid,
                    {
                      backgroundColor: color ? color : "transparent",
                      bottom: index * LIQUID_HEIGHT_COLOR,
                      borderBottomLeftRadius: index === 0 ? 30 : 0,
                      borderBottomRightRadius: index === 0 ? 30 : 0,
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
                opacity: isVisible ? 0 : 1,
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
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
                angle={angle}
                pouringFromTube={pouringFromTube}
                selectedTubeCoordinates={selectedTubeCoordinates}
                pouringColor={pouringColor}
                countColorsInTargetTube={countColorsInTargetTube}
              />
              {colors.split(", ").map((color, index) => (
                // <PaintCoat key={index} color={color} index={index} />
                <Animated.View
                  key={index}
                  style={[
                    styles.liquid,
                    {
                      backgroundColor: color ? color : "transparent",
                      bottom: index * LIQUID_HEIGHT_COLOR,
                      borderBottomLeftRadius: index === 0 ? 30 : 0,
                      borderBottomRightRadius: index === 0 ? 30 : 0,
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </>
      );
    }
  )
);

TestTube.displayName = "MemoizedTestTube";

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
    // borderRadius: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // overflow: "hidden",
    borderTopWidth: 0,
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
