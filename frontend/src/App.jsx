import React, { useState } from 'react';
import { CheckCircle, Code2, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [diffInput, setDiffInput] = useState(`--- a/database.py
+++ b/database.py
@@ -10,4 +10,6 @@ def get_user_records(user_id):
-    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
+    query = f"SELECT * FROM users WHERE id = '{user_id}'"
+    cursor.execute(query)
     return cursor.fetchall()`);

  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [error, setError] = useState(null);

  const handleReview = async () => {
    setLoading(true);
    setError(null);
    setReviewResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff: diffInput }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setReviewResult(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server. Make sure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '0 20px', color: '#1f2937' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', margin: 0 }}>
          <Sparkles color="#2563eb" /> AI Pull Request Reviewer & Quality Bot
        </h1>
        <p style={{ color: '#7c7e82', marginTop: '6px' }}>
          Paste a Git diff below to detect security anti-patterns, potential resource leaks, and style issues.
        </p>
      </header>

      <section style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#cac2c2' }}>
          Git Diff Payload:
        </label>
        <textarea
          rows={9}
          value={diffInput}
          onChange={(e) => setDiffInput(e.target.value)}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#f9fafb',
            color: '#433c3c',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={handleReview}
          disabled={loading}
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Code2 size={18} />}
          {loading ? 'Analyzing Diff...' : 'Run Automated PR Review'}
        </button>
      </section>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {reviewResult && (
        <section style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, display: 'flex', alignItems: 'center', color: '#4c4a4a', gap: '8px' }}>
            <CheckCircle color="#16a34a" size={20} /> Analysis Summary
          </h2>
          <p style={{ color: '#374151', lineHeight: '1.5' }}>{reviewResult.summary}</p>

          <h3 style={{ fontSize: '15px', marginTop: '20px', marginBottom: '12px' }}>Flagged Inline Comments:</h3>
          {reviewResult.comments && reviewResult.comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reviewResult.comments.map((comment, index) => (
                <div key={index} style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', padding: '10px 14px', borderRadius: '0 4px 4px 0' }}>
                  <span style={{ fontWeight: 600, color: '#b45309', fontSize: '13px' }}>Line {comment.line}:</span>
                  <div style={{ marginTop: '4px', fontSize: '14px', color: '#1f2937' }}>{comment.body}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No critical issues detected in this diff.</p>
          )}
        </section>
      )}
    </div>
  );
}