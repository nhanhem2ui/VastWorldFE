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
  claimingId: number | null;
  error: string;
}

let state: QuestNotifState = {
  queue: [],
  claimingId: null,
  error: "",
};

const listeners = new Set<() => void>();

function setState(patch: Partial<QuestNotifState>) {
  //update patch into state
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function upsert(n: QuestCompletedNotification) {  
  if (state.queue.some(q => q.questId === n.questId)) return;

  setState({
    //add n to queue
    queue: [...state.queue, n],
  });
}

onSSE("quest-completed", (data) => {
  upsert(data as QuestCompletedNotification);
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

export async function claimQuest(questId: number) {
  setState({
    claimingId: questId,
    error: "",
  });

  try {
    const res = await fetch(`/api/quests/${questId}/claim`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Claim failed (${res.status})`);
    }

    setState({
      queue: state.queue.filter(q => q.questId !== questId),
      claimingId: null,
    });

    await refreshPlayer();
  } catch (e) {
    setState({
      claimingId: null,
      error: e instanceof Error
        ? e.message
        : "Could not claim reward.",
    });
  }
}

export function useQuestNotifications() {
  const { queue, claimingId, error } =
    useSyncExternalStore(subscribe, getSnapshot);

  return {
    current: queue[0] ?? null,
    queueLength: queue.length,
    claimingId,
    error,
    claimQuest,
  };
}