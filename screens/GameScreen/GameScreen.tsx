import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, View, Text, Alert } from "react-native";
import TestTube from "@/components/TestTube/TestTube";
import { levels } from "@/constants/constants";
import LevelCompletionModal from "@/components/LevelCompletionModal/LevelCompletionModal";
import { getTubeCoordinates } from "./utils/getTubeCoordinates";
import { getAmountToMove } from "./utils/getAmountToMove";
import { canPourLiquid } from "./utils/canPourLiquid";

export interface TubeCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

const GameScreen = () => {
  console.log("game screen =====");
  const [level, setLevel] = useState(0);
  const [tubes, setTubes] = useState(levels[level]);
  const [currentTube, setCurrentTube] = useState<number | null>(null);
  const [pouringFromTube, setPouringFromTube] = useState<number | null>(null);
  const [pouringToTube, setPouringToTube] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTubeCoordinates, setSelectedTubeCoordinates] =
    useState<TubeCoordinates | null>(null);
  const [pouringColor, setPouringColor] = useState<string | null>(null);

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

      const currentPouringColor = tubes[currentTube].findLast((el) => el);
      setPouringColor(currentPouringColor ?? "transparent");

      setTimeout(() => {
        pourLiquid(currentTube, index, amountToMove, tubes);
        setPouringFromTube(null); // Сбрасываем анимацию после переливания
        setPouringToTube(null); // Сбрасываем анимацию после переливания
        setSelectedTubeCoordinates(null);
      }, 1000); // Даем время на анимацию
    }

    setCurrentTube(null);
  };

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
          if (level < levels.length - 1) {
            setShowModal(true);
          } else {
            Alert.alert("Поздравляем! Вы прошли все уровни!");
          }
        }, 300); // Добавляем задержку, чтобы игрок видел последний перелив
      }
    };

    checkLevelCompletion(tubes);
  }, [tubes]);

  const resetGame = () => {
    setTubes(levels[level]);
    setCurrentTube(null);
  };

  const handleNextLevel = () => {
    setShowModal(false);
    if (level < levels.length - 1) {
      setLevel(level + 1); // Переход к следующему уровню
      setTubes(levels[level + 1]); // Устанавливаем следующий уровень
    } else {
      alert("Поздравляем! Вы прошли все уровни!");
    }
  };

  return (
    <>
      {showModal && (
        <LevelCompletionModal level={level} onNextLevel={handleNextLevel} />
      )}
      <Text style={styles.levelText}>Уровень: {level + 1}</Text>
      <View style={styles.container}>
        {tubes.map((colors, index) => (
          <TestTube
            indexOfTube={index}
            key={index}
            colors={colors}
            ref={(el) => (tubeRefs.current[index] = el)}
            onPress={() => handleTubePress(index)}
            isSelected={currentTube === index}
            pouringFromTube={pouringFromTube === index}
            pouringToTube={pouringToTube === index}
            selectedTubeCoordinates={selectedTubeCoordinates}
            pouringColor={pouringColor}
          />
        ))}
      </View>
      <Button title="Reset" onPress={resetGame} />
    </>
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
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default GameScreen;
