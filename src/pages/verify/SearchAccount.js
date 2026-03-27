import { useState } from "react";
import axios from "axios";

export default function SearchAccount({
  email, setEmail,
  error, setError,
  loading, setLoading,
  setStep, setUserInfos,
}) {
  const [touched, setTouched] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showErr = touched && !isValidEmail && email.length > 0;

  const handleSearch = async () => {
    setTouched(true);
    if (!isValidEmail) return;
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/findUser`,
        { email, verified: true }
      );
      setUserInfos(data);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Account not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <div className="rp-card-top">
        <div className="rp-card-step-badge">Step 1 of 4</div>
        <h2 className="rp-card-title">Find your account</h2>
        <p className="rp-card-desc">
          Enter the email address linked to your FriendNet account.
        </p>
      </div>

      <div className="rp-card-body">
        <div className="rp-field">
          <label className="rp-label" htmlFor="sa-email">Email address</label>
          <div className="rp-input-wrap">
            <input
              id="sa-email"
              className={`rp-input has-icon ${showErr || error ? "error" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); setTouched(false); }}
              onBlur={() => setTouched(true)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <span className="rp-input-icon">✉</span>
          </div>
          {showErr && (
            <p className="rp-error">⚠ Please enter a valid email address.</p>
          )}
          {error && !showErr && (
            <p className="rp-error">⚠ {error}</p>
          )}
        </div>

        <div className="rp-btn-row">
          <a href="/login" className="rp-btn rp-btn-ghost">Cancel</a>
          <button
            className="rp-btn rp-btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <span className="rp-spinner" /> : "Find Account →"}
          </button>
        </div>
      </div>
    </>
  );
}