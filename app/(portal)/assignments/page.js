"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { EmptyState, PageHeader, SearchInput, Segmented, StatusBadge } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import SubmitModal from "@/components/SubmitModal";
import { courses, getCourse } from "@/data/data";
import { cx, formatDate, relativeDue, urgency } from "@/lib/utils";

const RANK = { Overdue: 0, Pending: 1, Submitted: 2 };

export default function AssignmentsPage() {
  const { assignments } = useApp();
  const [status, setStatus] = useState("all");
  const [course, setCourse] = useState("all");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [viewing, setViewing] = useState(null);

  const counts = {
    all: assignments.length,
    Pending: assignments.filter((a) => a.state === "Pending").length,
    Overdue: assignments.filter((a) => a.state === "Overdue").length,
    Submitted: assignments.filter((a) => a.state === "Submitted").length,
  };

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments
      .filter(
        (a) =>
          (status === "all" || a.state === status) &&
          (course === "all" || a.courseId === Number(course)) &&
          (!q || a.title.toLowerCase().includes(q) || getCourse(a.courseId).name.toLowerCase().includes(q))
      )
      // Work that needs attention first (overdue → pending → submitted), then by due date
      .sort(
        (a, b) =>
          RANK[a.state] - RANK[b.state] || (sortAsc ? 1 : -1) * a.dueDate.localeCompare(b.dueDate)
      );
  }, [assignments, status, course, search, sortAsc]);

  const pct = Math.round((counts.Submitted / counts.all) * 100);

  return (
    <div className="page">
      <PageHeader title="Assignments" subtitle="Track, filter and submit your coursework in one place." />

      <div className="assign-summary">
        <div className="summary-progress card card-padded">
          <div className="att-row">
            <span className="strong">Semester completion</span>
            <strong>{pct}%</strong>
          </div>
          <div className="progress progress-md">
            <div className="progress-fill fill-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="muted small">
            {counts.Submitted} of {counts.all} assignments submitted
          </p>
        </div>
        {[
          { key: "Pending", icon: "clock", tone: "amber", label: "Pending" },
          { key: "Overdue", icon: "alert", tone: "rose", label: "Overdue" },
          { key: "Submitted", icon: "checkCircle", tone: "teal", label: "Submitted" },
        ].map((s) => (
          <button
            key={s.key}
            className={cx("summary-tile", status === s.key && "active")}
            onClick={() => setStatus(status === s.key ? "all" : s.key)}
            aria-pressed={status === s.key}
          >
            <span className={`stat-icon tone-${s.tone}`}>
              <Icon name={s.icon} size={18} />
            </span>
            <div>
              <strong>{counts[s.key]}</strong>
              <span>{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="toolbar card">
        <div className="toolbar-row">
          <Segmented
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "Pending", label: "Pending", count: counts.Pending },
              { value: "Overdue", label: "Overdue", count: counts.Overdue },
              { value: "Submitted", label: "Submitted", count: counts.Submitted },
            ]}
          />
          <div className="toolbar-right">
            <SearchInput value={search} onChange={setSearch} placeholder="Search assignments…" className="grow" />
            <div className="select-wrap">
              <Icon name="book" size={17} />
              <select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Filter by course">
                <option value="all">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" size={16} className="select-caret" />
            </div>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title={status === "Overdue" ? "Nothing overdue — nice!" : "No assignments found"}
          text="Try changing the filters or search term."
        />
      ) : (
        <div className="card table-card">
          <table className="table assign-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>
                  <button className="th-sort" onClick={() => setSortAsc((v) => !v)}>
                    Due date <Icon name="sort" size={14} />
                  </button>
                </th>
                <th>Status</th>
                <th className="ta-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const c = getCourse(a.courseId);
                const u = urgency(a.dueDate);
                return (
                  <tr key={a.id} className={cx(a.state === "Overdue" && "row-danger")}>
                    <td data-label="Assignment">
                      <div className="cell-assign">
                        <span className={`assign-icon u-${a.state === "Submitted" ? "success" : u}`}>
                          <Icon name={a.state === "Submitted" ? "checkCircle" : "file"} size={17} />
                        </span>
                        <div>
                          <strong>{a.title}</strong>
                          <span className="cell-sub">{a.points} points</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Course">
                      <Link href={`/courses/${c.id}`} className="course-pill">
                        <span className={`dot-sm tone-${c.color}`} />
                        {c.name}
                      </Link>
                    </td>
                    <td data-label="Due date">
                      <div className="cell-due">
                        <strong>{formatDate(a.dueDate)}</strong>
                        {a.state !== "Submitted" ? (
                          <span className={`text-${u}`}>{relativeDue(a.dueDate)}</span>
                        ) : (
                          <span className="muted">{a.score !== undefined ? `Graded ${a.score}/${a.points}` : "Awaiting grade"}</span>
                        )}
                      </div>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={a.state} />
                    </td>
                    <td className="ta-right" data-label="">
                      {a.state === "Submitted" ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewing(a)}>
                          <Icon name="eye" size={16} /> View
                        </button>
                      ) : (
                        <button
                          className={cx("btn btn-sm", a.state === "Overdue" ? "btn-danger" : "btn-primary")}
                          onClick={() => setSubmitting(a)}
                        >
                          <Icon name="upload" size={16} /> {a.state === "Overdue" ? "Submit late" : "Submit"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {submitting && <SubmitModal assignment={submitting} onClose={() => setSubmitting(null)} />}

      {viewing && (
        <ViewSubmission assignment={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

function ViewSubmission({ assignment: a, onClose }) {
  const c = getCourse(a.courseId);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Submission" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{a.title}</h2>
            <p>{c.name}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close" autoFocus>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="callout callout-success">
            <Icon name="checkCircle" size={17} /> Submitted successfully
            {a.submission?.at && ` on ${new Date(a.submission.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`}
          </div>
          <dl className="info-list single mt-16">
            <div>
              <dt>File</dt>
              <dd>{a.submission?.file || `${a.title.toLowerCase().replace(/\s+/g, "-")}.pdf`}</dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>{formatDate(a.dueDate)}</dd>
            </div>
            <div>
              <dt>Grade</dt>
              <dd>{a.score !== undefined ? `${a.score} / ${a.points}` : "Awaiting grade"}</dd>
            </div>
            {a.submission?.note && (
              <div>
                <dt>Your note</dt>
                <dd>{a.submission.note}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
