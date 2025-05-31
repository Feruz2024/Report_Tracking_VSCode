import React, { useState } from "react";

const API_URL = "/api/auth/token/";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Invalid credentials or server error" }));
        throw new Error(errorData.detail || "Invalid credentials");
      }
      const data = await res.json();
      // Assuming the token endpoint response includes: token, role, user_id
      if (onLogin) onLogin(data.token, username, data.role, data.user_id);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 500, marginBottom: 4 }}>Username</label>
        <input
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16 }}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 500, marginBottom: 4 }}>Password</label>
        <input
          type="password"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16 }}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '10px 0', borderRadius: 8, fontSize: 16, fontWeight: 600, background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <div style={{ color: "var(--color-error)", marginTop: 8, textAlign: 'center' }}>{error}</div>}
    </form>
  );
}

export default LoginForm;
