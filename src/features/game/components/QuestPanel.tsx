import { useState, useEffect, useCallback } from "react";
import styles from "../assets/css/QuestPanel.module.css";
import { setFlashMessage } from "@/shared/hooks/flashMessage";

type QuestObjectiveType =
  | "LEVEL_UP"
  | "KILL_MONSTER"
  | "REACH_MAP"
  | "REACH_COORDINATE"
  | "COLLECT_ITEM";

interface ObjectiveOfQuest {
  objectiveType: QuestObjectiveType;
  description: string;
  requiredCount: number | null;
  monsterId: number | null;
  itemId: string | null;
  targetRealm: string | null;
  targetRealmStage: string | null;
  targetMap: number | null;
  targetX: number | null;
  targetY: number | null;
}

interface AvailableQuest {
  id: number;
  name: string;
  requiredRealm: string;
  questObjectives: ObjectiveOfQuest[];
}

// TODO: confirm this matches the real shape of ServiceResult<T> on the backend
interface ServiceResult<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

// Claimed/in-progress quests aren't wired up yet — placeholder shape for when
// that endpoint exists.
interface ClaimedQuest {
  id: number;
  name: string;
  progress: number;
  requiredCount: number;
}

const OBJECTIVE_ICON: Record<QuestObjectiveType, string> = {
  LEVEL_UP: "⛰",
  KILL_MONSTER: "⚔",
  REACH_MAP: "🗺",
  REACH_COORDINATE: "📍",
  COLLECT_ITEM: "🎒",
};

async function fetchAvailableQuests(
  playerId: string,
): Promise<AvailableQuest[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${baseUrl}/api/quests/${playerId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Không thể tải nhiệm vụ (${res.status})`);
  }

  const result: ServiceResult<AvailableQuest[]> = await res.json();

  if (!result.success || result.data === null) {
    throw new Error(result.message ?? "Không thể tải nhiệm vụ");
  }

  return result.data;
}

interface QuestPanelProps {
  playerId: string;
}

type QuestTab = "available" | "claimed";

export function QuestPanel({ playerId }: QuestPanelProps) {
  const [activeTab, setActiveTab] = useState<QuestTab>("available");
  const [availableQuests, setAvailableQuests] = useState<AvailableQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const loadQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const quests = await fetchAvailableQuests(playerId);
      setAvailableQuests(quests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // TODO: wire up to the real accept-quest endpoint once it exists on the backend,
  // e.g. POST /api/quests/{playerId}/accept/{questId}
  const handleAcceptQuest = async (questId: number) => {
    setAcceptingId(questId);
    try {
      console.log("Accept quest requested:", questId);
      setFlashMessage("Tính năng nhận nhiệm vụ đang được phát triển");
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
          onClick={() => setActiveTab("available")}
        >
          Nhiệm Vụ Khả Dụng
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "claimed" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("claimed")}
        >
          Nhiệm Vụ Đang Nhận
        </button>
      </div>

      <div className={styles.panelBody}>
        {activeTab === "available" ? (
          <AvailableQuestsList
            quests={availableQuests}
            loading={loading}
            error={error}
            acceptingId={acceptingId}
            onAccept={handleAcceptQuest}
            onRetry={loadQuests}
          />
        ) : (
          <ClaimedQuestsList />
        )}
      </div>
    </div>
  );
}

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
                  {OBJECTIVE_ICON[objective.objectiveType]}
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

function ClaimedQuestsList() {
  // TODO: replace with a real fetch to GET/POST /api/quests/{playerId}/claimed
  // (or wherever in-progress quests end up living) once that endpoint exists.
  const claimedQuests: ClaimedQuest[] = [];

  if (claimedQuests.length === 0) {
    return (
      <div className={styles.stateMessage}>Bạn chưa nhận nhiệm vụ nào</div>
    );
  }

  return (
    <ul className={styles.questList}>
      {claimedQuests.map((quest) => (
        <li key={quest.id} className={styles.questCard}>
          <div className={styles.questCardHeader}>
            <span className={styles.questName}>{quest.name}</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.min(
                  100,
                  (quest.progress / quest.requiredCount) * 100,
                )}%`,
              }}
            />
          </div>
          <span className={styles.progressLabel}>
            {quest.progress}/{quest.requiredCount}
          </span>
        </li>
      ))}
    </ul>
  );
}
