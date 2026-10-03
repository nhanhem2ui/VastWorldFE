import { useSyncExternalStore } from "react";
import { refreshPlayer } from "@/shared/hooks/playerStore";
import { holdConnection, onSSE } from "./sseConnection";

export interface QuestCompletedNotification {
  questId: number;
  questName: string;
  description: string;
  completedImageUrl: string;
  rewardsText: string;
}

interface QuestNotifState {
  queue: QuestCompletedNotification[];
}

let state: QuestNotifState = { queue: [] };

const listeners = new Set<() => void>();

function setState(patch: Partial<QuestNotifState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function upsert(n: QuestCompletedNotification) {
  if (state.queue.some((q) => q.questId === n.questId)) return;
  setState({ queue: [...state.queue, n] });
}

onSSE("quest-completed", (data) => {
  upsert(data as QuestCompletedNotification);
  // Rewards are already granted server-side, so sync the player now
  void refreshPlayer();
});

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const release = holdConnection(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    release();
  };
}

function getSnapshot(): QuestNotifState {
  return state;
}

export function dismissQuestNotification(questId: number) {
  setState({ queue: state.queue.filter((q) => q.questId !== questId) });
}

export function useQuestNotifications() {
  const { queue } = useSyncExternalStore(subscribe, getSnapshot);

  return {
    current: queue[0] ?? null,
    queueLength: queue.length,
    dismiss: dismissQuestNotification,
  };
}