import { useState } from "react";
import { Activity, Minus, Pencil, Plus } from "lucide-react";

export function TodayTargetCard({ todayCount = 0, dailyGoal = 2, onUpdateGoal }) {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(() => String(dailyGoal));

  const goalProgress = Math.min(100, Math.round((todayCount / Math.max(1, dailyGoal)) * 100));

  const handleDecrease = () => {
    try {
      if (dailyGoal > 1 && typeof onUpdateGoal === "function") {
        onUpdateGoal(dailyGoal - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrease = () => {
    try {
      if (typeof onUpdateGoal === "function") {
        onUpdateGoal(dailyGoal + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = () => {
    try {
      setGoalInput(String(dailyGoal));
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = () => {
    try {
      const parsed = parseInt(goalInput, 10);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 100 && typeof onUpdateGoal === "function") {
        onUpdateGoal(parsed);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    try {
      if (e.key === "Enter") {
        handleSaveEdit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="focus-goal-card">
      <div className="focus-card-head">
        <span className="focus-card-kicker">TODAY'S TARGET</span>
        <div className="focus-target-actions">
          <button
            type="button"
            className="target-stepper-btn"
            onClick={handleDecrease}
            disabled={dailyGoal <= 1}
            aria-label="Decrease daily target"
            title="Decrease daily target"
          >
            <Minus size={11} />
          </button>
          <button
            type="button"
            className="target-stepper-btn"
            onClick={handleIncrease}
            aria-label="Increase daily target"
            title="Increase daily target"
          >
            <Plus size={11} />
          </button>
          <span className="dashboard-metric-icon" aria-hidden="true">
            <Activity size={14} color="#10b981" />
          </span>
        </div>
      </div>
      <div className="goal-progress-wrap">
        <div className="goal-numbers">
          <span className="goal-current">{todayCount}</span>
          {isEditing ? (
            <div className="goal-target-edit-wrapper">
              <span className="goal-target-slash">/</span>
              <input
                type="number"
                min="1"
                max="100"
                value={goalInput}
                onChange={(e) => {
                  try {
                    setGoalInput(e.target.value);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className="goal-target-input"
                autoFocus
                aria-label="Set daily target"
              />
            </div>
          ) : (
            <button
              type="button"
              className="goal-target-clickable"
              onClick={handleStartEdit}
              title="Click to edit daily target"
              aria-label={`Target: ${dailyGoal} problems. Click to edit`}
            >
              <span className="goal-target">/ {dailyGoal}</span>
              <Pencil size={10} className="goal-target-edit-icon" aria-hidden="true" />
            </button>
          )}
        </div>
        <div
          className="goal-bar-outer"
          role="progressbar"
          aria-valuenow={todayCount}
          aria-valuemin={0}
          aria-valuemax={dailyGoal}
        >
          <div className="goal-bar-fill" style={{ width: `${goalProgress}%` }} />
        </div>
      </div>
      <p className="focus-goal-caption">
        {todayCount >= dailyGoal
          ? "Daily goal reached! Keep going to accelerate velocity."
          : `Solve ${dailyGoal - todayCount} more problem(s) today to solidify your streak.`}
      </p>
    </div>
  );
}

