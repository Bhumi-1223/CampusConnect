"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { Card, Progress, Ring, Badge } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import SubmitModal from "@/components/SubmitModal";
import { courses, currentStudent, recentActivities, todaySchedule, students, getCourse } from "@/data/data";
import { attendanceTone, cx, daysUntil, greeting, relativeDue, urgency } from "@/lib/utils";

const ACTIVITY_ICON = {
  submit: { icon: "upload", tone: "teal" },
  grade: { icon: "award", tone: "amber" },
  attend: { icon: "checkCircle", tone: "indigo" },
  course: { icon: "layers", tone: "violet" },
};

export default function Dashboard() {
  const { assignments } = useApp();
  const [submitting, setSubmitting] = useState(null);

  const me = students.find((s) => s.id === currentStudent.id);
  const open = assignments.filter((a) => a.state !== "Submitted");
  const done = assignments.filter((a) => a.state === "Submitted");
  const upcoming = [...open].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const dueSoon = open.filter((a) => daysUntil(a.dueDate) <= 3).length;
  const credits = courses.reduce((s, c) => s + c.credits, 0);
  const avgProgress = Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length);
  // Computed in the browser so a pre-rendered page never shows a stale date or greeting
  const [today, setToday] = useState("");
  const [hello, setHello] = useState("Welcome back");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    setHello(greeting());
  }, []);
  const firstName = currentStudent.name.split(" ")[0];

  const stats = [
    {
      label: "Total courses",
      value: courses.length,
      icon: "book",
      tone: "teal",
      foot: `${credits} credits this semester`,
      href: "/courses",
    },
    {
      label: "Pending assignments",
      value: open.length,
      icon: "clock",
      tone: "amber",
      foot: dueSoon ? `${dueSoon} due in the next 3 days` : "Nothing due soon",
      footTone: dueSoon ? "warning" : undefined,
      href: "/assignments",
    },
    {
      label: "Completed assignments",
      value: done.length,
      icon: "checkCircle",
      tone: "indigo",
      foot: `${Math.round((done.length / assignments.length) * 100)}% of all work submitted`,
      href: "/assignments",
    },
  ];

  return (
    <div className="page">
      <header className="welcome">
        <div>
          <p className="welcome-date">
            <Icon name="calendar" size={15} /> {today || " "}
          </p>
          <h1 className="page-title">
            {hello}, {firstName}
          </h1>
          <p className="page-subtitle">
            {dueSoon > 0 ? (
              <>
                You have <strong>{dueSoon} assignment{dueSoon > 1 ? "s" : ""}</strong> due in the next 3 days. Let&apos;s
                get ahead of them.
              </>
            ) : (
              "You're all caught up. Great work!"
            )}
          </p>
        </div>
        <div className="page-actions">
          <Link href="/courses" className="btn btn-secondary">
            <Icon name="book" size={17} /> My courses
          </Link>
          <Link href="/assignments" className="btn btn-primary">
            <Icon name="upload" size={17} /> Submit work
          </Link>
        </div>
      </header>

      <div className="stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="stat">
            <div className="stat-top">
              <span className={`stat-icon tone-${s.tone}`}>
                <Icon name={s.icon} size={20} />
              </span>
              <Icon name="arrowRight" size={16} className="stat-arrow" />
            </div>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p className={cx("stat-foot", s.footTone && `text-${s.footTone}`)}>{s.foot}</p>
          </Link>
        ))}
        <Link href="/profile" className="stat stat-ring">
          <div>
            <div className="stat-top">
              <span className="stat-icon tone-rose">
                <Icon name="activity" size={20} />
              </span>
            </div>
            <p className="stat-label">Attendance</p>
            <p className="stat-value">{me.attendance}%</p>
            <p className={`stat-foot text-${attendanceTone(me.attendance)}`}>Above 75% requirement</p>
          </div>
          <Ring value={me.attendance} size={78} stroke={8} tone={attendanceTone(me.attendance)}>
            <Icon name="check" size={22} strokeWidth={2.6} />
          </Ring>
        </Link>
      </div>

      <div className="dash-grid">
        <Card
          title="Upcoming deadlines"
          className="span-2"
          action={
            <Link href="/assignments" className="link-btn">
              View all <Icon name="arrowRight" size={15} />
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <p className="muted">No upcoming deadlines 🎉</p>
          ) : (
            <ul className="deadlines">
              {upcoming.slice(0, 4).map((a) => {
                const course = getCourse(a.courseId);
                const [, m, d] = a.dueDate.split("-");
                const month = new Date(2000, Number(m) - 1, 1).toLocaleString("en-GB", { month: "short" });
                return (
                  <li key={a.id} className="deadline">
                    <div className={`date-tile u-${urgency(a.dueDate)}`}>
                      <span>{month}</span>
                      <strong>{Number(d)}</strong>
                    </div>
                    <div className="deadline-body">
                      <p className="deadline-title">{a.title}</p>
                      <p className="deadline-meta">
                        <span className={`dot-sm tone-${course.color}`} />
                        {course.name}
                      </p>
                    </div>
                    <Badge tone={urgency(a.dueDate)} className="hide-sm">
                      {relativeDue(a.dueDate)}
                    </Badge>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSubmitting(a)}>
                      Submit
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Today's classes" action={<Badge tone="accent">{todaySchedule.length} classes</Badge>}>
          <ol className="schedule">
            {todaySchedule.map((s) => {
              const c = getCourse(s.courseId);
              return (
                <li key={s.id} className="slot">
                  <span className="slot-time">{s.time}</span>
                  <div className={`slot-card tone-border-${c.color}`}>
                    <p className="slot-title">{c.name}</p>
                    <p className="slot-meta">
                      {s.type} · {c.room} · until {s.end}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card
          title="Course progress"
          className="span-2"
          action={
            <span className="muted small">
              Average <strong className="text-ink">{avgProgress}%</strong>
            </span>
          }
        >
          <ul className="course-progress">
            {courses.map((c) => (
              <li key={c.id}>
                <Link href={`/courses/${c.id}`} className="cp-row">
                  <span className={`cp-code tone-${c.color}`}>{c.code.slice(0, 2)}</span>
                  <div className="cp-body">
                    <div className="cp-top">
                      <p className="cp-name">{c.name}</p>
                      <span className="cp-pct">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} size="sm" label={`${c.name} progress`} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent activity">
          <ol className="timeline">
            {recentActivities.map((a) => {
              const meta = ACTIVITY_ICON[a.type];
              return (
                <li key={a.id} className="tl-item">
                  <span className={`tl-icon tone-${meta.tone}`}>
                    <Icon name={meta.icon} size={15} />
                  </span>
                  <div>
                    <p className="tl-text">
                      {a.text} <strong>{a.target}</strong>
                    </p>
                    <span className="tl-time">{a.time}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      {submitting && <SubmitModal assignment={submitting} onClose={() => setSubmitting(null)} />}
    </div>
  );
}
