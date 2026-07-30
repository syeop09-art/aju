import AsyncStorage from "@react-native-async-storage/async-storage";
import { RUN_SESSION_STORAGE_KEY } from "../constants/tracking";
import { createEmptySession, type RunSession } from "../types/run";

export async function getRunSession(): Promise<RunSession> {
  const serialized = await AsyncStorage.getItem(RUN_SESSION_STORAGE_KEY);
  if (!serialized) return createEmptySession();

  try {
    return JSON.parse(serialized) as RunSession;
  } catch {
    return createEmptySession();
  }
}

export async function saveRunSession(session: RunSession): Promise<void> {
  await AsyncStorage.setItem(
    RUN_SESSION_STORAGE_KEY,
    JSON.stringify({ ...session, updatedAt: Date.now() }),
  );
}

export async function clearRunSession(): Promise<void> {
  await AsyncStorage.removeItem(RUN_SESSION_STORAGE_KEY);
}
