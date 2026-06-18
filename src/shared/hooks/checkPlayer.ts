import { useEffect, useState } from "react";

import { getAuthToken, getStoredUser } from "./authSession";

import type { ServiceResult } from "@/types/ServiceResult";
import type { PlayerResponse } from "@/types/PlayerResponse";
import type { PlayerSpiritRootResponse } from "@/types/PlayerSpiritRootResponse";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function fetchPlayer(): Promise<PlayerResponse>{

  const token = getAuthToken();
  const user = getStoredUser();

  if (!token || !user?.userID){
    throw new Error(
      "Please sign in."
    );
  }

  console.log(user);
  const response = await fetch(`${baseUrl}/api/players/${encodeURIComponent(user.playerID ?? "")}`,
      {
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        }
      }
    );

  const result: ServiceResult<PlayerResponse> = await response.json();
  if (!result.data){
    throw new Error(
      "Player not found."
    );
  }

  return result.data;
}

export function usePlayerSpiritRoot() {

  const [spiritRoots,setSpiritRoots] = useState<PlayerSpiritRootResponse[] | null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  useEffect(()=>{
    async function load(){
      try{
        const player = await fetchPlayer();
        const token = getAuthToken();
        const response =await fetch(`${baseUrl}/api/player-spirit-roots/${player.id}`,
            {
              headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${token}`,
              }
            }
          );
        const result:ServiceResult<PlayerSpiritRootResponse[]> = await response.json();
        setSpiritRoots(result.data ?? []);
      } catch(error){
        setError(
          error instanceof Error
          ? error.message
          : "Could not load spirit roots."
        );
      } finally{
        setLoading(false);
      }
    }
    load();
  },[]);
  return {
    spiritRoots,
    loading,
    error,
  };
}