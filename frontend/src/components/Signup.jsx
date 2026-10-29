import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/css/Login.css";
import { FaEye, FaEyeSlash, FaGoogle, FaEnvelope, FaLock, FaUser, FaSolarPanel } from "react-icons/fa6";

import { auth } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
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

const SignUp = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirm]   = useState(false);
  const [agreeTerms, setAgreeTerms]             = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const signUpWithEmail = async () => {
    setLoading(true);
    setError("");
    try {
      const { email, password, firstName, lastName } = formData;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set the display name
      await updateProfile(result.user, { displayName: `${firstName} ${lastName}`.trim() });
      storeUserData({ ...result.user, displayName: `${firstName} ${lastName}`.trim() });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email":        "Invalid email address.",
        "auth/weak-password":        "Password must be at least 6 characters.",
        "auth/operation-not-allowed":"Email/password sign-up is not enabled in this Firebase project.",
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
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
    if (!formData.firstName || !formData.lastName) return setError("Please enter your full name.");
    if (!formData.email)                           return setError("Please enter your email.");
    if (!formData.password)                        return setError("Please enter a password.");
    if (formData.password.length < 6)              return setError("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    if (!agreeTerms)                               return setError("Please agree to the terms and conditions.");
    signUpWithEmail();
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
            <h2>Create account</h2>
            <p className="login-subtitle">Join the solar operations network</p>

            {error && (
              <div className="auth-error">
                <span>&#9888;</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name fields */}
              <div className="name-fields">
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="operator@email.com"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="input-group password-group">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={loading}
                  />
                  I agree to the{" "}
                  <a href="#" className="terms-link">Terms &amp; Conditions</a>
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : <FaSolarPanel />}
                  {loading ? "Creating account…" : "CREATE ACCOUNT"}
                </button>

                <div className="auth-divider">or</div>

                <button
                  type="button"
                  className="btn btn-google"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <FaGoogle />
                  Sign up with Google
                </button>
              </div>
            </form>
          </div>

          <p className="signup-link">
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
