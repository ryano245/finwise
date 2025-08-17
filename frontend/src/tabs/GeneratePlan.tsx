import React, { useState } from 'react';
import type { LanguageStrings } from '../utilities/budget';

type Props = {
  strings: LanguageStrings;
  canGeneratePlan: boolean;
  onGenerate: () => Promise<string>;
  expensesCount: number;
};

export default function GeneratePlan({ strings, canGeneratePlan, onGenerate, expensesCount }: Props) {
  const [planText, setPlanText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    setPlanText('');
    try {
      const plan = await onGenerate();
      if (!plan) {
        setError(strings.planGenerationError ?? 'Failed to generate plan.');
      } else {
        setPlanText(plan);
      }
    } catch (err) {
      console.error('GeneratePlan handle error', err);
      setError(strings.planGenerationError ?? 'Failed to generate plan.');
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

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleGenerate}
          disabled={!canGeneratePlan || loading}
          aria-describedby={!canGeneratePlan ? 'genplan-requirements' : undefined}
        >
          {loading ? (strings.loading ?? 'Generating...') : strings.generatePlan}
        </button>
      </div>

      {error && <div className="hint" style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

      {planText && (
        <textarea
          readOnly
          value={planText}
          rows={12}
          style={{ width: '100%', marginTop: 12, resize: 'vertical' }}
          placeholder={strings.planOutputPlaceholder ?? 'Your generated plan will appear here.'}
        />
      )}
    </section>
  );
}