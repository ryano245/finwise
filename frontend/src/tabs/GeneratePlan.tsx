import React, { useState } from 'react';
import type { LanguageStrings } from '../utilities/budget';

type Props = {
  strings: LanguageStrings;
  canGeneratePlan: boolean;
  onGenerate: () => Promise<string>; // updated to async returning the plan text
  expensesCount: number;
};

export default function GeneratePlan({ strings, canGeneratePlan, onGenerate, expensesCount }: Props) {
  const [planText, setPlanText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await onGenerate();
      setPlanText(plan);
    } catch (err) {
      console.error(err);
      setPlanText(strings.planGenerationError || 'Error generating plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack" style={{ marginTop: 8, marginBottom: 48, alignItems: 'flex-end', width: '100%' }}>
      {(!canGeneratePlan) && (
        <div id="genplan-requirements" className="hint" style={{ width: '100%', textAlign: 'right' }}>
          {strings.needMoreExpenses} ({expensesCount}/5)
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!canGeneratePlan || loading}
        aria-describedby={!canGeneratePlan ? 'genplan-requirements' : undefined}
      >
        {loading ? strings.generatingPlan || 'Generating...' : strings.generatePlan}
      </button>

      {planText && (
        <textarea
          readOnly
          value={planText}
          rows={10}
          style={{ width: '100%', marginTop: 16, resize: 'vertical' }}
          placeholder={strings.planOutputPlaceholder || 'Your generated plan will appear here.'}
        />
      )}
    </section>
  );
}
