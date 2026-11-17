"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";
import { Avatar, Card, EmptyState, Ring, Segmented, StatusBadge } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import SubmitModal from "@/components/SubmitModal";
import { getCourse, students } from "@/data/data";
import { cx, formatDate, relativeDue, urgency } from "@/lib/utils";

export default function CourseDetails() {
  const { id } = useParams();
  const { assignments } = useApp();
  const [tab, setTab] = useState("overview");
  const [submitting, setSubmitting] = useState(null);
  const course = getCourse(id);

  if (!course) {
    return (
      <div className="page">
        <EmptyState
          icon="book"
          title="Course not found"
          text="This course doesn't exist or is no longer available."
          action={
            <Link href="/courses" className="btn btn-primary">
              Back to courses
            </Link>
          }
        />
      </div>
    );
  }

  const work = assignments.filter((a) => a.courseId === course.id);
  const classmates = students.filter((s) => s.courses.includes(course.id));
  const doneModules = course.modules.filter((m) => m.done).length;

  return (
    <div className="page">
      <Link href="/courses" className="back-link">
        <Icon name="arrowLeft" size={16} /> All courses
      </Link>

      <section className={`course-hero accent-${course.color}`}>
        <div className="course-hero-main">
          <span className="course-code on-band">{course.code}</span>
          <h1>{course.name}</h1>
          <p>{course.description}</p>
          <div className="course-hero-meta">
            <span>
              <Icon name="user" size={16} /> {course.faculty}
            </span>
            <span>
              <Icon name="clock" size={16} /> {course.schedule}
            </span>
            <span>
              <Icon name="door" size={16} /> {course.room}
            </span>
            <span>
              <Icon name="award" size={16} /> {course.credits} credits
            </span>
          </div>
        </div>
        <div className="course-hero-ring">
          <Ring value={course.progress} size={120} stroke={11} tone="onband">
            <strong className="ring-big">{course.progress}%</strong>
            <span className="ring-cap">complete</span>
          </Ring>
        </div>
      </section>

      <Segmented
        label="Course sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "overview", label: "Overview", icon: "layers" },
          { value: "assignments", label: "Assignments", icon: "clipboard", count: work.length },
          { value: "people", label: "Classmates", icon: "users", count: classmates.length },
        ]}
      />

      {tab === "overview" && (
        <div className="detail-grid">
          <Card
            title="Syllabus"
            action={
              <span className="muted small">
                {doneModules} of {course.modules.length} modules done
              </span>
            }
          >
            <ol className="modules">
              {course.modules.map((m, i) => {
                const current = !m.done && course.modules.findIndex((x) => !x.done) === i;
                return (
                  <li key={m.title} className={cx("module", m.done && "done", current && "current")}>
                    <span className="module-marker">
                      {m.done ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
                    </span>
                    <div className="grow">
                      <p className="module-title">{m.title}</p>
                      <p className="muted xsmall">
                        {m.done ? "Completed" : current ? "In progress · current module" : "Upcoming"}
                      </p>
                    </div>
                    {current && <span className="badge badge-accent">Now</span>}
                  </li>
                );
              })}
            </ol>
          </Card>

          <div className="stack">
            <Card title="Course information">
              <dl className="info-list single">
                <div>
                  <dt>Course code</dt>
                  <dd>{course.code}</dd>
                </div>
                <div>
                  <dt>Faculty</dt>
                  <dd>{course.faculty}</dd>
                </div>
                <div>
                  <dt>Credits</dt>
                  <dd>{course.credits}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{course.schedule}</dd>
                </div>
                <div>
                  <dt>Room</dt>
                  <dd>{course.room}</dd>
                </div>
                <div>
                  <dt>Enrolled</dt>
                  <dd>{course.students} students</dd>
                </div>
              </dl>
            </Card>
            <Card title="Instructor">
              <div className="instructor">
                <Avatar name={course.faculty.replace(/^(Dr\.|Prof\.)\s/, "")} size={48} tone={course.color} />
                <div>
                  <strong>{course.faculty}</strong>
                  <span className="muted small">Department faculty</span>
                </div>
              </div>
              <a href="mailto:faculty@campus.edu" className="btn btn-secondary btn-block mt-16">
                <Icon name="mail" size={16} /> Contact instructor
              </a>
            </Card>
          </div>
        </div>
      )}

      {tab === "assignments" && (
        <Card padded={false}>
          {work.length === 0 ? (
            <EmptyState icon="clipboard" title="No assignments yet" text="New work for this course will appear here." />
          ) : (
            <ul className="assign-list">
              {work.map((a) => (
                <li key={a.id} className="assign-item">
                  <span className={`assign-icon u-${a.state === "Submitted" ? "success" : urgency(a.dueDate)}`}>
                    <Icon name={a.state === "Submitted" ? "checkCircle" : "file"} size={18} />
                  </span>
                  <div className="grow min0">
                    <p className="strong">{a.title}</p>
                    <p className="muted small">
                      Due {formatDate(a.dueDate)} · {a.points} pts
                      {a.state !== "Submitted" && (
                        <span className={`text-${urgency(a.dueDate)}`}> · {relativeDue(a.dueDate)}</span>
                      )}
                    </p>
                  </div>
                  <StatusBadge status={a.state} />
                  {a.state !== "Submitted" && (
                    <button className="btn btn-primary btn-sm" onClick={() => setSubmitting(a)}>
                      Submit
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "people" && (
        <div className="people-grid">
          {classmates.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`} className="person">
              <Avatar name={s.name} size={44} />
              <div className="min0">
                <strong className="truncate">{s.name}</strong>
                <span className="muted small">
                  {s.department} · {s.year}
                </span>
              </div>
              <Icon name="chevronRight" size={18} className="muted" />
            </Link>
          ))}
        </div>
      )}

      {submitting && <SubmitModal assignment={submitting} onClose={() => setSubmitting(null)} />}
    </div>
  );
}
