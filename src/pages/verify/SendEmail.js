import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function maskEmail(email = "") {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length <= 2
    ? local[0] + "***"
    : local[0] + "*".repeat(Math.min(local.length - 2, 4)) + local.slice(-1);
  return `${masked}@${domain}`;
}

const COOLDOWN = 60; // seconds

export default function SendEmail({
  email, userInfos,
  error, setError,
  loading, setLoading,
  setStep,
}) {
  const [countdown, setCountdown] = useState(0);
  const [sent, setSent] = useState(false);

  // Tick countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const sendEmail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/sendResetCode`, { email });
      setSent(true);
      setCountdown(COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  }, [email, setError, setLoading]);

  const handleContinue = () => {
    if (!sent) {
      sendEmail().then(() => setStep(2));
    } else {
      setStep(2);
    }
  };

  const avatar = userInfos?.picture;
  const name   = userInfos?.name || userInfos?.email || email;
  const displayEmail = maskEmail(userInfos?.email || email);

  return (
    <>
      <div className="rp-card-top">
        <div className="rp-card-step-badge">Step 2 of 4</div>
        <h2 className="rp-card-title">Send reset code</h2>
        <p className="rp-card-desc">
          We'll send a 6-digit verification code to your email address.
        </p>
      </div>

      <div className="rp-card-body">
        {/* User identity chip */}
        <div className="rp-user-card">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(200,155,60,0.12)",
              border: "1.5px solid rgba(200,155,60,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", color: "var(--gold)", flexShrink: 0,
            }}>
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <div className="rp-user-card-name">{name}</div>
            <div className="rp-user-card-email">{displayEmail}</div>
          </div>
        </div>

        {/* Delivery method */}
        <div className="rp-radio-option selected">
          <div className="rp-radio-dot">
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--gold)", display: "block",
            }} />
          </div>
          <div>
            <div className="rp-radio-text">Send code via email</div>
            <div className="rp-radio-sub">{displayEmail}</div>
          </div>
        </div>

        {/* Resend row (shown after first send) */}
        {sent && (
          <div className="rp-resend-row">
            <span>Didn't receive it?</span>
            <button
              className="rp-resend-btn"
              onClick={sendEmail}
              disabled={countdown > 0 || loading}
            >
              {countdown > 0
                ? <>Resend in <span className="rp-countdown">{countdown}s</span></>
                : "Resend code"}
            </button>
          </div>
        )}

        {error && <p className="rp-error">⚠ {error}</p>}

        <div className="rp-btn-row">
          <button
            className="rp-btn rp-btn-ghost"
            onClick={() => setStep(0)}
          >
            ← Back
          </button>
          <button
            className="rp-btn rp-btn-primary"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading
              ? <span className="rp-spinner" />
              : sent ? "Continue →" : "Send Code →"}
          </button>
        </div>
      </div>
    </>
  );
}