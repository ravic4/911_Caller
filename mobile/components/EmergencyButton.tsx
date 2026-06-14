import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Vibration,
} from "react-native";
import { COLORS } from "../constants";

interface Props {
  onActivate: () => void;
  label?: string;
}

// Hold for 1.5s to activate — prevents accidental triggers.
const HOLD_MS = 1500;

export function EmergencyButton({ onActivate, label = "HOLD FOR HELP" }: Props) {
  const [active, setActive] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const handlePressIn = () => {
    Vibration.vibrate(50);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
    animRef.current.start();

    timerRef.current = setTimeout(() => {
      setActive(true);
      Vibration.vibrate([0, 100, 50, 100]);
      onActivate();
    }, HOLD_MS);
  };

  const handlePressOut = () => {
    timerRef.current && clearTimeout(timerRef.current);
    animRef.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const ringScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const ringOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.ring,
          { transform: [{ scale: ringScale }], opacity: ringOpacity },
        ]}
      />
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, active && styles.buttonActive]}
      >
        <Text style={styles.label}>{active ? "ALERT SENT" : label}</Text>
        {!active && (
          <Text style={styles.sublabel}>Release to cancel</Text>
        )}
      </Pressable>
    </View>
  );
}

const BTN = 200;

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    width: BTN + 40,
    height: BTN + 40,
    borderRadius: (BTN + 40) / 2,
    backgroundColor: COLORS.danger,
  },
  button: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  buttonActive: { backgroundColor: COLORS.dangerDark },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
  },
  sublabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 6 },
});
