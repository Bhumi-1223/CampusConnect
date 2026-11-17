import Link from "next/link";
import Icon from "@/components/Icon";

const FEATURES = [
  { icon: "dashboard", title: "One clear dashboard", text: "Courses, deadlines, attendance and activity — everything important on a single calm screen." },
  { icon: "clipboard", title: "Never miss a deadline", text: "Smart due-date labels highlight what's urgent, so you always know what to do next." },
  { icon: "book", title: "Course progress", text: "Follow every module, faculty and credit with progress you can actually see." },
  { icon: "users", title: "Find classmates fast", text: "Search and filter students by department, then open a full profile in one click." },
  { icon: "activity", title: "Attendance at a glance", text: "Colour-coded attendance keeps you comfortably above the minimum requirement." },
  { icon: "shield", title: "Private & secure", text: "Your academic data stays yours, with sensible privacy settings built in." },
];

const BARS = [42, 68, 55, 80, 62, 90, 74];

export default function Home() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <Icon name="cap" size={20} strokeWidth={2.1} />
          </span>
          <span className="logo-text">
            Campus<b>Connect</b>
          </span>
        </Link>
        <nav className="landing-links" aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="landing-cta">
          <Link href="/login" className="btn btn-ghost hide-xs">
            Log in
          </Link>
          <Link href="/login" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Student Management Portal
          </span>
          <h1>
            Your whole campus life,
            <br />
            <span className="hero-accent">calmly organised.</span>
          </h1>
          <p className="hero-sub">
            CampusConnect brings your courses, assignments, attendance and classmates together in one
            beautifully simple place — so you can focus on learning, not on searching.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-primary btn-lg">
              Get started — it&apos;s free <Icon name="arrowRight" size={18} />
            </Link>
            <Link href="/dashboard" className="btn btn-secondary btn-lg">
              View live demo
            </Link>
          </div>
          <div className="hero-trust">
            <div className="avatar-stack" aria-hidden="true">
              {["AS", "PP", "SI", "RV"].map((i, n) => (
                <span key={i} className={`avatar tone-${["teal", "indigo", "amber", "rose"][n]}`}>
                  {i}
                </span>
              ))}
            </div>
            <p>
              <strong>2,400+ students</strong> already stay on top of their semester
            </p>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mock">
            <div className="mock-bar">
              <span />
              <span />
              <span />
              <div className="mock-url">campusconnect.edu/dashboard</div>
            </div>
            <div className="mock-body">
              <div className="mock-side">
                <div className="mock-logo" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`mock-nav ${i === 1 ? "active" : ""}`} />
                ))}
              </div>
              <div className="mock-main">
                <div className="mock-hello">
                  <div className="mock-line w40 strong" />
                  <div className="mock-line w60" />
                </div>
                <div className="mock-stats">
                  {["teal", "amber", "indigo", "rose"].map((t) => (
                    <div key={t} className="mock-stat">
                      <span className={`mock-chip tone-${t}`} />
                      <div className="mock-line w50 strong" />
                      <div className="mock-line w70" />
                    </div>
                  ))}
                </div>
                <div className="mock-row">
                  <div className="mock-card">
                    <div className="mock-line w40 strong" />
                    <div className="mock-chart">
                      {BARS.map((h, i) => (
                        <span key={i} style={{ height: `${h}%` }} className={i === 5 ? "hi" : ""} />
                      ))}
                    </div>
                  </div>
                  <div className="mock-card">
                    <div className="mock-line w50 strong" />
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="mock-item">
                        <span className={`mock-dot tone-${["rose", "amber", "teal"][i]}`} />
                        <div className="mock-line w70" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="float-card float-a">
            <span className="float-icon success">
              <Icon name="check" size={16} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Assignment submitted</strong>
              <span>ER Diagram · 2 min ago</span>
            </div>
          </div>
          <div className="float-card float-b">
            <div className="mini-ring">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" className="ring-track" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="ring-value stroke-accent"
                  strokeWidth="4"
                  strokeDasharray="94.2"
                  strokeDashoffset="7.5"
                  transform="rotate(-90 18 18)"
                />
              </svg>
            </div>
            <div>
              <strong>92% attendance</strong>
              <span>Above requirement</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-head">
          <span className="eyebrow">Features</span>
          <h2>Everything a student needs. Nothing they don&apos;t.</h2>
          <p>Designed around the way students actually work — fast to scan, easy to act on.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature">
              <span className="feature-icon">
                <Icon name={f.icon} size={22} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="how">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Up and running in under a minute</h2>
        </div>
        <ol className="steps">
          {[
            ["Sign in", "Use your college email to access your personal portal."],
            ["See your semester", "Courses, deadlines and attendance load instantly on your dashboard."],
            ["Stay ahead", "Submit work, track progress and connect with classmates."],
          ].map(([t, d], i) => (
            <li key={t} className="step">
              <span className="step-num">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <div>
          <h2>Ready to take control of your semester?</h2>
          <p>Join thousands of students who plan smarter with CampusConnect.</p>
        </div>
        <Link href="/login" className="btn btn-light btn-lg">
          Get started <Icon name="arrowRight" size={18} />
        </Link>
      </section>

      <footer className="landing-foot">
        <span>© {new Date().getFullYear()} CampusConnect. Built for students.</span>
        <div>
          <a href="#features">Features</a>
          <Link href="/login">Log in</Link>
        </div>
      </footer>
    </div>
  );
}
