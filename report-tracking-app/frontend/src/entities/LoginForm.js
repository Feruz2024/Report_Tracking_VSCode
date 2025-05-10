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
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      if (onLogin) onLogin(data.token, username);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Login</h3>
      <div>
        <label>
          Username: <input value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} />
        </label>
      </div>
      <div>
        <label>
          Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
        </label>
      </div>
      <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default LoginForm;
