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
  const gameLevels: string[][] = JSON.parse(JSON.stringify(levels));

  const [level, setLevel] = useState(0);
  const [tubes, setTubes] = useState(gameLevels[level]);
  const [currentTube, setCurrentTube] = useState<number | null>(null);
  const [pouringFromTube, setPouringFromTube] = useState<number | null>(null);
  const [pouringToTube, setPouringToTube] = useState<number | null>(null);
  const [selectedTubeCoordinates, setSelectedTubeCoordinates] =
    useState<TubeCoordinates | null>(null);
  const [pouringInfo, setPouringInfo] = useState<PouringInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const tubeRefs = useRef<(View | null)[]>([]);

  const handleTubePress = useCallback(
    (index: number, tubes: string[], currentTube: number | null) => () => {
      if (currentTube === null) {
        setCurrentTube(index);
        return;
      }

      const fromTube = tubes[currentTube].split(", ");
      const toTube = tubes[index].split(", ");

      const amountToMove = getAmountToMove(fromTube);

      if (
        currentTube !== index &&
        canPourLiquid(fromTube, toTube, amountToMove)
      ) {
        const pourLiquid = (
          from: number,
          to: number,
          amountToMove: number,
          tubes: string[]
        ) => {
          if (
            from === to ||
            tubes[from].split(", ").length === 0 ||
            tubes[to].split(", ").length === 6
          ) {
            return;
          }

          const newTubes = [...tubes];
          const fromTube = newTubes[from].split(", ").filter(Boolean);
          const toTube = newTubes[to].split(", ").filter(Boolean);

          // Переливаем жидкость
          for (let i = 0; i < amountToMove; i++) {
            if (fromTube.length === 0) break; // Если в пробирке ничего не осталось, выходим
            const currentPouringColor = fromTube.pop()!;

            // Добавляем цвет в целевую пробирку
            toTube.push(currentPouringColor);
          }

          // Записываем обновлённые пробирки обратно
          newTubes[from] = fromTube.join(", ");
          newTubes[to] = toTube.join(", ");

          setTubes(newTubes);
        };
        // Получаем координаты при нажатии
        getTubeCoordinates(index, tubeRefs, setSelectedTubeCoordinates);

        setPouringFromTube(currentTube); // Запускаем анимацию для пробирки-донора
        setPouringToTube(index); // Запускаем анимацию для пробирки-рецепиента

        const currentPouringTube = tubes[currentTube].split(", ");
        const countPouringColors = countLastColors(currentPouringTube);
        const currentPouringColor = currentPouringTube.findLast((el) => el);

        setPouringInfo((prev) =>
          prev
            ? null
            : {
                pouringColor: currentPouringColor ?? "transparent",
                countPouringColors,
                countColorsInSourceTube: currentPouringTube.length,
                countColorsInTargetTube: toTube[0] === "" ? 0 : toTube.length,
              }
        );

        setTimeout(() => {
          pourLiquid(currentTube, index, amountToMove, tubes);
          setPouringFromTube(null);
          setPouringToTube(null);
          setSelectedTubeCoordinates(null);
          setPouringInfo(null);
        }, 1000);
      }

      setCurrentTube(null);
    },
    []
  );

  // checkLevelCompletion
  useEffect(() => {
    const checkLevelCompletion = (newTubes: string[]) => {
      // Проверяем, завершен ли уровень (все пробирки заполнены правильными цветами)
      const isLevelComplete = newTubes.every((tube) => {
        const colors = tube.split(", ").filter(Boolean); // Разделяем цвета и убираем пустые
        return (
          colors.length === 0 || // Игнорируем пустые пробирки
          (colors.length >= 4 && colors.every((color) => color === colors[0])) // Минимум 4 одинаковых цвета
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

  // const setTubeRef = useCallback(
  //   (index: number) => (el: View | null) => {
  //     tubeRefs.current[index] = el;
  //   },
  //   []
  // );
  const setTubeRef = (index: number) => (el: View | null) => {
    tubeRefs.current[index] = el;
  };

  // console.log("============", pouringInfo);

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
            indexOfTube={index}
            key={index}
            colors={colors}
            ref={setTubeRef(index)}
            // onPress={() => handleTubePress(index)}
            handleTubePress={handleTubePress(index, tubes, currentTube)}
            isSelected={currentTube === index}
            pouringFromTube={pouringFromTube === index}
            pouringToTube={pouringToTube === index}
            selectedTubeCoordinates={
              pouringFromTube === index && selectedTubeCoordinates
                ? selectedTubeCoordinates
                : null
            }
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
