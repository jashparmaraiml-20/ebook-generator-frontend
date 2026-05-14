import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Download, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://ebook-generator-backend.onrender.com';

function App() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('beginner');
  const [tone, setTone] = useState('conversational');
  
  const [taskId, setTaskId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, generating, completed, error
  const [message, setMessage] = useState('');
  // Removed unused pdfPath state

  // Poll status when a task is running
  useEffect(() => {
    let interval: number;
    if (taskId && status === 'generating') {
      interval = window.setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/status/${taskId}`);
          if (res.ok) {
            const data = await res.json();
            setMessage(data.message || 'Processing...');
            if (data.status === 'completed') {
              setStatus('completed');
            } else if (data.status === 'failed') {
              setStatus('error');
              setMessage(data.message || 'Generation failed.');
            }
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 5000); // poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [taskId, status]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus('generating');
    setMessage('Initializing AI Agents...');

    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          audience: audience,
          tone: tone,
        }),
      });

      if (!res.ok) throw new Error('Failed to start generation');

      const data = await res.json();
      setTaskId(data.task_id);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Could not connect to the generation server.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setTaskId('');
    setMessage('');
    setTopic('');
  };

  return (
    <>
      <div className="bg-glow"></div>
      
      <div className="container">
        <header className="header">
          <h1><Sparkles className="inline-block mr-3 mb-2" size={40} /> Agent 5 Creator</h1>
          <p>Fully Autonomous AI eBook Generation Pipeline</p>
        </header>

        <main className="glass-card">
          {status === 'idle' && (
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">What should the eBook be about?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. How to Start Dropshipping in 2026, The Future of AI..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select 
                    className="form-select"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                    <option value="parent">Parents</option>
                    <option value="student">Students</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Writing Tone</label>
                  <select 
                    className="form-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="conversational">Conversational & Friendly</option>
                    <option value="professional">Professional & Academic</option>
                    <option value="motivational">Motivational & Inspiring</option>
                    <option value="humorous">Humorous & Light</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary mt-4" disabled={!topic.trim()}>
                <BookOpen size={20} /> Generate eBook Now
              </button>
            </form>
          )}

          {status === 'generating' && (
            <div className="status-container">
              <div className="loader"></div>
              <h2 className="status-text">Creating Your Masterpiece</h2>
              <p className="status-subtext">{message}</p>
              <div className="mt-8 text-sm text-[var(--text-muted)] bg-[rgba(0,0,0,0.2)] p-4 rounded-xl border border-[var(--border)] max-w-md mx-auto text-left">
                <p><strong>Pipeline Status:</strong></p>
                <ul className="mt-2 space-y-1">
                  <li><span className="text-[var(--primary)] mr-2">➜</span> Categorizer Agent</li>
                  <li><span className="text-[var(--primary)] mr-2">➜</span> ChatGPT Content Generator</li>
                  <li><span className="text-[var(--primary)] mr-2">➜</span> Gemini Image Generator</li>
                  <li><span className="text-[var(--primary)] mr-2">➜</span> PDF Builder Assembly</li>
                </ul>
                <p className="mt-4 text-xs italic opacity-70">This process usually takes 2-4 minutes depending on the topic length and image generation time.</p>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="result-container">
              <CheckCircle2 className="result-icon mx-auto" />
              <h2 className="result-title">eBook Generated Successfully!</h2>
              <p className="mb-8">Your completely autonomous eBook is ready for download.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={`${API_BASE_URL}/download/${taskId}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={20} /> Download PDF
                </a>
                <button onClick={resetForm} className="btn-secondary">
                  Create Another
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="result-container">
              <AlertCircle className="result-icon mx-auto" style={{ color: 'var(--error)' }} />
              <h2 style={{ color: 'var(--error)' }}>Generation Failed</h2>
              <p className="mb-8 text-[var(--text-muted)]">{message}</p>
              
              <button onClick={resetForm} className="btn-primary mx-auto" style={{ maxWidth: '200px' }}>
                Try Again
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
