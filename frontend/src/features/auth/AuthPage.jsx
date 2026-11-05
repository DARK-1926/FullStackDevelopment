import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { FlowButton } from "../../components/ui/FlowButton.jsx";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import "./auth-page.css";

const brandLogo = `${import.meta.env.BASE_URL}devrhythm-growth-logo.png`;

function AsciiGlobe() {
  const [angle, setAngle] = useState(0);
  const dragging = useRef(false);
  const previousX = useRef(0);
  useEffect(() => {
    let frame;
    let last = 0;
    const tick = (time) => {
      if (!dragging.current && time - last > 90) {
        setAngle((value) => value + 0.035);
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const rows = [];
  const width = 58;
  const height = 25;
  const glyphs = " .:-=+*#%@";
  for (let y = 0; y < height; y += 1) {
    let row = "";
    for (let x = 0; x < width; x += 1) {
      const nx = (x / (width - 1)) * 2 - 1;
      const ny = ((y / (height - 1)) * 2 - 1) * 0.92;
      const radius = nx * nx + ny * ny;
      if (radius > 1) { row += " "; continue; }
      const nz = Math.sqrt(1 - radius);
      const longitude = Math.atan2(nx, nz) + angle;
      const latitude = Math.asin(-ny);
      const land = Math.sin(longitude * 3 + Math.sin(latitude * 5)) * Math.cos(latitude * 4)
        + Math.cos(longitude * 5 - latitude * 3) * 0.45;
      const grid = Math.abs(Math.sin(longitude * 8)) < 0.055 || Math.abs(Math.sin(latitude * 8)) < 0.045;
      const visible = nz > -0.08;
      const intensity = grid ? 3 : land > 0.38 ? 8 : land > 0.05 ? 5 : visible ? 2 : 0;
      row += glyphs[intensity];
    }
    rows.push(row);
  }

  return <pre className="auth-ascii-globe" aria-label="Animated ASCII globe. Drag to rotate." role="img"
    onPointerDown={(event) => { dragging.current = true; previousX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerMove={(event) => { if (!dragging.current) return; const delta = event.clientX - previousX.current; previousX.current = event.clientX; setAngle((value) => value + delta * 0.012); }}
    onPointerUp={() => { dragging.current = false; }}
    onPointerCancel={() => { dragging.current = false; }}
  >{rows.join("\n")}</pre>;
}

function FormField({ id, label, icon: Icon, children, onPointerMove }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap" onPointerMove={onPointerMove}>
        <Icon size={17} aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function AuthPage({ onClose }) {
  const { login, register } = useAppContext();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const moveSpotlight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess(false);
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register({ name: name.trim(), email: email.trim(), password });
      setSuccessMessage(mode === "login" ? "Signed in. Taking you to your dashboard…" : "Account created. Taking you to your dashboard…");
      setSuccess(true);
      window.setTimeout(onClose, 650);
    } catch (authError) {
      setError(authError.message || "We couldn’t verify those details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page-grid" aria-hidden="true">
      </div>
      <div className="auth-globe" aria-hidden="true">
        <svg viewBox="0 0 640 640" role="presentation">
          <circle cx="320" cy="320" r="270" />
          <ellipse cx="320" cy="320" rx="128" ry="270" />
          <ellipse cx="320" cy="320" rx="270" ry="108" />
          <ellipse cx="320" cy="320" rx="270" ry="205" />
          <path d="M55 320h530M320 50v540M105 185h430M105 455h430" />
        </svg>
      </div>
      <div className="auth-page-vignette" aria-hidden="true" />

      <header className="auth-page-header">
        <button className="auth-brand" onClick={onClose} type="button" aria-label="Return to DevRhythm">
          <span className="auth-brand-mark"><img src={brandLogo} width="32" height="32" alt="" /></span>
          <span>DevRhythm</span>
        </button>
        <FlowButton text="Back to dashboard" onClick={onClose} className="auth-back-flow" />
      </header>

      <section className="auth-content" aria-labelledby="auth-title">
        <div className="auth-story" aria-hidden="true">
          <p className="auth-story-kicker">DEVRHYTHM · YOUR PRACTICE, IN MOTION</p>
          <h1>Welcome to your <em>space</em><br />for focused work.</h1>
          <p className="auth-story-note">A quieter place to see how far your daily practice can go.</p>
          <AsciiGlobe />
        </div>
        <div className="auth-card">
          <div className="auth-card-heading">
            <div>
              <h2 id="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
              <p>{mode === "login" ? "Sign in to pick up where you left off." : "One account for your developer journey."}</p>
            </div>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Account access">
            <button
              className={mode === "login" ? "is-active" : ""}
              id="auth-login-tab"
              onClick={() => switchMode("login")}
              role="tab"
              aria-selected={mode === "login"}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === "register" ? "is-active" : ""}
              id="auth-register-tab"
              onClick={() => switchMode("register")}
              role="tab"
              aria-selected={mode === "register"}
              type="button"
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-feedback is-error" role="alert">{error}</div>}
            {success && (
              <div className="auth-feedback is-success" role="status">
                <CheckCircle2 size={17} aria-hidden="true" /> {successMessage}
              </div>
            )}

            {mode === "register" && (
              <FormField id="auth-name" label="Full name" icon={UserRound} onPointerMove={moveSpotlight}>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </FormField>
            )}

            <FormField id="auth-email" label="Email address" icon={Mail} onPointerMove={moveSpotlight}>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </FormField>

            <FormField id="auth-password" label="Password" icon={LockKeyhole} onPointerMove={moveSpotlight}>
              <input
                id="auth-password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </FormField>

            <FlowButton
              text={loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              className="auth-flow-submit"
              type="submit"
              disabled={loading || success}
              aria-busy={loading}
            />
          </form>

          <p className="auth-terms">
            {mode === "login" ? "New to DevRhythm?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
      <footer className="auth-page-footer">Built for the work you put in every day.</footer>
    </main>
  );
}
