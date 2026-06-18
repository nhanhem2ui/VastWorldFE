import { useSyncExternalStore, useEffect } from "react";
import { fetchPlayer } from "@/shared/hooks/checkPlayer";
import type { PlayerResponse } from "@/types/PlayerResponse";

interface PlayerState {
  player: PlayerResponse | null;
  loading: boolean;
  error: string;
}

let state: PlayerState = { player: null, loading: true, error: "" };
let initialized = false;
const listeners = new Set<() => void>();

//internal
function setState(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  //Cleanup (unsubscribe) function, when component unmounts
  return () => listeners.delete(onStoreChange);
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

//api

/** Call this after any mutation that changes player data. */
export async function refreshPlayer() {
  initialized = false;
  await doLoad();
  initialized = true;
}

/** Wipe the store on logout. */
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
  }, []);

  return { player, loading, error, refreshPlayer };
}