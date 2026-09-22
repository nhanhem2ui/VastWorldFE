import { useQuestNotifications } from "@/shared/hooks/questNotificationStore";
import styles from "../assets/css/QuestCompletedToast.module.css";

export function QuestCompletedToast() {
  const { current, claimingId, error, claimQuest } = useQuestNotifications();

  if (!current) return null;

  const isClaiming = claimingId === current.questId;

  return (
    <div className={styles.toast}>
      <img
        src={current.completedImageUrl}
        alt={current.questName}
        className={styles.image}
      />

      <div className={styles.content}>
        <h3 className={styles.title}>{current.questName}</h3>

        <p className={styles.description}>{current.description}</p>

        {current.rewardsText && (
          <p className={styles.rewards}>{current.rewardsText}</p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button
          onClick={() => claimQuest(current.questId)}
          disabled={isClaiming}
          className={styles.claimButton}
        >
          {isClaiming ? "Claiming…" : "Claim"}
        </button>
      </div>
    </div>
  );
}
