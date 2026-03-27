import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 5;

export default function CodeVerification({
  setCode,
  error,
  setError,
  loading,
  setLoading,
  setStep,
  userInfos,
  socket,
  onSuccess,
}) {
  const [digits, setDigits]   = useState(Array(OTP_LENGTH).fill(""));
  const [shake,  setShake]    = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // Propagate joined code upward
  useEffect(() => {
    setCode(digits.join(""));
  }, [digits, setCode]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Trigger shake on new error
  useEffect(() => {
    if (error) {
      setShake(true);
      const id = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(id);
    }
  }, [error]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index, value) => {
    // Accept only single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit && value !== "") return;

    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        focusInput(index - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    } else if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError("");
    // Focus the next empty box or the last
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(focusIdx);
  };

  const handleVerify = useCallback(async () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/validateVerifiCode`,
        { email: userInfos?.email, code, type: "verifi" }
      );
      setSuccess(true);
      dispatch({ type: "LOGIN", payload: data });
      Cookies.set("user", JSON.stringify(data));
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else navigate("/");
      }, 800);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Invalid or expired code.");
    }
  }, [digits, userInfos, dispatch, navigate, onSuccess, setError, setLoading]);

  const inputClass = (i) => {
    const base = "otp-input";
    if (success)      return `${base} success`;
    if (shake && error) return `${base} ${digits[i] ? "filled" : ""} error-shake`;
    if (digits[i])    return `${base} filled`;
    return base;
  };

  const allFilled = digits.every(Boolean);

  return (
    <>
      <div className="rp-card-top">
        <div className="rp-card-step-badge">Step 3 of 4</div>
        <h2 className="rp-card-title">Enter the code</h2>
        <p className="rp-card-desc">
          Check your inbox — we've sent a {OTP_LENGTH}-digit code to{" "}
          <span style={{ color: "var(--gold)" }}>
            {userInfos?.email || "your email"}
          </span>.
        </p>
      </div>

      <div className="rp-card-body">
        <div className="otp-wrapper">
          <div className="otp-row" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className={inputClass(i)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                autoComplete="one-time-code"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
          {error && (
            <p className="rp-error" style={{ justifyContent: "center" }}>
              ⚠ {error}
            </p>
          )}
          <p className="otp-hint">Tip: You can paste your code directly.</p>
        </div>

        <div className="rp-btn-row">
          <button
            className="rp-btn rp-btn-ghost"
            onClick={() => { setError(""); setStep(1); }}
            disabled={loading}
          >
            ← Back
          </button>
          <button
            className="rp-btn rp-btn-primary"
            onClick={handleVerify}
            disabled={loading || !allFilled || success}
          >
            {loading
              ? <span className="rp-spinner" />
              : success
              ? "✓ Verified"
              : "Verify →"}
          </button>
        </div>
      </div>
    </>
  );
}