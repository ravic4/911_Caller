import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { BACKEND_URL } from "../constants";

let recordingInstance: Audio.Recording | null = null;

export async function startAudioRecording() {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true, // record even in silent mode
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  recordingInstance = recording;
  return recording;
}

export async function stopAndUploadRecording(): Promise<string | null> {
  if (!recordingInstance) return null;

  await recordingInstance.stopAndUnloadAsync();
  const uri = recordingInstance.getURI();
  recordingInstance = null;

  if (!uri) return null;

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: `recording-${Date.now()}.m4a`,
    type: "audio/m4a",
  } as any);

  const res = await fetch(`${BACKEND_URL}/api/upload/recording`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.path ?? null;
}

export function isRecording() {
  return recordingInstance !== null;
}
