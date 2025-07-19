import React, { useState, useEffect } from "react";
import "../styles/Auth.css";
import axios from "../api/axios";
import { FaGoogle, FaGithub, FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const validateEmail = (email) => {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const GOOGLE_G_SVG = (
  <svg width="36" height="36" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.7 30.77 0 24 0 14.82 0 6.71 5.1 2.69 12.44l7.98 6.19C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M9.67 28.13a14.5 14.5 0 0 1 0-8.26l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.56l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.19-5.6c-2.01 1.35-4.59 2.15-8.71 2.15-6.38 0-11.87-3.63-14.33-8.89l-7.98 6.19C6.71 42.9 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
);

const SplitAuthModal = ({ mode, onClose, onSwitchMode, onSubmit, isLoading, errorMessage, hideCloseButton }) => {
  // --- Validation variables FIRST ---
  const [form, setForm] = useState({
    name: "",
    username: "",
    emailOrUsername: "",
    password: "",
    confirmPassword: ""
  });
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUsernameSuccess, setShowUsernameSuccess] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [showPasswordsMatchSuccess, setShowPasswordsMatchSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSentEmail, setCodeSentEmail] = useState("");
  const [verificationStep, setVerificationStep] = useState(1);
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null=untouched, true=ok, false=taken
  const [emailAvailable, setEmailAvailable] = useState(null); // null=untouched, true=ok, false=taken
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendCode = async () => {
    setApiError("");
    setCodeError("");
    setResendMessage("");
    setApiLoading(true);
    try {
      await axios.post("/send-verification-code", {
        name: form.name,
        username: form.username,
        email: form.emailOrUsername,
        password: form.password,
        password_confirmation: form.confirmPassword
      });
      setResendCooldown(60);
      setResendMessage("A new code has been sent to your email.");
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setApiLoading(false);
    }
  };

  const isLogin = mode === "login";
  const emailValid = validateEmail(form.emailOrUsername);
  const usernameValid = !isLogin && form.username.length >= 4 && !/\s/.test(form.username);
  const passwordsMatch = isLogin || form.password === form.confirmPassword;
  const passwordStrength = getPasswordStrength(form.password);
  const passwordValid = passwordStrength >= 4;
  const confirmValid = passwordsMatch;
  const passwordRequirements = [
    { valid: form.password.length >= 8, label: 'min 8 chars' },
    { valid: /[A-Z]/.test(form.password), label: 'uppercase needed' },
    { valid: /[a-z]/.test(form.password), label: 'lowercase needed' },
    { valid: /[0-9]/.test(form.password), label: 'number needed' },
    { valid: /[^A-Za-z0-9]/.test(form.password), label: 'symbol needed' },
  ];
  const missingRequirements = passwordRequirements.filter(r => !r.valid);

  useEffect(() => {
    if (usernameValid && form.username) {
      setShowUsernameSuccess(true);
      const t = setTimeout(() => setShowUsernameSuccess(false), 2000);
      return () => clearTimeout(t);
    } else {
      setShowUsernameSuccess(false);
    }
  }, [usernameValid, form.username]);
  useEffect(() => {
    if (emailValid && form.emailOrUsername) {
      setShowEmailSuccess(true);
      const t = setTimeout(() => setShowEmailSuccess(false), 2000);
      return () => clearTimeout(t);
    } else {
      setShowEmailSuccess(false);
    }
  }, [emailValid, form.emailOrUsername]);
  useEffect(() => {
    if (passwordsMatch && confirmTouched) {
      setShowPasswordsMatchSuccess(true);
      const t = setTimeout(() => setShowPasswordsMatchSuccess(false), 2000);
      return () => clearTimeout(t);
    } else {
      setShowPasswordsMatchSuccess(false);
    }
  }, [passwordsMatch, confirmTouched]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiLoading(true);
    try {
      if (isLogin) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrUsername);
        const payload = isEmail
          ? { email: form.emailOrUsername, password: form.password }
          : { username: form.emailOrUsername, password: form.password };
        const res = await axios.post("/login", payload);
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = '/dashboard';
      } else {
        if (form.password !== form.confirmPassword) {
          setApiError("Passwords do not match");
          setApiLoading(false);
          return;
        }
        // Send verification code instead of registering directly
        await axios.post("/send-verification-code", {
          name: form.name,
          username: form.username,
          email: form.emailOrUsername,
          password: form.password,
          password_confirmation: form.confirmPassword
        });
        setVerificationStep(2);
        setCodeSentEmail(form.emailOrUsername);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Login/Register failed. Please try again.");
    } finally {
      setApiLoading(false);
    }
  };

  // --- Social Login ---
  const handleSocialLogin = (provider) => {
    setSocialError("");
    setSocialLoading(true);
    const url = `${axios.defaults.baseURL}/auth/${provider}/redirect`;
    window.location.href = url; // Open in same tab (user can Ctrl+Click for new tab)
  };

  // Add handler for code verification
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setCodeError("");
    setCodeLoading(true);
    try {
      const res = await axios.post("/verify-code", {
        name: form.name,
        username: form.username,
        email: form.emailOrUsername,
        password: form.password,
        password_confirmation: form.confirmPassword,
        code: verificationCode
      });
      // Success: log in user and redirect to dashboard
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = '/dashboard';
    } catch (err) {
      setCodeError(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setCodeLoading(false);
    }
  };

  // Async username check
  const checkUsernameAvailability = async () => {
    if (!form.username || form.username.length < 4 || /\s/.test(form.username)) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await axios.get(`/check-username?username=${encodeURIComponent(form.username)}`);
      setUsernameAvailable(res.data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Async email check
  const checkEmailAvailability = async () => {
    if (!validateEmail(form.emailOrUsername)) {
      setEmailAvailable(null);
      return;
    }
    setCheckingEmail(true);
    try {
      const res = await axios.get(`/check-email?email=${encodeURIComponent(form.emailOrUsername)}`);
      setEmailAvailable(res.data.available);
    } catch {
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Animation classes
  const slideClass = isLogin ? "split-modal-slide-left" : "split-modal-slide-right";

  return (
    <div className={`split-auth-modal-inner ${slideClass}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', position: 'relative', fontFamily: 'Inter, Lato, Nunito, Arial, sans-serif' }}>
      {/* Form side */}
      <div className={`split-auth-modal-form-side ${isLogin ? "left" : "right"}`}>
        <div className="split-auth-modal-form-content glassmorphism" style={{ fontFamily: 'Inter, Lato, Nunito, Arial, sans-serif', padding: 56, borderRadius: 36, boxShadow: '0 12px 48px 0 rgba(191, 174, 158, 0.22)', maxWidth: 580, minWidth: 420, width: '100%', minHeight: 600, marginTop: 32 }}>
          <h1 className="split-auth-modal-title" style={{ fontFamily: 'Nunito, Inter, Lato, Arial, sans-serif', fontWeight: 900, fontSize: '2.7rem', marginBottom: 18, textAlign: 'center', letterSpacing: '-1px', textShadow: '0 2px 12px rgba(191, 174, 158, 0.08)' }}>{isLogin ? "Login" : "Register"}</h1>
          <div style={{ display: 'flex', gap: 32, marginBottom: 28, width: '100%', justifyContent: 'center' }}>
            <button type="button" className="social-btn google" onClick={() => handleSocialLogin('google')} disabled={socialLoading} style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: '#fff', border: '2.5px solid #e6d3b3', boxShadow: '0 2px 8px rgba(191, 174, 158, 0.10)', transition: 'box-shadow 0.2s, border 0.2s', cursor: 'pointer' }}>
              {GOOGLE_G_SVG}
            </button>
            <button type="button" className="social-btn github" onClick={() => handleSocialLogin('github')} disabled={socialLoading} style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: '#fff', border: '2.5px solid #bfae9e', boxShadow: '0 2px 8px rgba(191, 174, 158, 0.10)', transition: 'box-shadow 0.2s, border 0.2s', cursor: 'pointer' }}>
              <FaGithub style={{ color: '#24292f', fontSize: 36 }} />
            </button>
          </div>
          {socialError && <div className="feedback">{socialError}</div>}
          {apiError && <div className="feedback">{apiError}</div>}
          {isLogin ? (
            <form onSubmit={handleSubmit} className="split-auth-modal-form">
              <input
                type="text"
                name="emailOrUsername"
                placeholder="Email or Username"
                value={form.emailOrUsername}
                onChange={handleChange}
                onBlur={() => setEmailTouched(true)}
                required
                style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
              />
              {emailTouched && form.emailOrUsername && !validateEmail(form.emailOrUsername) && form.emailOrUsername.includes('@') && (
                <div className="feedback error-pill"><FaExclamationCircle style={{ color: '#e53935', marginRight: 6 }} /> Invalid email format</div>
              )}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => setPasswordTouched(true)}
                  required
                  style={{ paddingRight: 44, minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                />
                <button type="button" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bfae9e', fontSize: 20, padding: 0, margin: 0, lineHeight: 1, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 0 0' }}>
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={e => setKeepLoggedIn(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="keepLoggedIn" style={{ fontSize: 15, color: '#7a6a6a', cursor: 'pointer' }}>Keep me logged in</label>
              </div>
              <button type="submit" disabled={apiLoading || isLoading || !form.emailOrUsername || !form.password} className="split-auth-modal-submit-btn">
                {(apiLoading || isLoading) ? "Logging in..." : "Login"}
              </button>
              {errorMessage && <div className="feedback error-pill"><FaExclamationCircle style={{ color: '#e53935', marginRight: 6 }} /> {errorMessage}</div>}
            </form>
          ) : (
            verificationStep === 1 ? (
              <form onSubmit={handleSubmit} className="split-auth-modal-form">
                <div className="form-field">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    onBlur={() => { setUsernameTouched(true); checkUsernameAvailability(); }}
                    required
                    style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                  />
                  {/* Async username validation pill */}
                  {usernameTouched && form.username && (
                    checkingUsername ? (
                      <div className="feedback-pill" style={{ background: '#fff8e1', color: '#bfae9e', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '8px 16px', fontWeight: 600, fontSize: 15, marginTop: 8 }}>
                        Checking username...
                      </div>
                    ) : usernameAvailable === true ? (
                      <div className="feedback-pill success-pill" style={{ background: '#e8f5e9', color: '#43a047', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '10px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #43a04722', marginTop: 8 }}><FaCheckCircle style={{ color: '#43a047', fontSize: 18 }} /> <span style={{ fontWeight: 700, fontSize: 16 }}>Username is available</span></div>
                    ) : usernameAvailable === false ? (
                      <div className="feedback-pill error-pill" style={{ background: '#ffebee', color: '#e53935', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '8px 16px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #e5393522', marginTop: 8 }}><FaExclamationCircle style={{ color: '#e53935', fontSize: 18 }} /> <span style={{ fontWeight: 700 }}>Username is taken</span></div>
                    ) : null
                  )}
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    name="emailOrUsername"
                    placeholder="Email"
                    value={form.emailOrUsername}
                    onChange={handleChange}
                    onBlur={() => { setEmailTouched(true); checkEmailAvailability(); }}
                    required
                    style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                  />
                  {/* Async email validation pill */}
                  {emailTouched && form.emailOrUsername && (
                    checkingEmail ? (
                      <div className="feedback-pill" style={{ background: '#fff8e1', color: '#bfae9e', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '8px 16px', fontWeight: 600, fontSize: 15, marginTop: 8 }}>
                        Checking email...
                      </div>
                    ) : emailAvailable === true ? (
                      <div className="feedback-pill success-pill" style={{ background: '#e8f5e9', color: '#43a047', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '10px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #43a04722', marginTop: 8 }}><FaCheckCircle style={{ color: '#43a047', fontSize: 18 }} /> <span style={{ fontWeight: 700, fontSize: 16 }}>Email is available</span></div>
                    ) : emailAvailable === false ? (
                      <div className="feedback-pill error-pill" style={{ background: '#ffebee', color: '#e53935', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '8px 16px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #e5393522', marginTop: 8 }}><FaExclamationCircle style={{ color: '#e53935', fontSize: 18 }} /> <span style={{ fontWeight: 700 }}>Email is taken</span></div>
                    ) : null
                  )}
                </div>
                <div className="form-field" style={{ width: '100%' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={() => setPasswordTouched(true)}
                      required
                      style={{ paddingRight: 44, minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                    />
                    <button type="button" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bfae9e', fontSize: 20, padding: 0, margin: 0, lineHeight: 1, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {/* Show only the first missing requirement, if any */}
                  {passwordTouched && emailValid && missingRequirements.length > 0 && (
                    <div className="feedback-pill error-pill" style={{ background: '#ffebee', color: '#e53935', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '8px 16px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #e5393522', marginTop: 8 }}>
                      <FaExclamationCircle style={{ color: '#e53935', fontSize: 18 }} /> <span style={{ fontWeight: 700 }}>{missingRequirements[0].label}</span>
                    </div>
                  )}
                  {/* Show success if all requirements met */}
                  {passwordTouched && emailValid && missingRequirements.length === 0 && (
                    <div className="feedback-pill success-pill" style={{ background: '#e8f5e9', color: '#43a047', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '10px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #43a04722', marginTop: 8 }}><FaCheckCircle style={{ color: '#43a047', fontSize: 18 }} /> <span style={{ fontWeight: 700, fontSize: 16 }}>Password is strong</span></div>
                  )}
                </div>
                <div className="form-field" style={{ width: '100%' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => setConfirmTouched(true)}
                      required
                      style={{ paddingRight: 44, minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                      onPaste={e => e.preventDefault()}
                      onCopy={e => e.preventDefault()}
                    />
                    <button type="button" tabIndex={-1} aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bfae9e', fontSize: 20, padding: 0, margin: 0, lineHeight: 1, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {/* Confirm password feedback */}
                  {confirmTouched && emailValid && passwordValid && (
                    passwordsMatch ? (
                      <div className="feedback-pill success-pill" style={{ background: '#e8f5e9', color: '#43a047', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '10px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #43a04722', marginTop: 8 }}><FaCheckCircle style={{ color: '#43a047', fontSize: 18 }} /> <span style={{ fontWeight: 700, fontSize: 16 }}>Passwords match</span></div>
                    ) : (
                      <div className="feedback-pill error-pill" style={{ background: '#ffebee', color: '#e53935', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 18, padding: '8px 16px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #e5393522', marginTop: 8 }}><FaExclamationCircle style={{ color: '#e53935', fontSize: 18 }} /> <span style={{ fontWeight: 700 }}>Passwords do not match</span></div>
                    )
                  )}
                </div>
                <button type="submit" disabled={apiLoading || isLoading || !validateEmail(form.emailOrUsername) || !passwordValid || !confirmValid || usernameAvailable === false || emailAvailable === false} className="split-auth-modal-submit-btn">
                  {(apiLoading || isLoading) ? "Registering..." : "Register"}
                </button>
                {errorMessage && <div className="feedback error-pill"><FaExclamationCircle style={{ color: '#e53935', marginRight: 6 }} /> <span style={{ fontWeight: 700 }}>{errorMessage}</span></div>}
              </form>
            ) : (
              <form className="split-auth-modal-form" onSubmit={handleVerifyCode}>
                <div className="form-field">
                  <label htmlFor="verificationCode" style={{ fontWeight: 700, color: '#a68a6d', marginBottom: 8 }}>Enter the 6-digit code sent to <span style={{ color: '#bfae9e' }}>{codeSentEmail}</span>:</label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center', fontWeight: 700 }}
                    autoFocus
                    disabled={codeLoading}
                  />
                  {codeError && <div className="feedback error-pill" style={{ marginTop: 8 }}>{codeError}</div>}
                </div>
                <button type="submit" className="split-auth-modal-submit-btn" disabled={codeLoading || verificationCode.length !== 6}>
                  {codeLoading ? "Verifying..." : "Verify & Complete Registration"}
                </button>
                <div style={{ marginTop: 18, textAlign: 'center', color: '#7a6a6a', fontSize: 15 }}>
                  Didn't get the code?{' '}
                  <button type="button" onClick={handleResendCode} disabled={resendCooldown > 0 || apiLoading} style={{ color: '#a68a6d', background: 'none', border: 'none', fontWeight: 700, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', textDecoration: 'underline', marginLeft: 4 }}>
                    Resend {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                  </button>
                </div>
                {resendMessage && <div style={{ color: resendMessage.startsWith('Failed') ? '#e53935' : '#43a047', marginTop: 8, textAlign: 'center', fontWeight: 600 }}>{resendMessage}</div>}
              </form>
            )
          )}
          <div className="split-auth-modal-switch">
            {isLogin ? (
              <>
                No account yet?{' '}
                <span onClick={onSwitchMode}>Register here</span>
              </>
            ) : (
              <>
                Have an account?{' '}
                <span onClick={onSwitchMode}>Login here</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitAuthModal; 