import { Form, Formik } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";

const validateEmail = Yup.object({
  email: Yup.string()
    .required("Email address is required.")
    .email("Must be a valid email address.")
    .max(50, "Email address can't be more than 50 characters."),
});

export default function SearchAccount({
  email,
  setEmail,
  error,
  setError,
  setLoading,
  setUserInfos,
  setVisible,
  loading,
}) {
  const handleSearch = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/findUser`,
        { email, verified: true }
      );
      setUserInfos(data);
      setVisible(1);
      setError("");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="rp-step-wrap">
      {/* Icon */}
      <div className="rp-card-icon">🔍</div>

      <h2 className="rp-card-title">Find Your Account</h2>
      <p className="rp-card-sub">
        Enter your email address and we'll locate your account.
      </p>

      <Formik
        enableReinitialize
        initialValues={{ email }}
        validationSchema={validateEmail}
        onSubmit={handleSearch}
      >
        {(formik) => (
          <Form>
            {error && (
              <div className="rp-error-box">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div className="rp-field">
              <label htmlFor="email" className="rp-label">
                Email Address
              </label>
              <input
                id="email"
                type="text"
                name="email"
                autoComplete="email"
                className={`rp-input ${
                  formik.touched.email && formik.errors.email ? "error" : ""
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  formik.setFieldValue("email", e.target.value);
                }}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="rp-field-error">
                  <span>✕</span> {formik.errors.email}
                </p>
              )}
            </div>

            <div className="rp-btns">
              <Link to="/login" className="rp-btn-ghost">
                ← Back to Login
              </Link>
              <button
                type="submit"
                className="rp-btn-primary"
                style={{ width: "auto", padding: "13px 28px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="rp-spinner" />
                    Searching…
                  </>
                ) : (
                  "Find Account →"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}