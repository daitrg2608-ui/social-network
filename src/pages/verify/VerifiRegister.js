import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import CodeVerification from "./CodeVerification";
import Footer from "../../components/login/Footer";
import axios from "axios";
import { useParams } from "react-router-dom";

const STEPS = ["Locate Account", "Verify", "Done"];

function StepIndicator({ current }) {
  return (
    <div className="rp-steps">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
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

export default function VerifiRegister(socket) {
  const { user }        = useSelector((state) => ({ ...state }));
  const dispatch        = useDispatch();
  const { emailRegister } = useParams();
  const navigate        = useNavigate();

  const [step,      setStep]      = useState(0);   // 0=loading, 1=otp, 2=success
  const [loading,   setLoading]   = useState(false);
  const [code,      setCode]      = useState("");
  const [error,     setError]     = useState("");
  const [userInfos, setUserInfos] = useState(null);
  const [initError, setInitError] = useState("");

  const logout = () => {
    Cookies.set("user", "");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  // On mount: find the unverified user and jump straight to OTP entry
  useEffect(() => {
    const locate = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/findUser`,
          { email: emailRegister, verified: false }
        );
        setUserInfos(data);
        setStep(1);
      } catch (err) {
        setInitError(
          err.response?.data?.message || "Could not locate your account. Please register again."
        );
      } finally {
        setLoading(false);
      }
    };
    locate();
  }, [emailRegister]);

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
        {/* Left branding */}
        <aside className="rp-left">
          <div className="rp-left-glow rp-left-glow-1" />
          <div className="rp-left-glow rp-left-glow-2" />

          <div className="rp-left-badge">Registration</div>

          <h1 className="rp-left-title">
            Almost<br /><em>there</em>
          </h1>
          <p className="rp-left-sub">
            Confirm your email address to activate your FriendNet account and
            start connecting with friends.
          </p>

          <div className="rp-features">
            <div className="rp-feature">
              <span className="rp-feature-icon">✉</span>
              Check your inbox for the code
            </div>
            <div className="rp-feature">
              <span className="rp-feature-icon">⏱</span>
              Code valid for 10 minutes
            </div>
            <div className="rp-feature">
              <span className="rp-feature-icon">🎉</span>
              One step away from joining
            </div>
          </div>
        </aside>

        {/* Right form */}
        <section className="rp-right">
          <div className="rp-card">
            <StepIndicator current={step === 2 ? 2 : step === 1 ? 1 : 0} />

            {/* Loading / locating */}
            {step === 0 && !initError && (
              <div className="rp-card-body" style={{ alignItems: "center", padding: "3rem 2rem" }}>
                <span className="rp-spinner" style={{ width: 28, height: 28, borderTopColor: "var(--gold)", borderColor: "var(--gold-border)" }} />
                <p style={{ color: "var(--muted-text)", fontSize: "0.88rem", marginTop: "1rem" }}>
                  Locating your account…
                </p>
              </div>
            )}

            {/* Init error */}
            {initError && (
              <div className="rp-card-body" style={{ alignItems: "center", textAlign: "center" }}>
                <p className="rp-error" style={{ justifyContent: "center" }}>⚠ {initError}</p>
                <Link to="/register" className="rp-btn rp-btn-primary" style={{ marginTop: "1rem" }}>
                  Back to Register
                </Link>
              </div>
            )}

            {/* OTP entry */}
            {step === 1 && (
              <div className="rp-step-enter">
                <CodeVerification
                  user={user}
                  code={code}
                  setCode={setCode}
                  error={error}
                  setError={setError}
                  loading={loading}
                  setLoading={setLoading}
                  setStep={() => {}}        // no back-step in register flow
                  userInfos={userInfos}
                  socket={socket}
                  onSuccess={() => setStep(2)}
                />
              </div>
            )}

            {/* Success */}
            {step === 2 && (
              <div className="rp-step-enter rp-success">
                <div className="rp-success-icon">✓</div>
                <h2 className="rp-success-title">Verification successful!</h2>
                <p className="rp-success-sub">
                  Your FriendNet account is now active.<br />
                  Ready to start connecting?
                </p>
                <button
                  className="rp-btn rp-btn-primary"
                  style={{ width: "100%", maxWidth: 220, marginTop: 8 }}
                  onClick={() => navigate("/")}
                >
                  Continue to Home →
                </button>
                <Link
                  to="/login"
                  style={{ fontSize: "0.82rem", color: "var(--muted-text)", marginTop: 4 }}
                >
                  Or go to Login
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}