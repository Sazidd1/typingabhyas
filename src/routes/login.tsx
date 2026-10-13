import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { User } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const legends = ["A", "H", "S", "K", "अ", "क", "म", "स", "⏎", "⇧", "␣", "B", "T", "न", "र"];
const colorClasses = ["c1", "c2", "c3", "c4"];

function IsoGrid({ side }: { side: "left" | "right" }) {
  const keys = useMemo(() => {
    const arr = [];
    const rows = 4,
      cols = 7;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let cls = "iso-key " + colorClasses[(r + c) % colorClasses.length];
        if (r >= 2) cls += " dim";
        if (r >= 3) cls += " faint";
        arr.push({
          id: `${side}-${r}-${c}`,
          cls,
          char: legends[Math.floor(Math.random() * legends.length)],
        });
      }
    }
    return arr;
  }, [side]);

  return (
    <div className={`iso-floor ${side}`}>
      <div className="iso-grid">
        {keys.map((k) => (
          <div key={k.id} className={k.cls}>
            {k.char}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // Validation states
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotActive, setForgotActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successView, setSuccessView] = useState(false);

  const { login, signup, resetPassword, logout, enterGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    enterGuestMode();
    navigate({ to: "/" });
  };

  const isSignup = mode === "signup";

  const handleToggleMode = () => {
    setMode(isSignup ? "login" : "signup");
    setEmailError(false);
    setPassError(false);
    setForgotActive(false);
  };

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!isValidEmail(email.trim())) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (password.length < 6) {
      setPassError(true);
      valid = false;
    } else {
      setPassError(false);
    }

    if (!valid) return;

    setIsLoading(true);

    if (isSignup) {
      const result = await signup(name, email, password);
      if (result.error) {
        setIsLoading(false);
        setForgotMsg(result.error);
        setForgotActive(true);
        setTimeout(() => setForgotActive(false), 3000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setSuccessView(true);
          setTimeout(() => {
            navigate({ to: "/" });
          }, 1200);
        }, 1300);
      }
    } else {
      const result = await login(email, password);
      if (result.error) {
        setIsLoading(false);
        setForgotMsg(result.error);
        setForgotActive(true);
        setTimeout(() => setForgotActive(false), 3000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setSuccessView(true);
          setTimeout(() => {
            navigate({ to: "/" });
          }, 1200);
        }, 1300);
      }
    }
  };

  const handleForgot = async () => {
    if (!isValidEmail(email.trim())) {
      setEmailError(true);
      return;
    }
    setEmailError(false);

    const result = await resetPassword(email);
    setForgotMsg(result.error ? result.error : "Reset link sent to your email (demo)");
    setForgotActive(true);
    setTimeout(() => {
      setForgotActive(false);
    }, 2600);
  };

  const handleLogoutTryAgain = async () => {
    await logout();
    setSuccessView(false);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .login-root {
          --ink:#122043; --muted:#6b7590; --primary:#2b52ff; --amber:#ff8a3d; --teal:#12b3a6; --success:#12b76a; --danger:#f04452; --line:#e3e8f2;
          margin:0; min-height:100vh; font-family:'Inter',sans-serif; color:var(--ink);
          background: #FFFFFF;
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden; padding:24px;
        }

        /* Prevent parent app layouts from interfering */
        .login-root { width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 1000; }

        .iso-wrap { position:fixed; inset:0; z-index:0; display:flex; justify-content:space-between; align-items:flex-end; padding:0 2vw 0; pointer-events:none; }
        .iso-floor { perspective:900px; perspective-origin:50% 0%; width:46vw; max-width:620px; height:56vh; display:flex; align-items:flex-end; justify-content:center; }
        .iso-floor.left { transform-origin:right bottom; }
        .iso-floor.right { transform-origin:left bottom; }
        .iso-grid { display:grid; grid-template-columns:repeat(7,54px); grid-auto-rows:54px; gap:9px; transform:rotateX(58deg) rotateZ(0deg); }
        .iso-floor.left .iso-grid { transform:rotateX(58deg) rotateZ(18deg) translateX(6%); }
        .iso-floor.right .iso-grid { transform:rotateX(58deg) rotateZ(-18deg) translateX(-6%); }
        .iso-key { border-radius:8px; opacity:.9; box-shadow:0 6px 0 rgba(0,0,0,.28); display:flex; align-items:center; justify-content:center; font-family:'Manrope',sans-serif; font-weight:800; font-size:15px; color:rgba(255,255,255,.85); }
        .iso-key.c1 { background:linear-gradient(160deg,#2b52ff,#1b3ad1); }
        .iso-key.c2 { background:linear-gradient(160deg,#ff8a3d,#e06e22); }
        .iso-key.c3 { background:linear-gradient(160deg,#12b3a6,#0d8a80); }
        .iso-key.c4 { background:linear-gradient(160deg,#2a3564,#1a2247); }
        .iso-key.dim { opacity:.45; }
        .iso-key.faint { opacity:.22; }

        .vignette { position:fixed; inset:0; z-index:1; pointer-events:none; }

        .card { position:relative; z-index:2; width:100%; max-width:440px; background:#fff; border-radius:16px; padding:48px 40px; box-shadow:0 12px 40px -12px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04); }
        .brand-logo { display:flex; align-items:center; justify-content:center; gap:10px; font-family:'Manrope', sans-serif; font-weight:800; font-size:26px; margin-bottom:8px; letter-spacing:-0.5px; }
        .iso-key-logo { width:36px; height:36px; border-radius:6px; background:linear-gradient(160deg,#2b52ff,#1b3ad1); box-shadow:0 4px 0 rgba(0,0,0,.28); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.85); font-size:18px; margin-top:-4px; }
        .brand-typing { color:#0a1330; }
        .brand-abhyas { color:var(--primary); }
        .card h1 { font-family:'Manrope',sans-serif; font-weight:800; font-size:28px; text-align:center; margin:0 0 32px; color:#101828; letter-spacing:-0.5px; }

        .field { margin-bottom:20px; text-align:left; }
        .field label { display:block; font-size:14px; font-weight:600; color:#344054; margin-bottom:8px; font-family:'Inter',sans-serif; }
        .input-shell { position:relative; display:flex; align-items:center; background:#fff; border-radius:10px; border:1px solid #d0d5dd; transition:all .2s ease; box-shadow:0 1px 2px rgba(16,24,40,.05); }
        .input-shell:focus-within:not(.error) { border-color:var(--primary); box-shadow:0 0 0 4px rgba(43,82,255,.12); }
        .input-shell.error { border-color:var(--danger); box-shadow:0 0 0 4px rgba(240,68,82,.1); }
        .input-shell input { flex:1; border:none; outline:none; background:transparent; padding:14px 16px; font-size:15px; font-family:'Inter',sans-serif; color:#101828; border-radius:10px; width:100%; }
        .input-shell input::placeholder { color:#98a2b3; }
        .eye-btn { background:none; border:none; cursor:pointer; padding:8px 12px 8px 4px; color:#98a2b3; display:flex; transition:color .2s; }
        .eye-btn:hover { color:#344054; }
        .err-msg { font-size:13px; color:var(--danger); margin-top:6px; height:18px; opacity:0; transition:.15s ease; text-align:left; }
        .err-msg.show { opacity:1; }

        .row-between { display:flex; justify-content:flex-end; margin:4px 0 24px; }
        .link { color:var(--primary); font-size:14px; font-weight:600; text-decoration:none; cursor:pointer; transition:color .2s; }
        .link:hover { color:#1b3ad1; }

        .submit-btn { width:100%; border:none; border-radius:10px; padding:14px; background:var(--primary); color:#fff; font-family:'Inter',sans-serif; font-weight:600; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .2s ease; box-shadow:0 1px 2px rgba(16,24,40,.05); margin-top:8px; }
        .submit-btn:hover { background:#1b3ad1; }
        .submit-btn:active { transform:scale(.98); }
        .submit-btn:disabled { opacity:.75; cursor:default; }
        .spinner { width:18px;height:18px;border-radius:50%; border:2.5px solid rgba(255,255,255,.35); border-top-color:#fff; animation:spin .7s linear infinite; display:none; }
        .submit-btn.loading .spinner { display:inline-block; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .footer-line { text-align:center; margin-top:32px; font-size:14px; color:#475467; }
        .guest-divider { display:flex; align-items:center; text-align:center; margin:20px 0 16px; }
        .guest-divider::before, .guest-divider::after { content:''; flex:1; border-bottom:1px solid #e3e8f2; }
        .guest-divider span { padding:0 12px; color:#6b7590; font-size:13px; font-weight:500; }
        .guest-btn { width:100%; border:1.5px solid #e3e8f2; border-radius:10px; padding:12px; background:#fff; color:#344054; font-family:'Inter',sans-serif; font-weight:600; font-size:14.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .2s ease; box-shadow:0 1px 2px rgba(16,24,40,.05); }
        .guest-btn:hover { background:#f8fafc; border-color:#cbd5e1; color:#101828; }
        .guest-btn:active { transform:scale(.99); }

        .success-view { display:none; text-align:center; }
        .success-view.show { display:block; animation:fadeUp .5s ease forwards; }
        .form-view.hide { display:none; }
        @keyframes fadeUp { from {opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }
        .check-wrap { width:60px;height:60px;border-radius:50%;margin:0 auto 16px;background:rgba(18,183,106,.1); display:flex;align-items:center;justify-content:center; }
        .success-view h2 { font-family:'Manrope',sans-serif; font-weight:800; font-size:19px; margin:0 0 6px; color:var(--ink); }
        .success-view p { color:var(--muted); font-size:13.5px; margin:0 0 22px; }
        .ghost-btn { border:1.5px solid var(--line); background:#fff; color:var(--ink); font-family:'Manrope',sans-serif; font-weight:700; font-size:13.5px; padding:11px 20px; border-radius:12px; cursor:pointer; }
        .ghost-btn:hover { background:#f7f8fb; }

        @media (max-width:720px){ .iso-wrap { display:none; } }
      `}</style>

      <div className="iso-wrap">
        <IsoGrid side="left" />
        <IsoGrid side="right" />
      </div>
      <div className="vignette" />

      <div className="card">
        <div className={`form-view ${successView ? "hide" : ""}`}>
          <div className="brand-logo">
            <div className="iso-key-logo">अ</div>
            <div>
              <span className="brand-typing">Typing</span>
              <span className="brand-abhyas">Abhyas</span>
            </div>
          </div>
          <h1>{isSignup ? "Create account" : "Login"}</h1>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="field">
                <label>Full name</label>
                <div className="input-shell">
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <div className={`input-shell ${emailError ? "error" : ""}`}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                    setForgotActive(false);
                  }}
                />
              </div>
              <div
                className={`err-msg ${emailError || forgotActive ? "show" : ""}`}
                style={forgotActive ? { color: "var(--success)" } : {}}
              >
                {forgotActive ? forgotMsg : "Please enter a valid email address"}
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className={`input-shell ${passError ? "error" : ""}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPassError(false);
                  }}
                />
                <button
                  className="eye-btn"
                  type="button"
                  aria-label="Show password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.6 20.6 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.6 20.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <div className={`err-msg ${passError ? "show" : ""}`}>
                Password must be at least 6 characters
              </div>
            </div>

            <div className="row-between" style={{ visibility: isSignup ? "hidden" : "visible" }}>
              <a className="link" onClick={handleForgot}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className={`submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              <span className="spinner"></span>
              <span className="btn-text">
                {isSignup ? "Sign up" : "Login"}
              </span>
            </button>
          </form>

          <div className="footer-line">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <a className="link" onClick={handleToggleMode}>
                  Login
                </a>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <a className="link" onClick={handleToggleMode}>
                  Sign up
                </a>
              </>
            )}
          </div>

          <div className="guest-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="guest-btn"
            onClick={handleContinueAsGuest}
          >
            <User className="size-4 text-muted-foreground" />
            <span>Continue as Guest</span>
          </button>
        </div>

        <div className={`success-view ${successView ? "show" : ""}`}>
          <div className="check-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#12b76a"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2>
            {isSignup ? "Account created!" : "Welcome back!"}
          </h2>
          <p>
            {isSignup
              ? "Your account has been created successfully"
              : "You have successfully logged in"}
          </p>

          <button className="ghost-btn" onClick={handleLogoutTryAgain}>
            Log out and try again
          </button>
        </div>
      </div>
    </div>
  );
}
