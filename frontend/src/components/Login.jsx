import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/css/Login.css";
import { FaEye, FaEyeSlash, FaGoogle, FaEnvelope, FaLock, FaSolarPanel } from "react-icons/fa6";

import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";

const storeUserData = (user) => {
  localStorage.setItem(
    "solar_user",
    JSON.stringify({
      uid:       user.uid,
      email:     user.email,
      name:      user.displayName || null,
      lastLogin: new Date().toISOString(),
    })
  );
};

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword]  = useState(false);
  const [rememberMe, setRememberMe]       = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const loginWithEmail = async () => {
    setLoading(true);
    setError("");
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      storeUserData(result.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msgs = {
        "auth/user-not-found":       "No account found with this email.",
        "auth/wrong-password":       "Incorrect password.",
        "auth/invalid-email":        "Invalid email address.",
        "auth/too-many-requests":    "Too many attempts. Please try again later.",
        "auth/invalid-credential":   "Invalid email or password.",
        "auth/operation-not-allowed":"Email/password sign-in is not enabled in this Firebase project.",
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      storeUserData(result.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(
          err.code === "auth/operation-not-allowed"
            ? "Google sign-in is not enabled in this Firebase project."
            : err.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email)    return setError("Please enter your email.");
    if (!formData.password) return setError("Please enter your password.");
    loginWithEmail();
  };

  return (
    <div className="login-main">
      {/* Animated background */}
      <div className="solar-orbit solar-orbit-1" />
      <div className="solar-orbit solar-orbit-2" />
      <div className="solar-orbit solar-orbit-3" />
      <div className="solar-core" />

      <div className="login-content">
        <div className="login-center-container">

          {/* Brand header */}
          <div className="login-header">
            <div className="solar-logo">
              <div className="logo-core" />
              <div className="logo-orbit" />
              <div className="logo-particle" />
            </div>
            <h1 className="aurora">SOLAR CONTROL</h1>
            <p className="login-tagline">Smart Irrigation Management System</p>
          </div>

          {/* Form */}
          <div className="login-form">
            <h2>Welcome back</h2>
            <p className="login-subtitle">Sign in to access your control panel</p>

            {error && (
              <div className="auth-error">
                <span>&#9888;</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="operator@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : <FaSolarPanel />}
                  {loading ? "Signing in…" : "ACCESS DASHBOARD"}
                </button>

                <div className="auth-divider">or</div>

                <button
                  type="button"
                  className="btn btn-google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <FaGoogle />
                  Continue with Google
                </button>
              </div>
            </form>
          </div>

          <p className="signup-link">
            New operator? <Link to="/auth/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
