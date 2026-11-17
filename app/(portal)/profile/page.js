"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { Avatar, Card, Progress, Ring } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { courses, currentStudent, students } from "@/data/data";
import { attendanceTone } from "@/lib/utils";

export default function ProfilePage() {
  const { assignments } = useApp();
  const me = students.find((s) => s.id === currentStudent.id);
  const enrolled = courses.filter((c) => me.courses.includes(c.id));
  const submitted = assignments.filter((a) => a.state === "Submitted").length;
  const credits = enrolled.reduce((s, c) => s + c.credits, 0);

  return (
    <div className="page">
      <section className="profile-hero card">
        <div className="profile-cover" />
        <div className="profile-hero-body">
          <Avatar name={currentStudent.name} size={92} className="profile-avatar" />
          <div className="profile-id">
            <h1>{currentStudent.name}</h1>
            <p>
              {currentStudent.department} · {currentStudent.year} · {currentStudent.semester}
            </p>
            <div className="meta-inline">
              <span>
                <Icon name="hash" size={15} /> {currentStudent.rollNo}
              </span>
              <span>
                <Icon name="mapPin" size={15} /> {currentStudent.location}
              </span>
            </div>
          </div>
          <div className="profile-cta">
            <Link href="/settings" className="btn btn-secondary">
              <Icon name="edit" size={16} /> Edit profile
            </Link>
          </div>
        </div>
      </section>

      <div className="mini-stats four">
        <div className="mini-stat">
          <span className="stat-icon tone-amber">
            <Icon name="star" size={18} />
          </span>
          <div>
            <strong>{currentStudent.cgpa}</strong>
            <span>CGPA</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="stat-icon tone-teal">
            <Icon name="book" size={18} />
          </span>
          <div>
            <strong>{enrolled.length}</strong>
            <span>Courses</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="stat-icon tone-indigo">
            <Icon name="award" size={18} />
          </span>
          <div>
            <strong>{credits}</strong>
            <span>Credits</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="stat-icon tone-rose">
            <Icon name="checkCircle" size={18} />
          </span>
          <div>
            <strong>{submitted}</strong>
            <span>Submitted</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <Card title="About">
            <p className="lead">{currentStudent.bio}</p>
          </Card>

          <Card
            title="Personal details"
            action={
              <Link href="/settings" className="link-btn">
                <Icon name="edit" size={14} /> Edit
              </Link>
            }
          >
            <dl className="info-list">
              <div>
                <dt>Full name</dt>
                <dd>{currentStudent.name}</dd>
              </div>
              <div>
                <dt>Roll number</dt>
                <dd>{currentStudent.rollNo}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{currentStudent.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{currentStudent.phone}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{currentStudent.department}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{currentStudent.year}</dd>
              </div>
            </dl>
          </Card>

          <Card title="My courses">
            <ul className="course-list">
              {enrolled.map((c) => (
                <li key={c.id}>
                  <Link href={`/courses/${c.id}`} className="course-row">
                    <span className={`cp-code tone-${c.color}`}>{c.code.slice(0, 2)}</span>
                    <div className="min0 grow">
                      <p className="strong truncate">{c.name}</p>
                      <p className="muted small">{c.faculty}</p>
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
        </div>

        <div className="stack">
          <Card title="Attendance">
            <div className="att-hero">
              <Ring value={me.attendance} size={120} stroke={11} tone={attendanceTone(me.attendance)}>
                <strong className="ring-big">{me.attendance}%</strong>
                <span className="ring-cap">overall</span>
              </Ring>
              <p className="muted small center">You&apos;re comfortably above the 75% requirement.</p>
            </div>
          </Card>
          <Card title="Skills">
            <div className="skills">
              {me.skills.map((k) => (
                <span key={k} className="skill skill-lg">
                  {k}
                </span>
              ))}
            </div>
          </Card>
          <Card title="Contact">
            <ul className="contact-list">
              <li>
                <span className="stat-icon tone-teal">
                  <Icon name="mail" size={16} />
                </span>
                <div>
                  <span className="muted xsmall">Email</span>
                  <strong>{currentStudent.email}</strong>
                </div>
              </li>
              <li>
                <span className="stat-icon tone-indigo">
                  <Icon name="phone" size={16} />
                </span>
                <div>
                  <span className="muted xsmall">Phone</span>
                  <strong>{currentStudent.phone}</strong>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
