import React, { useState, useEffect } from "react";
import { auth, googleProvider, signInWithPopup, signOut } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import App from "./App.jsx";

// ── ログイン画面 ──────────────────────────────────────────
function LoginScreen({ onLogin, loading }) {
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    setErr("");
    try {
      await onLogin();
    } catch (e) {
      setErr("ログインに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F5F6F8",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system,'Hiragino Sans',sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "48px 40px",
        maxWidth: 400, width: "100%",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        {/* ロゴ */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "linear-gradient(135deg,#5B6EF5,#8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 4px 16px rgba(91,110,245,0.3)",
        }}>
          <svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.4">
            <rect x="1.5" y="3" width="13" height="12" rx="1.5"/>
            <line x1="1.5" y1="7" x2="14.5" y2="7"/>
            <line x1="5" y1="1.5" x2="5" y2="4.5"/>
            <line x1="11" y1="1.5" x2="11" y2="4.5"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, color: "#0D0D0D" }}>
          就活トラッカー
        </h1>
        <p style={{ fontSize: 14, color: "#52525B", marginBottom: 32, lineHeight: 1.6 }}>
          ES提出・面接・テストの期限を管理して<br/>提出忘れをゼロにしよう
        </p>

        {/* Googleログインボタン */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px 20px",
            border: "1.5px solid #E4E4E7", borderRadius: 12,
            background: "#fff", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 15, fontWeight: 600, color: "#0D0D0D",
            transition: "box-shadow 0.15s",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
        >
          {/* Googleアイコン */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "ログイン中..." : "Googleでログイン"}
        </button>

        {err && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#EF4444", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 8 }}>
            {err}
          </div>
        )}

        <p style={{ marginTop: 24, fontSize: 12, color: "#A1A1AA", lineHeight: 1.6 }}>
          Googleアカウントでログインすると<br/>
          Googleカレンダーと自動連携できます
        </p>
      </div>
    </div>
  );
}

// ── 認証ラッパー ──────────────────────────────────────────
export default function AppWithAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Google Calendar API用のアクセストークンを取得
      const credential = result._tokenResponse;
      if (credential?.oauthAccessToken) {
        setAccessToken(credential.oauthAccessToken);
        localStorage.setItem("gcal_token", credential.oauthAccessToken);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("gcal_token");
  };

  // 保存済みトークンを復元
  useEffect(() => {
    const saved = localStorage.getItem("gcal_token");
    if (saved) setAccessToken(saved);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F6F8" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #E4E4E7", borderTopColor: "#5B6EF5", animation: "spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={loading}/>;
  }

  return (
    <App
      currentUser={user}
      accessToken={accessToken}
      onLogout={handleLogout}
    />
  );
}
