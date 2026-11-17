"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";
import { cx } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "That doesn't look like a valid email.";
    if (!password) e.password = "Please enter your password.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    // Demo only — no real authentication.
    setTimeout(() => router.push("/dashboard"), 650);
  }

  function fillDemo() {
    setEmail("aarav.sharma@campus.edu");
    setPassword("student123");
    setErrors({});
  }

  return (
    <div className="auth">
      <aside className="auth-brand">
        <Link href="/" className="logo logo-light">
          <span className="logo-mark">
            <Icon name="cap" size={20} strokeWidth={2.1} />
          </span>
          <span className="logo-text">
            Campus<b>Connect</b>
          </span>
        </Link>

        <div className="auth-brand-body">
          <h2>Everything for your semester, in one calm place.</h2>
          <ul className="auth-points">
            {[
              ["dashboard", "A dashboard that shows what matters today"],
              ["clock", "Clear, colour-coded deadlines"],
              ["activity", "Attendance and progress at a glance"],
            ].map(([icon, text]) => (
              <li key={text}>
                <span>
                  <Icon name={icon} size={17} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <figure className="auth-quote">
          <blockquote>
            “I finally stopped missing deadlines. Everything I need is right there the moment I log in.”
          </blockquote>
          <figcaption>
            <span className="avatar tone-amber" style={{ width: 36, height: 36, fontSize: 13 }}>
              PP
            </span>
            <span>
              <strong>Priya Patel</strong>
              <span>IT, 2nd Year</span>
            </span>
          </figcaption>
        </figure>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link href="/" className="back-link">
            <Icon name="arrowLeft" size={16} /> Back to home
          </Link>
          <h1>Welcome back</h1>
          <p className="muted">Log in to your student portal to continue.</p>

          <button type="button" className="demo-hint" onClick={fillDemo}>
            <Icon name="sparkles" size={16} />
            <span>
              <strong>Demo account</strong> — click to fill in sample credentials
            </span>
          </button>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email" className="label">
                College email
              </label>
              <div className={cx("input-icon", errors.email && "invalid")}>
                <Icon name="mail" size={18} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@campus.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-err" : undefined}
                />
              </div>
              {errors.email && (
                <p className="field-error" id="email-err">
                  <Icon name="alert" size={14} /> {errors.email}
                </p>
              )}
            </div>

            <div className="field">
              <div className="label-row">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <a href="#" className="link small" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className={cx("input-icon", errors.password && "invalid")}>
                <Icon name="lock" size={18} />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  className="input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "pw-err" : undefined}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  <Icon name={show ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
              {errors.password && (
                <p className="field-error" id="pw-err">
                  <Icon name="alert" size={14} /> {errors.password}
                </p>
              )}
            </div>

            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="checkbox-box">
                <Icon name="check" size={13} strokeWidth={3} />
              </span>
              Keep me signed in
            </label>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
              {busy ? <span className="spinner" /> : null}
              {busy ? "Signing you in…" : "Log in"}
            </button>
          </form>

          <p className="auth-foot">
            New to CampusConnect? <a href="#" className="link" onClick={(e) => e.preventDefault()}>Contact your admin</a>
          </p>
        </div>
      </main>
    </div>
  );
}
