import { useState } from "react";

const scrubSensitiveData = (text) => {
  return text
    .replace(/\b\d{9,18}\b/g, '[ACCOUNT_NUMBER]')
    .replace(/\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, '[CARD_NUMBER]')
    .replace(/\b[A-Z]{4}0[A-Z0-9]{6}\b/g, '[IFSC_CODE]')
    .replace(/\botp\s*[:\-]?\s*\d{4,8}\b/gi, '[OTP]')
    .replace(/\bpassword\s*[:\-]?\s*\S+/gi, '[PASSWORD]')
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g, '[IBAN]');
};

const getRiskLabel = (score) => {
  if (score <= 25) return { label: "Very Low Risk", emoji: "🟢", desc: "This looks safe. No significant scam signals detected." };
  if (score <= 50) return { label: "Low-Medium Risk", emoji: "🟡", desc: "Some minor flags found but likely legitimate. Stay cautious." };
  if (score <= 75) return { label: "Medium-High Risk", emoji: "🟠", desc: "Several suspicious patterns detected. Verify before taking any action." };
  return { label: "High Risk", emoji: "🔴", desc: "Strong scam signals detected. Do not click links or share any information." };
};

const COLORS = {
  bg: "#0a0a0f",
  card: "#12121a",
  border: "#1e1e2e",
  accent: "#ff3c3c",
  accentGlow: "#ff3c3c44",
  safe: "#00e57a",
  safeGlow: "#00e57a33",
  warn: "#ffaa00",
  warnGlow: "#ffaa0033",
  text: "#f0f0f8",
  muted: "#6b6b8a",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Space Grotesk', sans-serif;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 20%, #1a0a0a 0%, ${COLORS.bg} 60%);
    padding: 0 16px 60px;
  }

  .noise {
    position: fixed;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .header {
    padding: 48px 0 36px;
    text-align: center;
  }

  .logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}66;
    border-radius: 100px;
    padding: 6px 16px;
    margin-bottom: 20px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    color: ${COLORS.accent};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: ${COLORS.accent};
    border-radius: 50%;
    animation: pulse 2s infinite;
    box-shadow: 0 0 8px ${COLORS.accent};
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  h1 {
    font-size: clamp(36px, 8vw, 64px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
  }

  .title-scam { color: ${COLORS.accent}; text-shadow: 0 0 40px ${COLORS.accentGlow}; }
  .title-snap { color: ${COLORS.text}; }

  .subtitle {
    color: ${COLORS.muted};
    font-size: 16px;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .privacy-banner {
    background: #1a1505;
    border: 1px solid ${COLORS.warn}44;
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #ffddaa;
    line-height: 1.5;
  }

  .tabs {
    display: flex;
    gap: 4px;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 20px;
  }

  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: ${COLORS.muted};
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .tab.active {
    background: ${COLORS.accent};
    color: white;
    box-shadow: 0 0 20px ${COLORS.accentGlow};
  }

  .tab:hover:not(.active) {
    color: ${COLORS.text};
    background: ${COLORS.border};
  }

  .card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
  }

  .input-label {
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    color: ${COLORS.muted};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
    display: block;
  }

  textarea {
    width: 100%;
    background: #16161f;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    color: ${COLORS.text};
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 14px;
    resize: vertical;
    min-height: 140px;
    outline: none;
    transition: border-color 0.2s;
  }

  textarea:focus { border-color: ${COLORS.accent}66; }
  textarea::placeholder { color: ${COLORS.muted}; }

  input[type="text"] {
    width: 100%;
    background: #16161f;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    color: ${COLORS.text};
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  input[type="text"]:focus { border-color: ${COLORS.accent}66; }
  input[type="text"]::placeholder { color: ${COLORS.muted}; }

  select {
    width: 100%;
    background: #16161f;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    color: ${COLORS.text};
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s;
    cursor: pointer;
  }

  select:focus { border-color: ${COLORS.accent}66; }

  .call-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .analyze-btn {
    width: 100%;
    padding: 16px;
    background: ${COLORS.accent};
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px ${COLORS.accentGlow};
  }

  .analyze-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 30px ${COLORS.accentGlow};
  }

  .analyze-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .loading-bar {
    position: absolute;
    bottom: 0; left: 0;
    height: 3px;
    background: rgba(255,255,255,0.5);
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% { width: 0%; left: 0; }
    50% { width: 70%; left: 0; }
    100% { width: 0%; left: 100%; }
  }

  .privacy-note {
    font-size: 11px;
    color: ${COLORS.muted};
    text-align: center;
    margin-top: 8px;
    font-family: 'JetBrains Mono', monospace;
  }

  .result-card {
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    animation: slideUp 0.4s ease;
    border: 1px solid;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .result-card.scam {
    background: linear-gradient(135deg, #1a0505, #120a0a);
    border-color: ${COLORS.accent}66;
    box-shadow: 0 0 40px ${COLORS.accentGlow};
  }

  .result-card.safe {
    background: linear-gradient(135deg, #051a0f, #0a120d);
    border-color: ${COLORS.safe}66;
    box-shadow: 0 0 40px ${COLORS.safeGlow};
  }

  .result-card.suspicious {
    background: linear-gradient(135deg, #1a1005, #12100a);
    border-color: ${COLORS.warn}66;
    box-shadow: 0 0 40px ${COLORS.warnGlow};
  }

  .verdict-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .verdict-icon { font-size: 36px; line-height: 1; }

  .verdict-label {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }

  .verdict-title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .verdict-title.scam { color: ${COLORS.accent}; }
  .verdict-title.safe { color: ${COLORS.safe}; }
  .verdict-title.suspicious { color: ${COLORS.warn}; }

  .risk-bar-container { margin-bottom: 20px; }

  .risk-bar-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: ${COLORS.muted};
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 6px;
  }

  .risk-bar-track {
    height: 6px;
    background: ${COLORS.border};
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .risk-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 1s ease;
  }

  .risk-label-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 6px;
  }

  .risk-desc {
    font-size: 13px;
    color: ${COLORS.muted};
    line-height: 1.5;
    font-style: italic;
  }

  .section-title {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${COLORS.muted};
    margin-bottom: 10px;
  }

  .explanation {
    font-size: 15px;
    line-height: 1.7;
    color: ${COLORS.text};
    margin-bottom: 20px;
  }

  .red-flags {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .flag-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    line-height: 1.5;
    padding: 10px 14px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    border-left: 3px solid;
  }

  .flag-item.bad { border-left-color: ${COLORS.accent}; }
  .flag-item.warn { border-left-color: ${COLORS.warn}; }
  .flag-item.good { border-left-color: ${COLORS.safe}; }

  .action-box {
    padding: 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }

  .action-box.scam { background: ${COLORS.accentGlow}; color: #ffaaaa; }
  .action-box.safe { background: ${COLORS.safeGlow}; color: #aaffcc; }
  .action-box.suspicious { background: ${COLORS.warnGlow}; color: #ffddaa; }

  .how-it-works {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 8px;
  }

  .step {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .step-num {
    font-size: 24px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: ${COLORS.accent};
    margin-bottom: 6px;
  }

  .step-text { font-size: 12px; color: ${COLORS.muted}; line-height: 1.5; }

  .error-box {
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}44;
    border-radius: 10px;
    padding: 14px;
    font-size: 14px;
    color: #ffaaaa;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    .call-info { grid-template-columns: 1fr; }
    .how-it-works { grid-template-columns: 1fr; }
  }
`;

export default function ScamSnap() {
  const [tab, setTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [callerNumber, setCallerNumber] = useState("");
  const [callerClaim, setCallerClaim] = useState("");
  const [callDescription, setCallDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [followUp, setFollowUp] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [copied, setCopied] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const copyVerdict = () => {
    if (!result) return;
    const riskInfo = getRiskLabel(result.riskScore);
    const text = `ScamSnap Verdict: ${result.verdict} (Risk: ${result.riskScore}/100 — ${riskInfo.label})
Scam Type: ${result.scamType || "N/A"}
Summary: ${result.explanation}
Why Dangerous: ${result.whyThisIsAScam || "N/A"}
What To Do: ${result.action}

Checked with ScamSnap: scamsnap.vercel.app`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setFeedbackGiven(null);

    const rawContent = tab === "text" ? textInput : callDescription;
    const scrubbed = scrubSensitiveData(rawContent);

    let userPrompt = "";
    if (tab === "text") {
      userPrompt = `Analyze this message/email/link for scam indicators:\n\n"${scrubbed}"`;
    } else {
      userPrompt = `Analyze this phone call for scam indicators:
Phone number: ${callerNumber || "Unknown/Hidden"}
Caller claimed to be: ${callerClaim || "Not specified"}
What happened / what they said: ${scrubbed}`;
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: `You are ScamSnap, an expert scam detection AI. Analyze the input and return ONLY valid JSON with no markdown, no backticks, no extra text.

IMPORTANT RULES:
- Well-known legitimate domains (amazon.com, google.com, paypal.com, apple.com, microsoft.com, flipkart.com, sbi.co.in, hdfcbank.com, icicibank.com, axisbank.com, etc.) are NOT scams by themselves. Only flag them as SCAM if the URL is a lookalike/fake (e.g. amazon-support.xyz, amaz0n.com).
- Official bank SMS messages with transaction alerts, OTP messages, or balance notifications from real banks are NORMAL and should be SAFE with low risk score (under 20).
- Asking for a credit card on a legitimate e-commerce site is NORMAL behavior — do NOT flag this as a scam signal.
- Judge based on FULL context: urgency language, spelling errors, suspicious domains, unsolicited prize claims, threats, requests for gift cards, wire transfers, or personal data are real red flags.
- If something looks like a real bank notification or transaction alert, give it a low risk score (under 25) and mark as SAFE.
- Placeholders like [ACCOUNT_NUMBER], [OTP], [CARD_NUMBER] in the message mean sensitive data was removed for privacy — do not flag these as suspicious.

Risk score guide:
- 0-25: Very low risk, almost certainly safe
- 26-50: Some minor flags, likely legitimate but worth checking
- 51-75: Multiple suspicious patterns, verify carefully before acting
- 76-100: Strong scam signals, very likely fraudulent

Return this exact structure:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "SAFE",
  "riskScore": <number 0-100>,
  "summary": "<one sentence verdict>",
  "explanation": "<2-3 sentences explaining your analysis>",
  "flags": [
    { "type": "bad" | "warn" | "good", "text": "<specific flag>" }
  ],
  "action": "<what the person should do right now>",
  "whyThisIsAScam": "<plain explanation as if to a grandparent, or null if SAFE>",
  "scamType": "<Phishing | Prize Scam | Impersonation | Tech Support | Romance | Investment | Advance Fee | Safe>"
}

Detect the language of the input and respond in that same language. All JSON fields must be in the same language as the input.`
            },
            { role: "user", content: userPrompt }
          ]
        })
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    }

    setLoading(false);
  };

  const askFollowUp = async () => {
    if (!followUp.trim()) return;
    setFollowUpLoading(true);
    setFollowUpAnswer(null);
    try {
      const context = tab === "text" ? scrubSensitiveData(textInput) : `Phone call from ${callerNumber}, claiming to be ${callerClaim}. ${scrubSensitiveData(callDescription)}`;
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: "You are ScamSnap, a scam detection expert. Answer the user's follow-up question about the suspicious content they submitted. Be direct, helpful, and specific. Keep your answer under 100 words."
            },
            {
              role: "user",
              content: `The suspicious content was: "${context}"\n\nThe verdict was: ${result.verdict} (risk score: ${result.riskScore}/100)\n\nMy question: ${followUp}`
            }
          ]
        })
      });
      const data = await response.json();
      setFollowUpAnswer(data.choices?.[0]?.message?.content || "Sorry, couldn't answer that.");
    } catch {
      setFollowUpAnswer("Failed to get answer. Please try again.");
    }
    setFollowUpLoading(false);
  };

  const canAnalyze = tab === "text" ? textInput.trim().length > 10 : callDescription.trim().length > 10;
  const verdictClass = result?.verdict?.toLowerCase() === "scam" ? "scam" : result?.verdict?.toLowerCase() === "safe" ? "safe" : "suspicious";
  const verdictIcon = result?.verdict === "SCAM" ? "🚨" : result?.verdict === "SAFE" ? "✅" : "⚠️";
  const riskColor = (result?.riskScore || 0) > 75 ? COLORS.accent : (result?.riskScore || 0) > 50 ? COLORS.warn : (result?.riskScore || 0) > 25 ? "#ffcc00" : COLORS.safe;
  const riskInfo = result ? getRiskLabel(result.riskScore) : null;

  return (
    <>
      <style>{styles}</style>
      <div className="noise" />
      <div className="app">
        <div className="container">
          <div className="header">
            <div className="logo-badge">
              <div className="pulse-dot" />
              AI-Powered Protection
            </div>
            <h1>
              <span className="title-scam">Scam</span>
              <span className="title-snap">Snap</span>
            </h1>
            <p className="subtitle">
              Paste any suspicious message, email, link, or describe a call — we'll tell you if it's a scam instantly.
            </p>
          </div>

          <div className="privacy-banner">
            <span style={{ fontSize: 18 }}>🔒</span>
            <span>
              <strong>Privacy tip:</strong> Never paste messages containing real account numbers, passwords, OTPs or personal data. ScamSnap automatically removes sensitive numbers, but stay safe — share only what's needed to check for scams.
            </span>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === "text" ? "active" : ""}`} onClick={() => { setTab("text"); setResult(null); }}>
              💬 Text / Email / Link
            </button>
            <button className={`tab ${tab === "call" ? "active" : ""}`} onClick={() => { setTab("call"); setResult(null); }}>
              📞 Phone Call
            </button>
          </div>

          <div className="card">
            {tab === "text" ? (
              <>
                <label className="input-label">Paste suspicious content</label>
                <textarea
                  placeholder={"Paste the suspicious text, email, DM, or URL here...\n\nExample: \"Congratulations! You've won a $1000 gift card. Click here to claim: bit.ly/xxx\""}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                />
              </>
            ) : (
              <>
                <div className="call-info">
                  <div>
                    <label className="input-label">Phone number (if shown)</label>
                    <input type="text" placeholder="+1 (555) 000-0000 or Unknown" value={callerNumber} onChange={e => setCallerNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Caller claimed to be</label>
                    <input type="text" placeholder="e.g. IRS, Amazon, Bank..." value={callerClaim} onChange={e => setCallerClaim(e.target.value)} />
                  </div>
                </div>
                <label className="input-label">What happened / what they said</label>
                <textarea
                  placeholder={"Describe what the caller said or asked...\n\nExample: \"They said my Social Security number was suspended and I need to pay $500 in gift cards to fix it or I'll be arrested\""}
                  value={callDescription}
                  onChange={e => setCallDescription(e.target.value)}
                />
              </>
            )}
            <div style={{ height: 12 }} />
            <button className="analyze-btn" onClick={analyze} disabled={loading || !canAnalyze}>
              {loading ? "Analyzing..." : "🔍 Analyze Now"}
              {loading && <div className="loading-bar" />}
            </button>
            <p className="privacy-note">🔒 Your data is never stored or shared with anyone</p>
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          {result && (
            <div className={`result-card ${verdictClass}`}>
              <div className="verdict-header">
                <div className="verdict-icon">{verdictIcon}</div>
                <div>
                  <div className="verdict-label" style={{ color: verdictClass === "scam" ? COLORS.accent : verdictClass === "safe" ? COLORS.safe : COLORS.warn }}>
                    Verdict
                  </div>
                  <div className={`verdict-title ${verdictClass}`}>{result.verdict}</div>
                </div>
              </div>

              <div className="risk-bar-container">
                <div className="risk-bar-label">
                  <span>Risk Score</span>
                  <span style={{ color: riskColor, fontWeight: 700 }}>{result.riskScore}/100</span>
                </div>
                <div className="risk-bar-track">
                  <div className="risk-bar-fill" style={{ width: `${result.riskScore}%`, background: riskColor }} />
                </div>
                {riskInfo && (
                  <>
                    <div className="risk-label-badge" style={{ background: riskColor + "22", border: `1px solid ${riskColor}44`, color: riskColor }}>
                      {riskInfo.emoji} {riskInfo.label}
                    </div>
                    <p className="risk-desc">{riskInfo.desc}</p>
                  </>
                )}
              </div>

              {result.scamType && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    display: "inline-block", padding: "4px 12px",
                    background: verdictClass === "scam" ? COLORS.accentGlow : verdictClass === "safe" ? COLORS.safeGlow : COLORS.warnGlow,
                    borderRadius: 100, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                    color: verdictClass === "scam" ? COLORS.accent : verdictClass === "safe" ? COLORS.safe : COLORS.warn,
                    letterSpacing: "0.05em", textTransform: "uppercase"
                  }}>
                    🏷️ {result.scamType}
                  </span>
                </div>
              )}

              <div className="section-title">Summary</div>
              <p className="explanation">{result.explanation}</p>

              {result.whyThisIsAScam && (
                <div style={{ marginBottom: 20 }}>
                  <div className="section-title">Why This Is Dangerous</div>
                  <div style={{ padding: "14px 16px", background: "rgba(255,60,60,0.06)", borderRadius: 10, fontSize: 14, lineHeight: 1.7, color: COLORS.text, borderLeft: "3px solid " + COLORS.accent }}>
                    {result.whyThisIsAScam}
                  </div>
                </div>
              )}

              {result.flags?.length > 0 && (
                <>
                  <div className="section-title">Red Flags & Signals</div>
                  <div className="red-flags">
                    {result.flags.map((flag, i) => (
                      <div key={i} className={`flag-item ${flag.type}`}>
                        <span>{flag.type === "bad" ? "🚩" : flag.type === "warn" ? "⚠️" : "✓"}</span>
                        <span>{flag.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="section-title">What To Do</div>
              <div className={`action-box ${verdictClass}`}>{result.action}</div>

              <div style={{ height: 16 }} />
              <button onClick={copyVerdict} style={{
                width: "100%", padding: "12px",
                background: copied ? COLORS.safeGlow : "rgba(255,255,255,0.05)",
                border: "1px solid " + (copied ? COLORS.safe + "66" : COLORS.border),
                borderRadius: 10, color: copied ? COLORS.safe : COLORS.muted,
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", marginBottom: 4
              }}>
                {copied ? "✅ Copied! Share it with someone" : "📋 Copy verdict to share"}
              </button>

              <div style={{ height: 20 }} />
              <div className="section-title">Was this analysis correct?</div>
              {feedbackGiven === null ? (
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <button onClick={() => setFeedbackGiven("yes")} style={{ flex: 1, padding: "10px", background: COLORS.safeGlow, border: "1px solid " + COLORS.safe + "66", borderRadius: 10, color: COLORS.safe, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>👍 Yes, correct</button>
                  <button onClick={() => setFeedbackGiven("no")} style={{ flex: 1, padding: "10px", background: COLORS.accentGlow, border: "1px solid " + COLORS.accent + "66", borderRadius: 10, color: COLORS.accent, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>👎 No, wrong</button>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", marginBottom: 20, background: feedbackGiven === "yes" ? COLORS.safeGlow : COLORS.accentGlow, borderRadius: 10, fontSize: 14, color: feedbackGiven === "yes" ? COLORS.safe : COLORS.accent, fontWeight: 500 }}>
                  {feedbackGiven === "yes" ? "✅ Thanks for confirming! Helping us improve." : "❌ Thanks for the correction! We'll use this to improve accuracy."}
                </div>
              )}

              <div style={{ height: 20 }} />
              <div className="section-title">Have a question about this?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. Should I click the link? Is my data safe?"
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askFollowUp()}
                  style={{ flex: 1 }}
                />
                <button onClick={askFollowUp} disabled={followUpLoading || !followUp.trim()} style={{ padding: "12px 16px", background: COLORS.accent, color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, opacity: followUpLoading || !followUp.trim() ? 0.6 : 1 }}>
                  {followUpLoading ? "..." : "Ask"}
                </button>
              </div>
              {followUpAnswer && (
                <div style={{ marginTop: 12, padding: 14, background: "rgba(255,255,255,0.05)", borderRadius: 10, fontSize: 14, lineHeight: 1.6, color: COLORS.text, borderLeft: `3px solid ${COLORS.accent}` }}>
                  {followUpAnswer}
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div>
              <p style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                How it works
              </p>
              <div className="how-it-works">
                <div className="step"><div className="step-num">01</div><div className="step-text">Paste text or describe your call</div></div>
                <div className="step"><div className="step-num">02</div><div className="step-text">AI analyzes for scam patterns</div></div>
                <div className="step"><div className="step-num">03</div><div className="step-text">Get instant verdict & what to do</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
