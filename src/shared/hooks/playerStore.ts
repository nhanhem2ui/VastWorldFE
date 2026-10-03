import { useSyncExternalStore, useEffect } from "react";
import { fetchPlayer } from "@/shared/hooks/checkPlayer";
import type { PlayerResponse } from "@/types/PlayerResponse";
import { onSSE, holdConnection } from "./sseConnection";

interface PlayerState {
  player: PlayerResponse | null;
  loading: boolean;
  error: string;
}

let state: PlayerState = { player: null, loading: true, error: "" };
let initialized = false;
const listeners = new Set<() => void>();

function setState(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

//TODO: eh ?
onSSE("player-update", (data) => {
  setState({ player: data as PlayerResponse, loading: false, error: "" });
});

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const releaseConnection = holdConnection(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    releaseConnection();
  };
}

function getSnapshot(): PlayerState {
  return state;
}

async function doLoad() {
  setState({ loading: true, error: "" });
  try {
    const player = await fetchPlayer();
    setState({ player, loading: false });
  } catch (e) {
    setState({
      player: null,
      loading: false,
      error: e instanceof Error ? e.message : "Could not load player.",
    });
  }
}

export async function refreshPlayer() {
  initialized = false;
  await doLoad();
  initialized = true;
}

export function resetPlayerStore() {
  state = { player: null, loading: true, error: "" };
  initialized = false;
  listeners.forEach(listener => listener());
}

export function usePlayer() {
  const { player, loading, error } = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      doLoad();
    }
  }, [player?.cultivationPoint, player?.cultivationSpeed]);

  return { player, loading, error, refreshPlayer };
}