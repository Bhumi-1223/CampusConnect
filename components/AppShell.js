"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { Avatar } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { currentStudent, notifications } from "@/data/data";
import { cx } from "@/lib/utils";

const NAV = [
  {
    section: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    section: "Academics",
    items: [
      { href: "/courses", label: "Courses", icon: "book" },
      { href: "/assignments", label: "Assignments", icon: "clipboard", badge: "pending" },
      { href: "/students", label: "Students", icon: "users" },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/profile", label: "My Profile", icon: "user" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const TITLES = {
  dashboard: "Dashboard",
  courses: "Courses",
  assignments: "Assignments",
  students: "Students",
  profile: "My Profile",
  settings: "Settings",
};

function Logo() {
  return (
    <Link href="/dashboard" className="logo" aria-label="CampusConnect home">
      <span className="logo-mark">
        <Icon name="cap" size={20} strokeWidth={2.1} />
      </span>
      <span className="logo-text">
        Campus<b>Connect</b>
      </span>
    </Link>
  );
}

function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
    const esc = (e) => e.key === "Escape" && onOutside();
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [ref, onOutside, active]);
}

function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { assignments } = useApp();
  const pending = assignments.filter((a) => a.state !== "Submitted").length;

  return (
    <>
      <div className={cx("scrim", open && "show")} onClick={onClose} aria-hidden="true" />
      <aside className={cx("sidebar", open && "open")} aria-label="Main navigation">
        <div className="sidebar-top">
          <Logo />
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <Icon name="x" size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.section} className="nav-group">
              <p className="nav-section">{group.section}</p>
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx("nav-link", active && "active")}
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                  >
                    <Icon name={item.icon} size={19} />
                    <span>{item.label}</span>
                    {item.badge === "pending" && pending > 0 && (
                      <span className="nav-badge">{pending}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon">
            <Icon name="target" size={18} />
          </div>
          <p className="promo-title">Semester 5 · Week 11</p>
          <p className="promo-text">You&apos;re 62% through the term. Keep it up!</p>
          <div className="progress progress-sm on-accent">
            <div className="progress-fill" style={{ width: "62%" }} />
          </div>
        </div>

        <div className="sidebar-user">
          <Link href="/profile" className="sidebar-user-link" onClick={onClose}>
            <Avatar name={currentStudent.name} size={38} />
            <span className="sidebar-user-text">
              <strong>{currentStudent.name}</strong>
              <span>{currentStudent.rollNo}</span>
            </span>
          </Link>
          <Link href="/login" className="icon-btn logout-btn" aria-label="Log out" title="Log out">
            <Icon name="logout" size={18} />
          </Link>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [unread, setUnread] = useState(notifications.filter((n) => n.unread).length);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  useClickOutside(notifRef, () => setNotifOpen(false), notifOpen);
  useClickOutside(userRef, () => setUserOpen(false), userOpen);

  const segments = pathname.split("/").filter(Boolean);
  const section = TITLES[segments[0]] || "Dashboard";

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/students?q=${encodeURIComponent(q)}` : "/students");
  }

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" size={20} />
      </button>

      <nav className="crumbs" aria-label="Breadcrumb">
        <span className="crumb-root">CampusConnect</span>
        <Icon name="chevronRight" size={14} />
        <span className="crumb-current">{section}</span>
        {segments[1] && (
          <>
            <Icon name="chevronRight" size={14} />
            <span className="crumb-current">Details</span>
          </>
        )}
      </nav>

      <form className="topbar-search" onSubmit={onSearch} role="search">
        <Icon name="search" size={17} />
        <input
          type="search"
          placeholder="Search students…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search students"
        />
        <kbd>Enter</kbd>
      </form>

      <div className="topbar-actions">
        <div className="dropdown-wrap" ref={notifRef}>
          <button
            className="icon-btn has-dot"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Icon name="bell" size={19} />
            {unread > 0 && <span className="dot" />}
          </button>
          {notifOpen && (
            <div className="dropdown dropdown-wide">
              <div className="dropdown-head">
                <strong>Notifications</strong>
                {unread > 0 && (
                  <button className="link-btn" onClick={() => setUnread(0)}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.map((n, i) => (
                <div key={n.id} className={cx("notif", unread > 0 && n.unread && "unread")}>
                  <span className="notif-dot" />
                  <div>
                    <p>{n.text}</p>
                    <span>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrap" ref={userRef}>
          <button
            className="user-chip"
            onClick={() => setUserOpen((v) => !v)}
            aria-expanded={userOpen}
            aria-label="Account menu"
          >
            <Avatar name={currentStudent.name} size={34} />
            <span className="user-chip-text">
              <strong>{currentStudent.name.split(" ")[0]}</strong>
              <span>Student</span>
            </span>
            <Icon name="chevronDown" size={16} />
          </button>
          {userOpen && (
            <div className="dropdown">
              <div className="dropdown-user">
                <Avatar name={currentStudent.name} size={40} />
                <div>
                  <strong>{currentStudent.name}</strong>
                  <span>{currentStudent.email}</span>
                </div>
              </div>
              <Link href="/profile" className="dropdown-item" onClick={() => setUserOpen(false)}>
                <Icon name="user" size={17} /> My profile
              </Link>
              <Link href="/settings" className="dropdown-item" onClick={() => setUserOpen(false)}>
                <Icon name="settings" size={17} /> Settings
              </Link>
              <div className="dropdown-sep" />
              <Link href="/login" className="dropdown-item danger">
                <Icon name="logout" size={17} /> Log out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="shell-main">
        <Topbar onMenu={() => setOpen(true)} />
        <main id="main" className="content" key={pathname}>
          {children}
        </main>
      </div>
    </div>
  );
}
