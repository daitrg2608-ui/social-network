import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useState } from "react";
import SearchAccount from "./SearchAccount";
import SendEmail from "./SendEmail";
import CodeVerification from "./CodeVerification";
import Footer from "../../components/login/Footer";
import { useParams } from "react-router-dom";

const STEPS = ["Find Account", "Send Code", "Verify", "Done"];

function StepIndicator({ current }) {
  return (
    <div className="rp-steps">
      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div className="rp-step" key={i}>
            <div
              className={`rp-step-dot ${done ? "done" : ""} ${active ? "active" : ""}`}
              title={label}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`rp-step-line ${done ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Verifi(socket) {
  const { user } = useSelector((state) => ({ ...state }));
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { register } = useParams();

  const [step,      setStep]      = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [email,     setEmail]     = useState("");
  const [code,      setCode]      = useState("");
  const [error,     setError]     = useState("");
  const [userInfos, setUserInfos] = useState(null);

  const logout = () => {
    Cookies.set("user", "");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="rp-root">
      {/* ── Header ─────────────────────────────────── */}
      <header className="rp-header">
        <div className="fn-logo">
          <div className="fn-logo-mark">F</div>
          <span className="fn-logo-text">FriendNet</span>
        </div>
        <div className="rp-header-right">
          {user ? (
            <>
              <Link to="/profile">
                <img src={user.picture} alt={user.name} />
              </Link>
              <button className="blue_btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">
              <button className="blue_btn">Login</button>
            </Link>
          )}
        </div>
      </header>

      {/* ── Main ───────────────────────────────────── */}
      <main className="rp-main">
        {/* Left branding panel */}
        <aside className="rp-left">
          <div className="rp-left-glow rp-left-glow-1" />
          <div className="rp-left-glow rp-left-glow-2" />

          <div className="rp-left-badge">Account Security</div>

          <h1 className="rp-left-title">
            Secure your<br /><em>account</em>
          </h1>
          <p className="rp-left-sub">
            Enter the verification code to confirm your identity and continue safely.
          </p>

          <div className="rp-features">
            <div className="rp-feature">
              <span className="rp-feature-icon">🔒</span>
              End-to-end encrypted verification
            </div>
            <div className="rp-feature">
              <span className="rp-feature-icon">⚡</span>
              Code delivered in seconds
            </div>
            <div className="rp-feature">
              <span className="rp-feature-icon">🛡️</span>
              Protected against brute-force attacks
            </div>
          </div>
        </aside>

        {/* Right form panel */}
        <section className="rp-right">
          <div className="rp-card">
            <StepIndicator current={step} />

            {step === 0 && (
              <div className="rp-step-enter">
                <SearchAccount
                  email={email}
                  setEmail={setEmail}
                  error={error}
                  setError={setError}
                  loading={loading}
                  setLoading={setLoading}
                  setUserInfos={setUserInfos}
                  setStep={setStep}
                />
              </div>
            )}

            {step === 1 && userInfos && (
              <div className="rp-step-enter">
                <SendEmail
                  email={email}
                  userInfos={userInfos}
                  error={error}
                  setError={setError}
                  loading={loading}
                  setLoading={setLoading}
                  setStep={setStep}
                />
              </div>
            )}

            {step === 2 && (
              <div className="rp-step-enter">
                <CodeVerification
                  user={user}
                  code={code}
                  setCode={setCode}
                  error={error}
                  setError={setError}
                  loading={loading}
                  setLoading={setLoading}
                  setStep={setStep}
                  userInfos={userInfos}
                  socket={socket}
                  onSuccess={() => setStep(3)}
                />
              </div>
            )}

            {step === 3 && (
              <div className="rp-step-enter rp-success">
                <div className="rp-success-icon">✓</div>
                <h2 className="rp-success-title">You're verified!</h2>
                <p className="rp-success-sub">
                  Your identity has been confirmed.<br />
                  Welcome back to FriendNet.
                </p>
                <button
                  className="rp-btn rp-btn-primary"
                  style={{ width: "100%", maxWidth: 220, marginTop: 8 }}
                  onClick={() => navigate("/")}
                >
                  Continue to Home →
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}