"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { Avatar, PageHeader, Switch } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { currentStudent } from "@/data/data";
import { cx } from "@/lib/utils";

const TABS = [
  { id: "account", label: "Account", icon: "user", desc: "Your personal information" },
  { id: "notifications", label: "Notifications", icon: "bell", desc: "What we tell you about" },
  { id: "appearance", label: "Appearance", icon: "palette", desc: "Make it feel like yours" },
  { id: "security", label: "Security", icon: "lock", desc: "Password & sign-in" },
];

const ACCENTS = [
  { id: "teal", label: "Sage teal" },
  { id: "indigo", label: "Indigo" },
  { id: "violet", label: "Violet" },
  { id: "sky", label: "Ocean" },
  { id: "rose", label: "Rose" },
];

const INITIAL = {
  name: currentStudent.name,
  email: currentStudent.email,
  phone: currentStudent.phone,
  bio: currentStudent.bio,
  notif: { deadlines: true, grades: true, announcements: true, weekly: false },
};

export default function SettingsPage() {
  const { accent, setAccent, toast, resetDemo } = useApp();
  const [tab, setTab] = useState("account");
  const [form, setForm] = useState(INITIAL);
  const [saved, setSaved] = useState(INITIAL);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setNotif = (k, v) => setForm((f) => ({ ...f, notif: { ...f.notif, [k]: v } }));

  function save() {
    setSaved(form);
    toast("Your changes have been saved");
  }

  function changePassword(e) {
    e.preventDefault();
    if (!pw.current || !pw.next) return setPwError("Please fill in all password fields.");
    if (pw.next.length < 8) return setPwError("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm) return setPwError("New passwords don't match.");
    setPwError("");
    setPw({ current: "", next: "", confirm: "" });
    toast("Password updated");
  }

  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw.next)).length);

  return (
    <div className="page">
      <PageHeader title="Settings" subtitle="Manage your account, notifications and preferences." />

      <div className="settings">
        <nav className="settings-nav" aria-label="Settings sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={cx("settings-tab", tab === t.id && "active")}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <Icon name={t.icon} size={18} />
              <span>
                <strong>{t.label}</strong>
                <small>{t.desc}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="settings-panel card">
          {tab === "account" && (
            <>
              <div className="panel-head">
                <h2>Account</h2>
                <p>This information appears on your profile and to your instructors.</p>
              </div>
              <div className="avatar-edit">
                <Avatar name={form.name || "?"} size={64} />
                <div>
                  <strong>Profile photo</strong>
                  <p className="muted small">Your initials are shown until you upload a photo.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => toast("Photo upload is not available in the demo", "info")}>
                  <Icon name="upload" size={15} /> Upload
                </button>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label className="label" htmlFor="name">Full name</label>
                  <input id="name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="roll">Roll number</label>
                  <input id="roll" className="input" value={currentStudent.rollNo} disabled />
                  <p className="hint">Managed by your college — can’t be changed.</p>
                </div>
                <div className="field">
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="phone">Phone</label>
                  <input id="phone" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="field span-all">
                  <label className="label" htmlFor="bio">
                    Bio <span className="optional">{form.bio.length}/200</span>
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    maxLength={200}
                    className="input"
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {tab === "notifications" && (
            <>
              <div className="panel-head">
                <h2>Notifications</h2>
                <p>Choose what you want to hear about. We’ll never spam you.</p>
              </div>
              <ul className="setting-list">
                {[
                  ["deadlines", "Deadline reminders", "Get reminded 24 hours before an assignment is due."],
                  ["grades", "Grades & feedback", "Know as soon as your work has been graded."],
                  ["announcements", "Course announcements", "New notes, schedule changes and updates from faculty."],
                  ["weekly", "Weekly summary email", "A short recap of your week every Sunday evening."],
                ].map(([k, t, d]) => (
                  <li key={k} className="setting-row">
                    <div>
                      <label htmlFor={`n-${k}`} className="strong">{t}</label>
                      <p className="muted small">{d}</p>
                    </div>
                    <Switch id={`n-${k}`} label={t} checked={form.notif[k]} onChange={(v) => setNotif(k, v)} />
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === "appearance" && (
            <>
              <div className="panel-head">
                <h2>Appearance</h2>
                <p>Pick an accent colour — it applies instantly across the whole portal.</p>
              </div>
              <div className="accent-grid" role="radiogroup" aria-label="Accent colour">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    role="radio"
                    aria-checked={accent === a.id}
                    className={cx("accent-option", accent === a.id && "active")}
                    onClick={() => {
                      setAccent(a.id);
                      toast(`Accent changed to ${a.label}`);
                    }}
                  >
                    <span className={`swatch swatch-${a.id}`}>
                      {accent === a.id && <Icon name="check" size={16} strokeWidth={3} />}
                    </span>
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="callout callout-accent mt-16">
                <Icon name="sparkles" size={17} /> Your accent colour is saved on this device.
              </div>
              <div className="setting-row mt-16">
                <div>
                  <strong>Reset demo data</strong>
                  <p className="muted small">Clear the assignments you’ve submitted in this demo.</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    resetDemo();
                    toast("Demo data reset");
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {tab === "security" && (
            <form onSubmit={changePassword}>
              <div className="panel-head">
                <h2>Change password</h2>
                <p>Use at least 8 characters with a mix of letters, numbers and symbols.</p>
              </div>
              <div className="form-grid one">
                <div className="field">
                  <label className="label" htmlFor="pw-c">Current password</label>
                  <input id="pw-c" type="password" className="input" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="pw-n">New password</label>
                  <input id="pw-n" type="password" className="input" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                  {pw.next && (
                    <div className="strength">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map((i) => (
                          <span key={i} className={cx(i <= strength && `s-${strength}`)} />
                        ))}
                      </div>
                      <span>{["Too weak", "Weak", "Fair", "Good", "Strong"][strength]}</span>
                    </div>
                  )}
                </div>
                <div className="field">
                  <label className="label" htmlFor="pw-r">Confirm new password</label>
                  <input id="pw-r" type="password" className="input" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
                </div>
                {pwError && (
                  <p className="field-error">
                    <Icon name="alert" size={14} /> {pwError}
                  </p>
                )}
                <div>
                  <button type="submit" className="btn btn-primary">
                    <Icon name="lock" size={16} /> Update password
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className={cx("savebar", dirty && "show")} aria-hidden={!dirty}>
        <span>
          <Icon name="alert" size={17} /> You have unsaved changes
        </span>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => setForm(saved)} tabIndex={dirty ? 0 : -1}>
            Discard
          </button>
          <button className="btn btn-primary btn-sm" onClick={save} tabIndex={dirty ? 0 : -1}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
