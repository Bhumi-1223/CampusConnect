"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Icon from "@/components/Icon";
import { Avatar, Card, EmptyState, Progress, Ring, StatusBadge } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { courses, students, getCourse } from "@/data/data";
import { attendanceTone, formatDate } from "@/lib/utils";

const TOTAL_CLASSES = 120;

export default function StudentDetails() {
  const { id } = useParams();
  const { assignments } = useApp();
  const student = students.find((s) => s.id === Number(id));

  if (!student) {
    return (
      <div className="page">
        <EmptyState
          icon="users"
          title="Student not found"
          text="This profile doesn't exist or may have been removed."
          action={
            <Link href="/students" className="btn btn-primary">
              Back to students
            </Link>
          }
        />
      </div>
    );
  }

  const enrolled = courses.filter((c) => student.courses.includes(c.id));
  const work = assignments.filter((a) => student.courses.includes(a.courseId));
  const submitted = work.filter((a) => a.state === "Submitted").length;
  const attended = Math.round((student.attendance / 100) * TOTAL_CLASSES);
  const tone = attendanceTone(student.attendance);

  return (
    <div className="page">
      <Link href="/students" className="back-link">
        <Icon name="arrowLeft" size={16} /> All students
      </Link>

      <section className="profile-hero card">
        <div className="profile-cover" />
        <div className="profile-hero-body">
          <Avatar name={student.name} size={92} className="profile-avatar" />
          <div className="profile-id">
            <h1>{student.name}</h1>
            <p>
              {student.department} · {student.year}
            </p>
            <div className="meta-inline">
              <span>
                <Icon name="hash" size={15} /> {student.rollNo}
              </span>
              <span>
                <Icon name="mail" size={15} /> {student.email}
              </span>
              <span>
                <Icon name="phone" size={15} /> {student.phone}
              </span>
            </div>
          </div>
          <div className="profile-cta">
            <a href={`mailto:${student.email}`} className="btn btn-primary">
              <Icon name="mail" size={17} /> Send email
            </a>
          </div>
        </div>
      </section>

      <div className="mini-stats">
        <div className="mini-stat">
          <span className="stat-icon tone-teal">
            <Icon name="book" size={18} />
          </span>
          <div>
            <strong>{enrolled.length}</strong>
            <span>Enrolled courses</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="stat-icon tone-indigo">
            <Icon name="checkCircle" size={18} />
          </span>
          <div>
            <strong>
              {submitted}/{work.length}
            </strong>
            <span>Assignments submitted</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="stat-icon tone-amber">
            <Icon name="star" size={18} />
          </span>
          <div>
            <strong>{student.cgpa.toFixed(1)}</strong>
            <span>Current CGPA</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <Card title="Profile information">
            <dl className="info-list">
              <div>
                <dt>Full name</dt>
                <dd>{student.name}</dd>
              </div>
              <div>
                <dt>Roll number</dt>
                <dd>{student.rollNo}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{student.department}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{student.year}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{student.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{student.phone}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Enrolled courses" action={<span className="muted small">{enrolled.length} courses</span>}>
            <ul className="course-list">
              {enrolled.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.id}`} className="course-row">
                    <span className={`cp-code tone-${c.color}`}>{c.code.slice(0, 2)}</span>
                    <div className="min0 grow">
                      <p className="strong truncate">{c.name}</p>
                      <p className="muted small">
                        {c.code} · {c.faculty}
                      </p>
                    </div>
                    <div className="course-row-progress hide-xs">
                      <Progress value={c.progress} size="sm" label={`${c.name} progress`} />
                      <span>{c.progress}%</span>
                    </div>
                    <Icon name="chevronRight" size={18} className="muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Assignment status" padded={false}>
            {work.length === 0 ? (
              <p className="muted pad">No assignments yet.</p>
            ) : (
              <table className="table compact">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {work.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Assignment">
                        <strong>{a.title}</strong>
                        <span className="cell-sub">{getCourse(a.courseId).name}</span>
                      </td>
                      <td data-label="Due">{formatDate(a.dueDate, { day: "numeric", month: "short" })}</td>
                      <td data-label="Status">
                        <StatusBadge status={a.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div className="stack">
          <Card title="Attendance">
            <div className="att-hero">
              <Ring value={student.attendance} size={132} stroke={12} tone={tone}>
                <strong className="ring-big">{student.attendance}%</strong>
                <span className="ring-cap">overall</span>
              </Ring>
              <ul className="att-legend">
                <li>
                  <span className="dot-sm bg-success" /> Present <strong>{attended}</strong>
                </li>
                <li>
                  <span className="dot-sm bg-danger" /> Absent <strong>{TOTAL_CLASSES - attended}</strong>
                </li>
                <li>
                  <span className="dot-sm bg-muted" /> Total <strong>{TOTAL_CLASSES}</strong>
                </li>
              </ul>
            </div>
            <div className={`callout callout-${tone}`}>
              <Icon name={tone === "danger" ? "alert" : "checkCircle"} size={17} />
              {tone === "danger"
                ? "Below the 75% minimum — attendance needs attention."
                : tone === "warning"
                ? "Close to the 75% minimum. Keep attending regularly."
                : "Comfortably above the 75% requirement."}
            </div>
          </Card>

          <Card title="Skills">
            <div className="skills">
              {student.skills.map((k) => (
                <span key={k} className="skill skill-lg">
                  {k}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
