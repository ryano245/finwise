import React from 'react';
import type { LanguageStrings } from '../utilities/budget';

type Props = {
  strings: LanguageStrings;
  canGeneratePlan: boolean;
  onGenerate: () => void;
  expensesCount: number;
};

export default function GeneratePlan({ strings, canGeneratePlan, onGenerate, expensesCount }: Props) {
  return (
    <section className="stack" style={{ marginTop: 8, marginBottom: 48, alignItems: 'flex-end' }}>
      {(!canGeneratePlan) && (
        <div id="genplan-requirements" className="hint" style={{ width: '100%', textAlign: 'right' }}>
          {strings.needMoreExpenses} ({expensesCount}/5)
        </div>
      )}
      <button onClick={onGenerate} disabled={!canGeneratePlan} aria-describedby={!canGeneratePlan ? 'genplan-requirements' : undefined}>
        {strings.generatePlan}
      </button>
    </section>
  );
}