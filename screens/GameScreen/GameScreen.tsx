import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  View,
  Text,
  Alert,
  ImageBackground,
} from "react-native";
import TestTube from "@/components/TestTube/TestTube";
import { levels } from "@/constants/constants";
import LevelCompletionModal from "@/components/LevelCompletionModal/LevelCompletionModal";
import { getTubeCoordinates } from "./utils/getTubeCoordinates";
import { getAmountToMove } from "./utils/getAmountToMove";
import { canPourLiquid } from "./utils/canPourLiquid";
import { countLastColors } from "./utils/countLastColors";

export interface TubeCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface PouringInfo {
  pouringColor: string; // Цвет, который переливают
  countPouringColors: number; // Количество цветов, которые будут переливаться
  countColorsInSourceTube: number; // Количество цветов в пробирке, из которой льём
  countColorsInTargetTube: number; // Количество цветов в целевой пробирке ДО переливания
}

const GameScreen = () => {
  const gameLevels: string[][][] = JSON.parse(JSON.stringify(levels));

  const [level, setLevel] = useState(0);
  const [tubes, setTubes] = useState(gameLevels[level]);
  const [currentTube, setCurrentTube] = useState<number | null>(null);
  const [pouringFromTube, setPouringFromTube] = useState<number | null>(null);
  const [pouringToTube, setPouringToTube] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTubeCoordinates, setSelectedTubeCoordinates] =
    useState<TubeCoordinates | null>(null);
  const [pouringInfo, setPouringInfo] = useState<PouringInfo | null>(null);

  const tubeRefs = useRef<(View | null)[]>([]);

  const pourLiquid = (
    from: number,
    to: number,
    amountToMove: number,
    tubes: string[][]
  ) => {
    if (from === to || tubes[from].length === 0 || tubes[to].length === 6)
      return;

    const newTubes = [...tubes];
    const fromTube = newTubes[from];
    const toTube = newTubes[to];

    // Переливаем жидкость
    for (let i = 0; i < amountToMove; i++) {
      const currentPouringColor = fromTube.pop()!;

      toTube.push(currentPouringColor);
    }

    setTubes(newTubes);
  };

  const handleTubePress = (index: number) => {
    if (currentTube === null) {
      setCurrentTube(index);
      return;
    }

    const newTubes = [...tubes];
    const fromTube = newTubes[currentTube];
    const toTube = newTubes[index];

    const amountToMove = getAmountToMove(fromTube);

    if (
      currentTube !== index &&
      canPourLiquid(fromTube, toTube, amountToMove)
    ) {
      // Получаем координаты при нажатии
      getTubeCoordinates(index, tubeRefs, setSelectedTubeCoordinates);

      setPouringFromTube(currentTube); // Запускаем анимацию для пробирки-донора
      setPouringToTube(index); // Запускаем анимацию для пробирки-рецепиента

      const currentPouringTube = tubes[currentTube];
      const countPouringColors = countLastColors(currentPouringTube);

      const currentPouringColor = currentPouringTube.findLast((el) => el);
      // setPouringColor(currentPouringColor ?? "transparent");
      setPouringInfo((prev) => {
        if (!prev) {
          return {
            pouringColor: currentPouringColor ?? "transparent",
            countPouringColors,
            countColorsInSourceTube: currentPouringTube.length,
            countColorsInTargetTube: toTube.length,
          };
        } else {
          return null;
        }
      });

      setTimeout(() => {
        pourLiquid(currentTube, index, amountToMove, tubes);
        setPouringFromTube(null); // Сбрасываем анимацию после переливания
        setPouringToTube(null); // Сбрасываем анимацию после переливания
        setSelectedTubeCoordinates(null);
        setPouringInfo(null);
      }, 1000); // Даем время на анимацию и чистим
    }

    setCurrentTube(null);
  };

  // checkLevelCompletion
  useEffect(() => {
    const checkLevelCompletion = (newTubes: string[][]) => {
      // Проверяем, завершен ли уровень (все пробирки заполнены правильными цветами)
      const isLevelComplete = newTubes.every((tube) => {
        return (
          tube.length === 0 || // Пустые пробирки игнорируем
          (tube.length > 1 && tube.every((color) => color === tube[0])) // Все цвета одинаковые и их больше 1
        );
      });

      if (isLevelComplete) {
        setTimeout(() => {
          if (level < gameLevels.length - 1) {
            setShowModal(true);
          } else {
            Alert.alert("Поздравляем! Вы прошли все уровни!");
          }
        }, 300); // Добавляем задержку, чтобы игрок видел последний перелив
      }
    };

    checkLevelCompletion(tubes);
  }, [tubes]);

  const resetGame = useCallback(() => {
    const copyGameLevels = JSON.parse(JSON.stringify(levels));

    setTubes(copyGameLevels[level]);
    setCurrentTube(null);
  }, [level]);

  const handleNextLevel = () => {
    setShowModal(false);
    if (level < levels.length - 1) {
      setLevel((prev) => (prev += 1));
      setTubes(gameLevels[level + 1]);
    } else {
      alert("Поздравляем! Вы прошли все уровни!");
    }
  };

  console.log("pouring info", pouringInfo);

  return (
    <ImageBackground
      style={{ height: "100%", width: "auto" }}
      source={require("../../assets/images/bg.jpg")}
    >
      {showModal && (
        <LevelCompletionModal level={level} onNextLevel={handleNextLevel} />
      )}
      <Text style={styles.levelText}>Уровень: {level + 1}</Text>
      <View style={styles.container}>
        {tubes.map((colors, index) => (
          <TestTube
            key={index}
            colors={colors}
            ref={(el) => (tubeRefs.current[index] = el)}
            onPress={() => handleTubePress(index)}
            isSelected={currentTube === index}
            pouringFromTube={pouringFromTube === index}
            pouringToTube={pouringToTube === index}
            selectedTubeCoordinates={selectedTubeCoordinates}
            pouringColor={pouringInfo?.pouringColor ?? null}
            countPouringColors={pouringInfo?.countPouringColors ?? null}
            countColorsInSourceTube={
              pouringInfo?.countColorsInSourceTube ?? null
            }
            countColorsInTargetTube={
              pouringInfo?.countColorsInTargetTube ?? null
            }
          />
        ))}
      </View>
      <Button title="Уровень с начала" onPress={resetGame} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    gap: 2,
  },
  levelText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default GameScreen;
