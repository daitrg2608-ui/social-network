import axios from "axios";
import { Link } from "react-router-dom";

/** Mask email: ab****@domain.com */
function maskEmail(email = "") {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = Math.min(2, local.length);
  return local.slice(0, visible) + "****@" + domain;
}

export default function SendEmail({
  userInfos,
  email,
  error,
  setError,
  setVisible,
  loading,
  setLoading,
}) {
  const sendEmail = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/sendResetPasswordCode`,
        { email }
      );
      setError("");
      setVisible(2);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to send code.");
    }
  };

  const initials = userInfos?.name
    ? userInfos.name.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="rp-step-wrap">
      <div className="rp-card-icon">✉️</div>

      <h2 className="rp-card-title">Reset Your Password</h2>
      <p className="rp-card-sub">
        We found your account. Choose how you'd like to receive the reset code.
      </p>

      {/* User preview */}
      <div className="rp-user-preview">
        {userInfos?.picture ? (
          <img
            src={userInfos.picture}
            alt={userInfos.name || "User"}
            className="rp-user-avatar"
          />
        ) : (
          <div className="rp-user-avatar-placeholder">{initials}</div>
        )}
        <div className="rp-user-info">
          {userInfos?.name && (
            <div className="rp-user-name">{userInfos.name}</div>
          )}
          <div className="rp-user-email">{maskEmail(userInfos?.email)}</div>
          <div className="rp-user-badge">FriendNet Member</div>
        </div>
      </div>

      {/* Delivery method */}
      <div className="rp-radio-option selected">
        <div className="rp-radio-dot checked" />
        <div className="rp-radio-col">
          <span className="rp-radio-primary">Send code via email</span>
          <span className="rp-radio-secondary">{maskEmail(userInfos?.email)}</span>
        </div>
      </div>

      {error && (
        <div className="rp-error-box">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="rp-btns">
        <button
          className="rp-btn-ghost"
          onClick={() => setVisible(0)}
          type="button"
        >
          ← Not You?
        </button>
        <button
          type="button"
          className="rp-btn-primary"
          style={{ width: "auto", padding: "13px 28px" }}
          onClick={sendEmail}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="rp-spinner" />
              Sending…
            </>
          ) : (
            "Send Code →"
          )}
        </button>
      </div>
    </div>
  );
}