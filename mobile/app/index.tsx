import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { VoiceAgent } from "../components/VoiceAgent";
import { sendSilentAlert } from "../services/alert";
import { requestLocationPermission } from "../services/location";
import {
  isRecording,
  startAudioRecording,
  stopAndUploadRecording,
} from "../services/recording";
import { COLORS } from "../constants";

export default function HomeScreen() {
  const [silentMode, setSilentMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleEmergency = async () => {
    setAlertSent(true);

    // Always send silent location alert
    sendSilentAlert("I need help. This is an automated emergency alert.").catch(
      console.error
    );

    // Start recording if not already
    if (!isRecording()) {
      startAudioRecording()
        .then(() => setRecording(true))
        .catch(console.error);
    }
  };

  const handleStopRecording = async () => {
    const path = await stopAndUploadRecording();
    setRecording(false);
    if (path) {
      Alert.alert("Recording saved", `Uploaded to server: ${path}`);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>Safe911</Text>
        <Text style={styles.subtitle}>Emergency Voice Assistant</Text>
      </View>

      {/* Silent mode toggle */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Silent mode</Text>
        <Switch
          value={silentMode}
          onValueChange={setSilentMode}
          trackColor={{ true: COLORS.danger }}
          thumbColor="#fff"
        />
      </View>
      <Text style={styles.hint}>
        {silentMode
          ? "Screen stays dark. Hold volume-down to trigger alert."
          : "Visible mode — hold the button to alert contacts."}
      </Text>

      {!silentMode && (
        <>
          <View style={styles.center}>
            <EmergencyButton onActivate={handleEmergency} />
          </View>

          {alertSent && (
            <Text style={styles.alertBadge}>
              Contacts alerted · Location sent
            </Text>
          )}

          {/* Recording controls */}
          <View style={styles.recRow}>
            {recording ? (
              <Pressable style={styles.recBtn} onPress={handleStopRecording}>
                <Text style={styles.recText}>Stop & Upload Recording</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.recBtn, styles.recBtnStart]}
                onPress={() =>
                  startAudioRecording().then(() => setRecording(true))
                }
              >
                <Text style={styles.recText}>Record Audio Evidence</Text>
              </Pressable>
            )}
          </View>

          {recording && (
            <Text style={styles.recIndicator}>Recording in progress...</Text>
          )}
        </>
      )}

      {/* Voice agent — always available */}
      <View style={styles.agentSection}>
        <Text style={styles.sectionTitle}>911 Voice Agent</Text>
        <Text style={styles.sectionDesc}>
          Connects you to an AI relay that translates and communicates with
          emergency operators on your behalf.
        </Text>
        <VoiceAgent />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: { marginBottom: 24 },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitle: { color: COLORS.muted, fontSize: 14, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  rowLabel: { color: COLORS.text, fontSize: 16 },
  hint: { color: COLORS.muted, fontSize: 12, marginBottom: 16 },
  center: { alignItems: "center", marginVertical: 40 },
  alertBadge: {
    textAlign: "center",
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 13,
    marginTop: -20,
    marginBottom: 16,
  },
  recRow: { alignItems: "center", marginVertical: 8 },
  recBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  recBtnStart: { borderWidth: 1, borderColor: COLORS.muted },
  recText: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  recIndicator: {
    textAlign: "center",
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  agentSection: {
    marginTop: "auto",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
