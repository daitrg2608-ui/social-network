import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useState } from "react";
import SearchAccount from "./SearchAccount";
import SendEmail from "./SendEmail";
import CodeVerification from "./CodeVerification";
import ChangePassword from "./ChangePassword";
import Footer from "../../components/login/Footer";

const STEPS = [
  { label: "Find Account" },
  { label: "Send Code" },
  { label: "Verify Code" },
  { label: "New Password" },
];

export default function Reset() {
  const { user } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [visible, setVisible]       = useState(0);
  const [loading, setLoading]       = useState(false);
  const [email, setEmail]           = useState("");
  const [code, setCode]             = useState("");
  const [password, setPassword]     = useState("");
  const [conf_password, setConfPassword] = useState("");
  const [error, setError]           = useState("");
  const [userInfos, setUserInfos]   = useState("");

  const logout = () => {
    Cookies.set("user", "");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="rp-page">
      {/* Ambient background */}
      <div className="rp-bg">
        <div className="rp-bg-orb rp-bg-orb-1" />
        <div className="rp-bg-orb rp-bg-orb-2" />
        <div className="rp-bg-grid" />
      </div>

      {/* Top bar (mobile / tablet only via CSS, or always shown) */}
      {/* <header className="rp-topbar">
        <Link to="/" className="rp-topbar-logo" style={{ textDecoration: "none" }}>
          <div className="rp-topbar-logo-mark">F</div>
          <span className="rp-topbar-logo-text">FriendNet</span>
        </Link>

        <div className="rp-topbar-right">
          {user ? (
            <>
              <Link to="/profile">
                <img src={user.picture} alt="" className="rp-topbar-avatar" />
              </Link>
              <button className="rp-btn-ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="rp-btn-ghost">Login</button>
            </Link>
          )}
        </div>
      </header> */}

      {/* Main layout */}
      <main className="rp-layout">
        {/* ── Left branding ── */}
        <aside className="rp-left">
          <div className="rp-logo">
            <div className="rp-logo-mark">F</div>
            <span className="rp-logo-text">FriendNet</span>
          </div>

          <p className="rp-brand-eyebrow">Account Recovery</p>
          <h1 className="rp-brand-heading">
            Recover your<br />
            <em>account</em>
          </h1>
          <div className="rp-brand-line" />
          <p className="rp-brand-sub">
            We'll guide you back securely — just follow the steps and you'll be reconnected in moments.
          </p>

          {/* Step tracker */}
          <div className="rp-steps-visual">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`rp-step-pill ${
                  i === visible ? "active" : i < visible ? "done" : ""
                }`}
              >
                <div className="rp-step-dot">
                  {i < visible ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="rp-step-label">{step.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right form ── */}
        <section className="rp-right">
          <div className="rp-card">
            {/* Progress bar */}
            <div className="rp-progress">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`rp-progress-seg ${
                    i === visible ? "active" : i < visible ? "done" : ""
                  }`}
                />
              ))}
            </div>

            {visible === 0 && (
              <SearchAccount
                email={email}
                setEmail={setEmail}
                error={error}
                setError={setError}
                setLoading={setLoading}
                setUserInfos={setUserInfos}
                setVisible={setVisible}
                loading={loading}
              />
            )}
            {visible === 1 && userInfos && (
              <SendEmail
                email={email}
                userInfos={userInfos}
                error={error}
                setError={setError}
                setLoading={setLoading}
                setVisible={setVisible}
                loading={loading}
              />
            )}
            {visible === 2 && (
              <CodeVerification
                code={code}
                setCode={setCode}
                error={error}
                setError={setError}
                setLoading={setLoading}
                setVisible={setVisible}
                userInfos={userInfos}
                loading={loading}
              />
            )}
            {visible === 3 && (
              <ChangePassword
                password={password}
                conf_password={conf_password}
                setConfPassword={setConfPassword}
                setPassword={setPassword}
                error={error}
                setError={setError}
                setLoading={setLoading}
                setVisible={setVisible}
                userInfos={userInfos}
                loading={loading}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}