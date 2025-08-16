// File: frontend/src/components/GoalTab.tsx
import React from 'react';
import type { Goal } from '../types/budget';
import type { LanguageStrings } from '../utilities/budget';

type Props = {
  strings: LanguageStrings;
  goals: Goal[];
  nonNegInputMap: Record<string, string>;
  setNonNegInputFor: (goalId: string, value: string) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  addNewGoal: () => void;
  addNonNeg: (goalId: string) => void;
  removeNonNeg: (goalId: string, v: string) => void;
  deleteGoal: (id: string) => void;
};

export default function GoalTab({ strings, goals, nonNegInputMap, setNonNegInputFor, updateGoal, addNewGoal, addNonNeg, removeNonNeg, deleteGoal }: Props) {
  return (
    <div className="goal-card container">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Your Goals</h3>
        <button type="button" onClick={addNewGoal} aria-label="Add goal">＋</button>
      </div>

      {goals.length === 0 && (
        <div className="hint">Add your first goal with the ＋ button.</div>
      )}

      {goals.map((goal) => (
        <div key={goal.id} className="stack" style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>What's your goal?</h3>
            <button type="button" onClick={() => deleteGoal(goal.id)} aria-label="Delete goal">{strings.delete}</button>
          </div>

          <div className="row">
            <input
              id={`wish-${goal.id}`}
              type="text"
              value={goal.wish}
              onChange={(e) => updateGoal(goal.id, { wish: e.target.value })}
              placeholder={strings.wishPlaceholder}
              required
              style={{ flex: 1 }}
            />

            <select
              id={`goalType-${goal.id}`}
              value={goal.goalType}
              onChange={(e) => updateGoal(goal.id, { goalType: e.target.value })}
            >
              <option value="emergency">{strings.goalTypeOptions.emergency}</option>
              <option value="debt">{strings.goalTypeOptions.debt}</option>
              <option value="device">{strings.goalTypeOptions.device}</option>
              <option value="travel">{strings.goalTypeOptions.travel}</option>
              <option value="tuition">{strings.goalTypeOptions.tuition}</option>
              <option value="move">{strings.goalTypeOptions.move}</option>
              <option value="build">{strings.goalTypeOptions.build}</option>
              <option value="other">{strings.goalTypeOptions.other}</option>
            </select>

            {goal.goalType === 'other' && (
              <input
                aria-label={strings.goalTypeOtherLabel}
                type="text"
                value={goal.goalTypeOther}
                onChange={(e) => updateGoal(goal.id, { goalTypeOther: e.target.value })}
                placeholder={strings.goalTypeOtherLabel}
              />
            )}
          </div>

          <div className="row">
            <input
              id={`targetAmount-${goal.id}`}
              type="number"
              placeholder={strings.targetAmountPlaceholder}
              value={goal.targetAmountUnknown ? '' : (goal.targetAmount === 0 ? '' : goal.targetAmount)}
              onChange={(e) => updateGoal(goal.id, { targetAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
              min={0}
              disabled={goal.targetAmountUnknown}
            />
            <label className="row" style={{ gap: 8 }}>
              <input
                type="checkbox"
                checked={goal.targetAmountUnknown}
                onChange={(e) => updateGoal(goal.id, { targetAmountUnknown: e.target.checked })}
              />
              {strings.targetAmountUnknown}
            </label>
          </div>

          <div className="row">
            <div className="stack">
              <label htmlFor={`start-${goal.id}`}>{strings.startDateLabel}</label>
              <input
                id={`start-${goal.id}`}
                type="date"
                value={goal.startDate}
                onChange={(e) => updateGoal(goal.id, { startDate: e.target.value })}
              />
            </div>

            <div className="stack">
              <label htmlFor={`target-${goal.id}`}>{strings.targetDateLabel}</label>
              <input
                id={`target-${goal.id}`}
                type="date"
                value={goal.targetDate}
                onChange={(e) => updateGoal(goal.id, { targetDate: e.target.value })}
              />
            </div>
          </div>

          <div className="row" role="group" aria-label={strings.flexibilityLabel}>
            <span className="hint">{strings.flexibilityLabel}:</span>
            <label className="row">
              <input
                type="radio"
                name={`flex-${goal.id}`}
                checked={goal.flexibility === 'hard'}
                onChange={() => updateGoal(goal.id, { flexibility: 'hard' })}
              />
              {strings.flexibilityHard}
            </label>
            <label className="row">
              <input
                type="radio"
                name={`flex-${goal.id}`}
                checked={goal.flexibility === 'soft'}
                onChange={() => updateGoal(goal.id, { flexibility: 'soft' })}
              />
              {strings.flexibilitySoft}
            </label>
          </div>

          <div className="row">
            <input
              id={`currentSavings-${goal.id}`}
              type="number"
              value={goal.currentSavings === 0 ? '' : goal.currentSavings}
              onChange={(e) => updateGoal(goal.id, { currentSavings: e.target.value === '' ? 0 : Number(e.target.value) })}
              placeholder={strings.currentSavingsLabel}
              min={0}
            />

            <label htmlFor={`priority-${goal.id}`}>{strings.priorityLabel}: </label>
            <select
              id={`priority-${goal.id}`}
              value={goal.priority}
              onChange={(e) => updateGoal(goal.id, { priority: e.target.value as Goal['priority'] })}
            >
              <option value="high">{strings.priorityOptions.high}</option>
              <option value="medium">{strings.priorityOptions.medium}</option>
              <option value="low">{strings.priorityOptions.low}</option>
            </select>

            <label htmlFor={`risk-${goal.id}`}>{strings.riskLabel}: </label>
            <select
              id={`risk-${goal.id}`}
              value={goal.riskProfile}
              onChange={(e) => updateGoal(goal.id, { riskProfile: e.target.value as Goal['riskProfile'] })}
            >
              <option value="conservative">{strings.riskOptions.conservative}</option>
              <option value="balanced">{strings.riskOptions.balanced}</option>
              <option value="aggressive">{strings.riskOptions.aggressive}</option>
            </select>
          </div>

          <div className="stack">
            <div className="row">
              <input
                id={`nonneg-${goal.id}`}
                type="text"
                value={nonNegInputMap[goal.id] ?? ''}
                onChange={(e) => setNonNegInputFor(goal.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNonNeg(goal.id); } }}
                placeholder={strings.nonNegotiablesPlaceholder}
                style={{ flex: 1 }}
              />
              <button onClick={() => addNonNeg(goal.id)}>{strings.add}</button>
            </div>
            {goal.nonNegotiables.length > 0 && (
              <div className="chips" aria-label={strings.nonNegotiablesLabel}>
                {goal.nonNegotiables.map((v) => (
                  <span key={v} className="chip">
                    {v}
                    <button aria-label="remove" onClick={() => removeNonNeg(goal.id, v)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="row">
            <input
              id={`motivation-${goal.id}`}
              type="text"
              value={goal.motivation}
              onChange={(e) => updateGoal(goal.id, { motivation: e.target.value })}
              placeholder={strings.motivationPlaceholder}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
