import { useQuestNotifications } from "@/shared/hooks/questNotificationStore";
import styles from "../assets/css/QuestCompletedToast.module.css";

export function QuestCompletedToast() {
  const { current, queueLength, dismiss } = useQuestNotifications();

  if (!current) return null;

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

        <button
          onClick={() => dismiss(current.questId)}
          className={styles.closeButton}
        >
          {queueLength > 1 ? `Đóng (còn ${queueLength - 1})` : "Đóng"}
        </button>
      </div>
    </div>
  );
}
