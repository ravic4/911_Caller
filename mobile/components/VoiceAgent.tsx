import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ElevenLabsProvider, useConversation } from "@elevenlabs/react-native";
import { COLORS } from "../constants";
import { fetchAgentToken } from "../services/alert";

function AgentControls({ userProfile }: { userProfile?: object }) {
  const conversation = useConversation({
    onConnect: () => console.log("[Agent] Connected"),
    onDisconnect: () => console.log("[Agent] Disconnected"),
    onMessage: (msg) => console.log("[Agent] Message:", msg),
    onError: (err) => console.error("[Agent] Error:", err),
  });

  const connect = useCallback(async () => {
    try {
      const { token } = await fetchAgentToken(userProfile);
      await conversation.startSession({ conversationToken: token });
    } catch (err) {
      console.error("Failed to start agent session:", err);
    }
  }, [conversation, userProfile]);

  const isConnected = conversation.status === "connected";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isConnected
          ? conversation.isSpeaking
            ? "Agent speaking..."
            : "Listening..."
          : "Voice Agent Ready"}
      </Text>
      <Pressable
        style={[styles.btn, isConnected ? styles.btnActive : styles.btnIdle]}
        onPress={isConnected ? () => conversation.endSession() : connect}
      >
        <Text style={styles.btnText}>
          {isConnected ? "End Call" : "Call Agent"}
        </Text>
      </Pressable>
    </View>
  );
}

export function VoiceAgent({ userProfile }: { userProfile?: object }) {
  return (
    <ElevenLabsProvider>
      <AgentControls userProfile={userProfile} />
    </ElevenLabsProvider>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12 },
  label: { color: COLORS.muted, fontSize: 14 },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  btnIdle: { backgroundColor: COLORS.surface },
  btnActive: { backgroundColor: COLORS.safe + "33" },
  btnText: { color: COLORS.text, fontWeight: "600", fontSize: 16 },
});
