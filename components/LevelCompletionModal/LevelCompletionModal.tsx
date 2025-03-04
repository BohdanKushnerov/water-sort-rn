import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";

interface LevelCompletionModalProps {
  level: number;
  onNextLevel: () => void;
}

const LevelCompletionModal: React.FC<LevelCompletionModalProps> = ({
  level,
  onNextLevel,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Level {level + 1} Completed! 🎉</Text>
          <Image
            source={require("../../assets/images/IMG_20250224_095320.jpg")}
            style={{ width: 250, height: 400 }}
          />
          <Pressable style={styles.button} onPress={onNextLevel}>
            <Text style={styles.buttonText}>Next Level</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default LevelCompletionModal;
