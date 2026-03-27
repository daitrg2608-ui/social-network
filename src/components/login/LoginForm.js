import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import DotLoader from "react-spinners/DotLoader";
import axios from "axios";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   Inline styles (no external CSS file needed)
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .fn-root {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    font-family: 'DM Sans', sans-serif;
    background: #0d0c0a;
    color: #f0ebe2;
  }

  /* ── Left panel ── */
  .fn-left {
    flex: 1 1 55%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 3.5rem;
    min-height: 100vh;
  }
  .fn-left::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 30% 50%, rgba(197,148,60,0.18) 0%, transparent 65%),
      radial-gradient(ellipse 60% 80% at 70% 20%, rgba(197,148,60,0.08) 0%, transparent 60%),
      linear-gradient(160deg, #1a1711 0%, #0d0c0a 100%);
  }
  .fn-left-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(197,148,60,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(197,148,60,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 90% at 40% 50%, black 30%, transparent 100%);
  }
  .fn-left-orb {
    position: absolute;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(197,148,60,0.22) 0%, transparent 70%);
    top: 50%; left: 35%;
    transform: translate(-50%, -50%);
    filter: blur(40px);
    animation: breathe 6s ease-in-out infinite;
  }
  @keyframes breathe {
    0%,100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
    50% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
  }
  .fn-logo {
    position: relative;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: auto;
  }
  .fn-logo-mark {
    width: 42px; height: 42px;
    border: 1.5px solid rgba(197,148,60,0.7);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    color: #c5943c;
    letter-spacing: -1px;
  }
  .fn-logo-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #f0ebe2;
  }
  .fn-headline {
    position: relative;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.8rem, 5vw, 4.4rem);
    font-weight: 300;
    line-height: 1.12;
    letter-spacing: -0.01em;
    color: #f0ebe2;
    margin-bottom: 1.25rem;
  }
  .fn-headline em {
    font-style: italic;
    color: #c5943c;
  }
  .fn-sub {
    position: relative;
    font-size: 0.95rem;
    color: rgba(240,235,226,0.5);
    font-weight: 300;
    line-height: 1.6;
    max-width: 380px;
    margin-bottom: 2.5rem;
  }
  .fn-dots {
    position: relative;
    display: flex; gap: 8px;
  }
  .fn-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(197,148,60,0.35);
  }
  .fn-dot.active { background: #c5943c; }

  /* ── Right panel ── */
  .fn-right {
    flex: 0 0 420px;
    background: #111009;
    border-left: 1px solid rgba(197,148,60,0.12);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 2.75rem;
    position: relative;
    overflow: hidden;
  }
  .fn-right::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(197,148,60,0.4), transparent);
  }
  .fn-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #f0ebe2;
    margin-bottom: 0.4rem;
    letter-spacing: 0.01em;
  }
  .fn-form-subtitle {
    font-size: 0.82rem;
    color: rgba(240,235,226,0.4);
    margin-bottom: 2.5rem;
    font-weight: 300;
  }
  .fn-form-subtitle a {
    color: #c5943c;
    text-decoration: none;
  }
  .fn-form-subtitle a:hover { text-decoration: underline; }

  .fn-field {
    position: relative;
    margin-bottom: 1.1rem;
  }
  .fn-field label {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240,235,226,0.45);
    margin-bottom: 0.45rem;
    font-weight: 500;
  }
  .fn-input-wrap {
    position: relative;
  }
  .fn-input-wrap svg {
    position: absolute;
    left: 14px; top: 50%; transform: translateY(-50%);
    color: rgba(197,148,60,0.5);
    pointer-events: none;
    width: 16px; height: 16px;
  }
  .fn-input {
    width: 100%;
    background: rgba(197,148,60,0.04);
    border: 1px solid rgba(197,148,60,0.18);
    border-radius: 8px;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    color: #f0ebe2;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .fn-input::placeholder { color: rgba(240,235,226,0.25); }
  .fn-input:focus {
    border-color: rgba(197,148,60,0.55);
    background: rgba(197,148,60,0.07);
    box-shadow: 0 0 0 3px rgba(197,148,60,0.08);
  }
  .fn-input.has-error { border-color: rgba(220, 80, 80, 0.55); }
  .fn-input-error {
    font-size: 0.72rem;
    color: #e07070;
    margin-top: 0.35rem;
    padding-left: 2px;
  }
  .fn-pw-toggle {
    position: absolute;
    right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(197,148,60,0.4);
    padding: 2px;
    display: flex; align-items: center;
    transition: color 0.2s;
  }
  .fn-pw-toggle:hover { color: rgba(197,148,60,0.8); }

  .fn-row {
    display: flex; justify-content: flex-end;
    margin-bottom: 1.75rem;
  }
  .fn-link {
    font-size: 0.78rem;
    color: rgba(197,148,60,0.7);
    text-decoration: none;
    transition: color 0.2s;
  }
  .fn-link:hover { color: #c5943c; }

  .fn-btn-primary {
    width: 100%;
    padding: 0.85rem;
    background: linear-gradient(135deg, #c5943c, #a87930);
    border: none;
    border-radius: 8px;
    color: #0d0c0a;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(197,148,60,0.25);
    position: relative;
    overflow: hidden;
  }
  .fn-btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .fn-btn-primary:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(197,148,60,0.35); }
  .fn-btn-primary:hover::after { opacity: 1; }
  .fn-btn-primary:active { transform: translateY(0); }
  .fn-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .fn-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 1.5rem 0;
  }
  .fn-divider-line { flex: 1; height: 1px; background: rgba(197,148,60,0.12); }
  .fn-divider-text { font-size: 0.72rem; color: rgba(240,235,226,0.25); letter-spacing: 0.08em; }

  .fn-btn-secondary {
    width: 100%;
    padding: 0.8rem;
    background: transparent;
    border: 1px solid rgba(197,148,60,0.22);
    border-radius: 8px;
    color: rgba(240,235,226,0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 400;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .fn-btn-secondary:hover {
    border-color: rgba(197,148,60,0.5);
    color: #f0ebe2;
    background: rgba(197,148,60,0.05);
  }

  .fn-loader-wrap {
    display: flex; justify-content: center;
    margin-top: 1.25rem;
    min-height: 30px;
  }
  .fn-error {
    margin-top: 0.75rem;
    padding: 0.65rem 1rem;
    background: rgba(220, 80, 80, 0.08);
    border: 1px solid rgba(220, 80, 80, 0.25);
    border-radius: 7px;
    font-size: 0.82rem;
    color: #e08080;
    text-align: center;
  }
  .fn-footer-link {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.78rem;
    color: rgba(240,235,226,0.3);
  }
  .fn-footer-link a { color: rgba(197,148,60,0.65); text-decoration: none; }
  .fn-footer-link a:hover { color: #c5943c; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .fn-root { flex-direction: column; }
    .fn-left {
      flex: none;
      min-height: 260px;
      padding: 2rem;
      justify-content: space-between;
    }
    .fn-headline { font-size: 2.2rem; margin-bottom: 0.75rem; }
    .fn-sub { display: none; }
    .fn-dots { display: none; }
    .fn-right { flex: none; border-left: none; border-top: 1px solid rgba(197,148,60,0.12); padding: 2.5rem 1.75rem; }
  }
  @media (max-width: 480px) {
    .fn-left { min-height: 200px; padding: 1.5rem; }
    .fn-right { padding: 2rem 1.25rem; }
    .fn-headline { font-size: 1.9rem; }
  }
`;

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const loginValidation = Yup.object({
  email: Yup.string().required("Email address is required.").email("Must be a valid email.").max(100),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm({ setVisible, socket }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, setLogin] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLogin((prev) => ({ ...prev, [name]: value }));
  };

  const loginSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, login);
      dispatch({ type: "LOGIN", payload: data });
      Cookies.set("user", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fn-root">

        {/* ── Left ── */}
        <div className="fn-left">
          <div className="fn-left-grid" />
          <div className="fn-left-orb" />

          <div className="fn-logo">
            <div className="fn-logo-mark">F</div>
            <span className="fn-logo-text">FriendNet</span>
          </div>

          <div>
            <h1 className="fn-headline">
              Connect with the<br />people <em>you love.</em>
            </h1>
            <p className="fn-sub">
              Share moments, build community, and stay close to the people who matter most in your life.
            </p>
            <div className="fn-dots">
              <div className="fn-dot active" />
              <div className="fn-dot" />
              <div className="fn-dot" />
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="fn-right">
          <h2 className="fn-form-title">Welcome back</h2>
          <p className="fn-form-subtitle">
            No account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setVisible(true); }}>
              Create one free
            </a>
          </p>

          <Formik
            enableReinitialize
            initialValues={login}
            validationSchema={loginValidation}
            onSubmit={loginSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                {/* Email */}
                <div className="fn-field">
                  <label htmlFor="email">Email address</label>
                  <div className="fn-input-wrap">
                    <EmailIcon />
                    <Field
                      id="email"
                      name="email"
                      type="text"
                      placeholder="you@example.com"
                      className={`fn-input${errors.email && touched.email ? " has-error" : ""}`}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="fn-input-error" />
                </div>

                {/* Password */}
                <div className="fn-field">
                  <label htmlFor="password">Password</label>
                  <div className="fn-input-wrap">
                    <LockIcon />
                    <Field
                      id="password"
                      name="password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className={`fn-input${errors.password && touched.password ? " has-error" : ""}`}
                      onChange={handleLoginChange}
                      style={{ paddingRight: "2.75rem" }}
                    />
                    {/* <button
                      type="button"
                      className="fn-pw-toggle"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPw} />
                    </button> */}
                  </div>
                  <ErrorMessage name="password" component="div" className="fn-input-error" />
                </div>

                <div className="fn-row">
                  <Link to="/reset" className="fn-link">Forgot password?</Link>
                </div>

                <button type="submit" className="fn-btn-primary" disabled={loading}>
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </Form>
            )}
          </Formik>

          {error && <div className="fn-error">{error}</div>}

          <div className="fn-loader-wrap">
            <DotLoader color="#c5943c" loading={loading} size={24} />
          </div>

          <div className="fn-divider">
            <div className="fn-divider-line" />
            <span className="fn-divider-text">OR</span>
            <div className="fn-divider-line" />
          </div>

          <button
            type="button"
            className="fn-btn-secondary"
            onClick={() => setVisible(true)}
          >
            Create New Account
          </button>

          <div className="fn-footer-link">
            <Link to="/verifi">Verify your account</Link>
            {" · "}
            <Link to="/">Create a Page</Link>
          </div>
        </div>

      </div>
    </>
  );
}