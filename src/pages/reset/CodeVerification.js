import { useRef, useState, useEffect } from "react";
import axios from "axios";

const OTP_LENGTH = 5;

export default function CodeVerification({
  setCode,
  error,
  setError,
  setLoading,
  setVisible,
  userInfos,
  loading,
}) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [shakeError, setShakeError] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return; // digits only
    const next = [...digits];
    next[idx] = val;
    setDigits(next);

    // Move forward
    if (val && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Sync combined code
    setCode(next.join(""));
    setError("");
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setCode(next.join(""));
    // Focus last filled or next empty
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const verifyCode = async () => {
    const fullCode = digits.join("");
    if (fullCode.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      triggerShake();
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/validateResetCode`,
        { email: userInfos.email, code: fullCode, type: "reset" }
      );
      setError("");
      setLoading(false);
      setVisible(3);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Invalid code. Please try again.");
      triggerShake();
    }
  };

  const resendCode = async () => {
    try {
      setResendLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/sendResetPasswordCode`,
        { email: userInfos.email }
      );
      setResendTimer(60);
      setDigits(Array(OTP_LENGTH).fill(""));
      setCode("");
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="rp-step-wrap">
      <div className="rp-card-icon">🔐</div>
      <h2 className="rp-card-title">Verify Your Identity</h2>
      <p className="rp-card-sub">
        Enter the 5-digit code sent to{" "}
        <span className="rp-masked-email" style={{ display: "inline", background: "none", padding: 0, border: "none", fontSize: "inherit" }}>
          {userInfos?.email || "your email"}
        </span>
        .
      </p>

      {/* OTP Inputs */}
      <div
        className="rp-otp-wrap"
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            className={`rp-otp-input ${d ? "filled" : ""} ${
              shakeError && error ? "error-otp" : ""
            }`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && (
        <div className="rp-error-box" style={{ marginTop: "12px" }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <p className="rp-otp-hint">
        Didn't receive it? Check your spam folder or request a new code below.
      </p>

      <button
        type="button"
        className="rp-btn-primary"
        onClick={verifyCode}
        disabled={loading}
        style={{ marginTop: "16px" }}
      >
        {loading ? (
          <>
            <span className="rp-spinner" />
            Verifying…
          </>
        ) : (
          "Verify Code →"
        )}
      </button>

      {/* Resend + back */}
      <div className="rp-btns" style={{ marginTop: "8px" }}>
        <button
          className="rp-btn-ghost"
          onClick={() => setVisible(1)}
          type="button"
        >
          ← Go Back
        </button>

        <div className="rp-resend">
          {resendTimer > 0 ? (
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Resend in {resendTimer}s
            </span>
          ) : (
            <button
              className="rp-resend-btn"
              onClick={resendCode}
              disabled={resendLoading}
              type="button"
            >
              {resendLoading ? "Sending…" : "Resend Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}