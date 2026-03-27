import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

/* ── Password strength logic ─────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const classes = ["", "s-weak", "s-fair", "s-good", "s-strong", "s-great"];
  return { score, label: labels[score], cls: classes[score] };
}

/* ── Eye icon ────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ── Validation ──────────────────────────────────────── */
const validatePassword = Yup.object({
  password: Yup.string()
    .required("Enter a password with at least 6 characters.")
    .min(6, "Password must be at least 6 characters.")
    .max(36, "Password can't be more than 36 characters."),
  conf_password: Yup.string()
    .required("Please confirm your password.")
    .oneOf([Yup.ref("password")], "Passwords don't match."),
});

export default function ChangePassword({
  password,
  setPassword,
  conf_password,
  setConfPassword,
  error,
  setError,
  setLoading,
  userInfos,
  loading,
}) {
  const navigate = useNavigate();
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const { score, label: strengthLabel, cls } = getStrength(password);

  const changePassword = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/changePassword`,
        { email: userInfos.email, password }
      );
      setError("");
      setLoading(false);
      setSuccess(true);
      // Redirect after 2.5s
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to update password.");
    }
  };

  /* ── Success screen ──────────────────────────────── */
  if (success) {
    return (
      <div className="rp-success">
        <div className="rp-success-icon">
          <svg className="rp-success-check" viewBox="0 0 32 32">
            <polyline points="6,16 13,23 26,9" />
          </svg>
        </div>
        <h2 className="rp-success-title">Password Updated!</h2>
        <p className="rp-success-sub">
          Your password has been changed successfully.<br />
          Redirecting you to login…
        </p>
        <button
          className="rp-btn-primary"
          onClick={() => navigate("/login")}
        >
          Go to Login →
        </button>
      </div>
    );
  }

  return (
    <div className="rp-step-wrap">
      <div className="rp-card-icon">🔑</div>
      <h2 className="rp-card-title">New Password</h2>
      <p className="rp-card-sub">
        Create a strong password you haven't used before.
      </p>

      <Formik
        enableReinitialize
        initialValues={{ password, conf_password }}
        validationSchema={validatePassword}
        onSubmit={changePassword}
      >
        {(formik) => (
          <Form>
            {error && (
              <div className="rp-error-box">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* New password */}
            <div className="rp-field">
              <label htmlFor="password" className="rp-label">
                New Password
              </label>
              <div className="rp-input-wrap">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  className={`rp-input ${
                    formik.touched.password && formik.errors.password ? "error" : ""
                  }`}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    formik.setFieldValue("password", e.target.value);
                  }}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="rp-strength">
                  <div className="rp-strength-bar-wrap">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rp-strength-bar ${i < score ? `active ${cls}` : ""}`}
                      />
                    ))}
                  </div>
                  {strengthLabel && (
                    <span className="rp-strength-label">
                      Strength:{" "}
                      <span style={{
                        color: score <= 1 ? "#e05252" :
                               score === 2 ? "#e0a052" :
                               score === 3 ? "#e0d052" :
                               score === 4 ? "var(--gold)" : "var(--success)"
                      }}>
                        {strengthLabel}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {formik.touched.password && formik.errors.password && (
                <p className="rp-field-error">
                  <span>✕</span> {formik.errors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="rp-field">
              <label htmlFor="conf_password" className="rp-label">
                Confirm Password
              </label>
              <div className="rp-input-wrap">
                <input
                  id="conf_password"
                  type={showCpw ? "text" : "password"}
                  name="conf_password"
                  autoComplete="new-password"
                  className={`rp-input ${
                    formik.touched.conf_password && formik.errors.conf_password
                      ? "error"
                      : ""
                  }`}
                  placeholder="Repeat your password"
                  value={conf_password}
                  onChange={(e) => {
                    setConfPassword(e.target.value);
                    formik.setFieldValue("conf_password", e.target.value);
                  }}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowCpw((v) => !v)}
                  tabIndex={-1}
                >
                  <EyeIcon open={showCpw} />
                </button>
              </div>
              {formik.touched.conf_password && formik.errors.conf_password && (
                <p className="rp-field-error">
                  <span>✕</span> {formik.errors.conf_password}
                </p>
              )}
            </div>

            <div className="rp-btns" style={{ marginTop: "22px" }}>
              <span /> {/* spacer */}
              <button
                type="submit"
                className="rp-btn-primary"
                style={{ width: "auto", padding: "13px 28px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="rp-spinner" />
                    Updating…
                  </>
                ) : (
                  "Update Password →"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}