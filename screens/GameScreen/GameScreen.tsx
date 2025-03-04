import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, View, Text, Alert } from "react-native";
import TestTube from "@/components/TestTube/TestTube";
import { levels } from "@/constants/constants";
import LevelCompletionModal from "@/components/LevelCompletionModal/LevelCompletionModal";

export interface TubeCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

const GameScreen = () => {
  const [level, setLevel] = useState(0);
  const [tubes, setTubes] = useState(levels[level]);
  const [currentTube, setCurrentTube] = useState<number | null>(null);
  const [pouringFromTube, setPouringFromTube] = useState<number | null>(null);
  const [pouringToTube, setPouringToTube] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTubeCoordinates, setSelectedTubeCoordinates] =
    useState<TubeCoordinates | null>(null);

  const tubeRefs = useRef<Array<any>>([]);

  // console.log("selectedTubeCoordinates", selectedTubeCoordinates);

  // console.log("pouringFromTube", pouringFromTube);
  // console.log("pouringToTube", pouringToTube);

  const pourLiquid = (from: number, to: number) => {
    if (from === to || tubes[from].length === 0 || tubes[to].length === 6)
      return;

    const newTubes = [...tubes];
    const fromTube = newTubes[from];
    const toTube = newTubes[to];

    const movingLiquid = fromTube[fromTube.length - 1]; // Цвет, который будем переливать
    let amountToMove = 0;

    // Определяем, сколько одинаковых сверху слоев можно перелить
    for (let i = fromTube.length - 1; i >= 0; i--) {
      if (fromTube[i] === movingLiquid) {
        amountToMove++;
      } else {
        break;
      }
    }

    // Проверяем, можно ли вылить все amountToMove слоев
    if (
      toTube.length + amountToMove <= 6 && // Проверяем, что не переполняем пробирку
      (toTube.length === 0 || toTube[toTube.length - 1] === movingLiquid) // Совпадение цветов
    ) {
      // Переливаем
      for (let i = 0; i < amountToMove; i++) {
        toTube.push(fromTube.pop()!);
      }
    }

    setTubes(newTubes);
  };

  const handleTubePress = (index: number) => {
    if (currentTube === null) {
      setCurrentTube(index);
    } else {
      if (currentTube !== index) {
        setPouringFromTube(currentTube); // Запускаем анимацию для пробирки-донора
        setPouringToTube(index); // Запускаем анимацию для пробирки-рецепиента

        setTimeout(() => {
          pourLiquid(currentTube, index);
          setPouringFromTube(null); // Сбрасываем анимацию после переливания
          setPouringToTube(null); // Сбрасываем анимацию после переливания
        }, 600); // Даем время на анимацию
      }

      setCurrentTube(null);
    }

    // Получаем координаты при нажатии с помощью метода measure
    if (tubeRefs.current[index]) {
      tubeRefs.current[index].measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          setSelectedTubeCoordinates({ x, y, width, height, pageX, pageY });
        }
      );
    }
  };

  const checkLevelCompletion = (newTubes: string[][]) => {
    // console.log(111, "checkLevelCompletion");
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
      }, 2000); // Добавляем задержку, чтобы игрок видел последний перелив
    }
  };

  useEffect(() => {
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
            key={index}
            colors={colors}
            ref={(el) => (tubeRefs.current[index] = el)}
            onPress={() => handleTubePress(index)}
            isSelected={currentTube === index}
            pouringFromTube={pouringFromTube === index}
            pouringToTube={pouringToTube === index}
            selectedTubeCoordinates={selectedTubeCoordinates}
          />
        ))}
      </View>
      <Button title="Reset" onPress={resetGame} />
      {selectedTubeCoordinates && (
        <Text>
          Координаты выбранной пробирки: x={selectedTubeCoordinates.x}, y=
          {selectedTubeCoordinates.y}, width={selectedTubeCoordinates.width},
          height={selectedTubeCoordinates.height}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
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
