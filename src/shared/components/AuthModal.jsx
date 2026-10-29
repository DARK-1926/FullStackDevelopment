import { useState } from "react";
import { Check, KeyRound, Loader2, Lock, Mail, Sparkles, User, X } from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";

export function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAppContext();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        setSuccessMsg("Logged in successfully!");
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 800);
      } else {
        await register({ name, email, password, university, degree });
        setSuccessMsg("Your account has been created.");
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 800);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail("alex@university.edu");
    setPassword("password123");
    setError(null);
    setLoading(true);
    try {
      await login("alex@university.edu", "password123");
      setSuccessMsg("Logged in with Demo Account!");
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="brand-mark" style={{ width: 26, height: 26, fontSize: 13 }}>
                O
              </span>
              <strong style={{ fontSize: 15, color: "#f8fafc" }}>OpportunityOS Auth</strong>
            </div>
            <h2 style={{ margin: "4px 0 0", fontSize: 20 }}>
              {mode === "login" ? "Sign in to your account" : "Create student account"}
            </h2>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
              Sign in to keep your profile and applications connected to your account.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            type="button"
          >
            Create Account (Register)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: 14 }}>
            {error && <div className="auth-alert error">⚠️ {error}</div>}
            {successMsg && (
              <div className="auth-alert success">
                <Check size={16} /> {successMsg}
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="form-group">
                  <label htmlFor="regName">Full Name *</label>
                  <div className="input-with-icon">
                    <User size={15} />
                    <input
                      id="regName"
                      className="form-input"
                      placeholder="e.g. Alex Shah"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="regUni">University / Institute</label>
                  <input
                    id="regUni"
                    className="form-input"
                    placeholder="e.g. NIT Delhi, IIT Bombay"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regDegree">Degree / Major</label>
                  <input
                    id="regDegree"
                    className="form-input"
                    placeholder="e.g. B.Tech Computer Science"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="authEmail">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={15} />
                <input
                  id="authEmail"
                  type="email"
                  className="form-input"
                  placeholder="name@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="authPass">Password *</label>
              <div className="input-with-icon">
                <Lock size={15} />
                <input
                  id="authPass"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {mode === "login" && (
              <button
                type="button"
                className="quick-demo-btn"
                onClick={handleQuickDemo}
                disabled={loading}
              >
                <Sparkles size={14} /> Quick Demo Login (alex@university.edu / password123)
              </button>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: 11.5, color: "var(--color-text-subtle)" }}>
              Your account
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="button button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button button-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin" /> Processing...
                  </>
                ) : (
                  <>
                    <KeyRound size={15} /> {mode === "login" ? "Sign In" : "Register Account"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

