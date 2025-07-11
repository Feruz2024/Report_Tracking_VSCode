import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL + "/api/register/";

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Analysts"); // Must match backend group name exactly
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
  // Ensure role is 'Analysts' for analyst registration
  body: JSON.stringify({ username, password, role: role === 'analyst' ? 'Analysts' : role }),
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      setSuccess(true);
      if (onRegister) onRegister(data.token, data.username, data.role);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Register</h3>
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
      <div>
        <label>
          Role: {" "}
          <select value={role} onChange={e => setRole(e.target.value)} disabled={loading}>
            <option value="analyst">Analyst</option>
            <option value="manager">Manager</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>Registration successful! You can now log in.</div>}
    </form>
  );
}

export default RegisterForm;
