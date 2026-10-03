import { useState, useEffect, useCallback } from "react";
import styles from "../assets/css/QuestPanel.module.css";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
import type { ServiceResult } from "@/types/ServiceResult";
import {
  type AvailableQuest,
  type AcceptedQuest,
  type ObjectiveProgress,
  OBJECTIVE_ICON,
} from "../types/QuestTypes";
import { onSSE } from "@/shared/hooks/sseConnection";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    ...init,
  });

  // Read the body even on 4xx so the backend's message can be shown
  const result: ServiceResult<T> | null = await res.json().catch(() => null);

  if (!res.ok || !result?.success) {
    throw new Error(result?.message ?? `Yêu cầu thất bại (${res.status})`);
  }
  return result.data;
}

type QuestTab = "available" | "accepted";

export function QuestPanel() {
  const [activeTab, setActiveTab] = useState<QuestTab>("available");

  const [availableQuests, setAvailableQuests] = useState<AvailableQuest[]>([]);
  const [availableLoading, setAvailableLoading] = useState(true);
  const [availableError, setAvailableError] = useState<string | null>(null);

  const [acceptedQuests, setAcceptedQuests] = useState<AcceptedQuest[]>([]);
  const [acceptedLoading, setAcceptedLoading] = useState(true);
  const [acceptedError, setAcceptedError] = useState<string | null>(null);

  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  // silent = refetch without swapping the list for a loading message
  const loadAvailable = useCallback(async (silent = false) => {
    if (!silent) setAvailableLoading(true);
    setAvailableError(null);
    try {
      const data = await request<AvailableQuest[]>(`/api/quests`);
      setAvailableQuests(data ?? []);
    } catch (err) {
      setAvailableError(
        err instanceof Error ? err.message : "Đã có lỗi xảy ra",
      );
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  const loadAccepted = useCallback(async (silent = false) => {
    if (!silent) setAcceptedLoading(true);
    setAcceptedError(null);
    try {
      const data = await request<AcceptedQuest[]>(`/api/quests/accepted`);
      setAcceptedQuests(data ?? []);
    } catch (err) {
      setAcceptedError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setAcceptedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailable();
    loadAccepted();
  }, [loadAvailable, loadAccepted]);

  useEffect(
    () =>
      onSSE("quest-completed", () => {
        loadAccepted(true);
        loadAvailable(true);
      }),
    [loadAccepted, loadAvailable],
  );

  const handleAcceptQuest = async (questId: number) => {
    setAcceptingId(questId);
    try {
      await request<null>(`/api/quests/accept/${questId}`, {
        method: "POST",
      });
      await Promise.all([loadAvailable(true), loadAccepted(true)]);
      setActiveTab("accepted");
    } catch (err) {
      setFlashMessage(
        err instanceof Error ? err.message : "Không thể nhận nhiệm vụ",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "available" ? styles.tabActive : ""
          }`}
          onClick={() => {
            setActiveTab("available");
            loadAvailable(true);
          }}
        >
          Nhiệm Vụ Khả Dụng
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "accepted" ? styles.tabActive : ""
          }`}
          onClick={() => {
            setActiveTab("accepted");
            loadAccepted(true);
          }}
        >
          Nhiệm Vụ Đang Nhận
        </button>
      </div>

      <div className={styles.panelBody}>
        {activeTab === "available" ? (
          <AvailableQuestsList
            quests={availableQuests}
            loading={availableLoading}
            error={availableError}
            acceptingId={acceptingId}
            onAccept={handleAcceptQuest}
            onRetry={() => loadAvailable()}
          />
        ) : (
          <AcceptedQuestsList
            quests={acceptedQuests}
            loading={acceptedLoading}
            error={acceptedError}
            onRetry={() => loadAccepted()}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Available ---------- */

interface AvailableQuestsListProps {
  quests: AvailableQuest[];
  loading: boolean;
  error: string | null;
  acceptingId: number | null;
  onAccept: (questId: number) => void;
  onRetry: () => void;
}

function AvailableQuestsList({
  quests,
  loading,
  error,
  acceptingId,
  onAccept,
  onRetry,
}: AvailableQuestsListProps) {
  if (loading) {
    return <div className={styles.stateMessage}>Đang tải nhiệm vụ...</div>;
  }

  if (error) {
    return (
      <div className={styles.stateMessage}>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={onRetry}>
          Thử lại
        </button>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className={styles.stateMessage}>Hiện không có nhiệm vụ nào</div>
    );
  }

  return (
    <ul className={styles.questList}>
      {quests.map((quest) => (
        <li key={quest.id} className={styles.questCard}>
          <div className={styles.questCardHeader}>
            <span className={styles.questName}>{quest.name}</span>
            <span className={styles.questRealm}>{quest.requiredRealm}</span>
          </div>

          <ul className={styles.objectiveList}>
            {quest.questObjectives.map((objective, idx) => (
              <li key={idx} className={styles.objectiveItem}>
                <span className={styles.objectiveIcon}>
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(OBJECTIVE_ICON[objective.objectiveType])}`}
                    alt=""
                  />
                </span>
                <span>{objective.description}</span>
              </li>
            ))}
          </ul>

          <button
            className={styles.acceptButton}
            disabled={acceptingId === quest.id}
            onClick={() => onAccept(quest.id)}
          >
            {acceptingId === quest.id ? "Đang nhận..." : "Nhận Nhiệm Vụ"}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Accepted ---------- */

interface AcceptedQuestsListProps {
  quests: AcceptedQuest[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function AcceptedQuestsList({
  quests,
  loading,
  error,
  onRetry,
}: AcceptedQuestsListProps) {
  if (loading) {
    return <div className={styles.stateMessage}>Đang tải nhiệm vụ...</div>;
  }

  if (error) {
    return (
      <div className={styles.stateMessage}>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={onRetry}>
          Thử lại
        </button>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className={styles.stateMessage}>Bạn chưa nhận nhiệm vụ nào</div>
    );
  }

  return (
    <ul className={styles.questList}>
      {quests.map((quest) => (
        <li key={quest.id} className={styles.questCard}>
          <div className={styles.questCardHeader}>
            <span className={styles.questName}>{quest.name}</span>
            <span className={styles.questRealm}>{quest.requiredRealm}</span>
          </div>

          <ul className={styles.objectiveList}>
            {quest.objectiveAndProgressOfQuests.map((objective, idx) => (
              <ObjectiveRow key={idx} objective={objective} />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function describeProgress(o: ObjectiveProgress): {
  label: string;
  ratio: number | null;
} {
  switch (o.questType) {
    case "LEVEL_UP":
      return {
        label: `${o.currentRealm} ${o.currentRealmStage} → ${o.targetRealm} ${o.targetRealmStage}`,
        ratio: null,
      };
    case "REACH_COORDINATE":
      return {
        label: `(${o.currentX}, ${o.currentY}) → (${o.targetX}, ${o.targetY})`,
        ratio: null,
      };
    case "REACH_MAP":
      return { label: `Bản đồ ${o.currentMapId} → ${o.mapId}`, ratio: null };
    case "KILL_MONSTER":
    case "COLLECT_ITEM": {
      const current = o.currentCount ?? 0;
      const required = o.requiredCount ?? 0;
      return {
        label: `${current}/${required}`,
        ratio: required > 0 ? current / required : 1,
      };
    }
  }
}

function ObjectiveRow({ objective }: { objective: ObjectiveProgress }) {
  const { label, ratio } = describeProgress(objective);

  return (
    <li className={styles.objectiveBlock}>
      <div className={styles.objectiveItem}>
        <span className={styles.objectiveIcon}>
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(OBJECTIVE_ICON[objective.questType])}`}
            alt=""
          />
        </span>
        <span>{objective.description}</span>
      </div>

      {ratio !== null && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(100, ratio * 100)}%` }}
          />
        </div>
      )}

      {label && <span className={styles.progressLabel}>{label}</span>}
    </li>
  );
}
