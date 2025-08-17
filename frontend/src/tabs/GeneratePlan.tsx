import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
    <section className="stack" style={{ marginTop: 8, marginBottom: 48, width: '100%' }}>
      {/* Hint if requirements not met */}
      {!canGeneratePlan && (
        <div id="genplan-requirements" className="hint" style={{ width: '100%', textAlign: 'right' }}>
          {strings.needMoreExpenses} ({expensesCount}/5)
        </div>
      )}

      {/* Generate button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={handleGenerate}
          disabled={!canGeneratePlan || loading}
          aria-describedby={!canGeneratePlan ? 'genplan-requirements' : undefined}
          style={{
            padding: '8px 16px',
            fontSize: 16,
            fontWeight: 'bold',
            borderRadius: 6,
            border: 'none',
            cursor: canGeneratePlan && !loading ? 'pointer' : 'not-allowed',
            backgroundColor: canGeneratePlan && !loading ? '#4f46e5' : '#ccc',
            color: 'white',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? (strings.loading ?? 'Generating...') : strings.generatePlan}
        </button>
      </div>

      {/* Error message */}
      {error && <div className="hint" style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

      {/* Render plan */}
      {planText && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: 12,
            maxHeight: 400,
            overflowY: 'auto',
            backgroundColor: '#fafafa',
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            textAlign: 'left', // 👈 makes sure text is aligned left
          }}
        >
          <ReactMarkdown
            children={planText}
            components={{
              h1: ({ node, ...props }) => <h1 style={{ fontSize: 20, marginBottom: 8 }} {...props} />,
              h2: ({ node, ...props }) => <h2 style={{ fontSize: 18, marginBottom: 6 }} {...props} />,
              strong: ({ node, ...props }) => <strong style={{ color: '#111' }} {...props} />,
              em: ({ node, ...props }) => <em style={{ color: '#555' }} {...props} />,
              li: ({ node, ...props }) => <li style={{ marginBottom: 4 }} {...props} />,
              p: ({ node, ...props }) => <p style={{ marginBottom: 8 }} {...props} />,
            }}
          />
        </div>
      )}
    </section>
  );
}