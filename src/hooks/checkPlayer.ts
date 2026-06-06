import { useEffect, useState } from "react";

import { getAuthToken, getStoredUser } from "./authSession";

import type { ServiceResult } from "../types/ServiceResult";
import type { PlayerResponse } from "../types/PlayerResponse";

export function useExistingPlayer() {
  const [player, setPlayer] = useState<PlayerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  useEffect(() => {
    const token = getAuthToken();
    const user = getStoredUser();
    async function loadPlayer() {
      if (!token || !user?.userID) {
        setError("Please sign in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/api/players?id=${encodeURIComponent(user.userID)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: ServiceResult<PlayerResponse> =
          await response.json();

        if (result.data) {
          setPlayer(result.data);
          console.log(result.data);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load player."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlayer();
  }, []);

  return {
    player,
    loading,
    error,
  };
}