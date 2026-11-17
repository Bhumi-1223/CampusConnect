"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { Avatar, EmptyState, PageHeader, Progress, SearchInput, Segmented } from "@/components/ui";
import { departments, students } from "@/data/data";
import { attendanceTone, cx } from "@/lib/utils";

const YEARS = ["All years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

function StudentsView() {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [dept, setDept] = useState("All");
  const [year, setYear] = useState("All years");
  const [view, setView] = useState("grid");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.skills.some((k) => k.toLowerCase().includes(q));
      return matchQ && (dept === "All" || s.department === dept) && (year === "All years" || s.year === year);
    });
  }, [search, dept, year]);

  const deptOptions = [
    { value: "All", label: "All", count: students.length },
    ...departments.map((d) => ({
      value: d,
      label: d === "Information Technology" ? "IT" : d,
      count: students.filter((s) => s.department === d).length,
    })),
  ];

  const hasFilters = search || dept !== "All" || year !== "All years";
  const reset = () => {
    setSearch("");
    setDept("All");
    setYear("All years");
  };

  return (
    <div className="page">
      <PageHeader
        title="Students"
        subtitle="Browse classmates across departments and open their full profile."
      />

      <div className="toolbar card">
        <div className="toolbar-row">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, roll no. or skill…"
            className="grow"
          />
          <div className="select-wrap">
            <Icon name="cap" size={17} />
            <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year">
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={16} className="select-caret" />
          </div>
          <Segmented
            label="Layout"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "", icon: "grid" },
              { value: "table", label: "", icon: "list" },
            ]}
          />
        </div>
        <div className="toolbar-row chips-row">
          <span className="toolbar-label">
            <Icon name="filter" size={15} /> Department
          </span>
          <div className="chips" role="group" aria-label="Filter by department">
            {deptOptions.map((o) => (
              <button
                key={o.value}
                className={cx("chip", dept === o.value && "active")}
                aria-pressed={dept === o.value}
                onClick={() => setDept(o.value)}
              >
                {o.label}
                <span className="chip-count">{o.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="results-bar">
        <p>
          Showing <strong>{filtered.length}</strong> of {students.length} students
        </p>
        {hasFilters && (
          <button className="link-btn" onClick={reset}>
            <Icon name="x" size={14} /> Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No students match your filters"
          text="Try a different name or skill, or clear the filters to see everyone."
          action={
            <button className="btn btn-secondary" onClick={reset}>
              Clear filters
            </button>
          }
        />
      ) : view === "grid" ? (
        <div className="student-grid">
          {filtered.map((s) => (
            <article key={s.id} className="student-card">
              <div className="student-head">
                <Avatar name={s.name} size={52} />
                <div className="min0">
                  <h3 className="truncate">{s.name}</h3>
                  <p className="muted small">{s.rollNo}</p>
                </div>
              </div>
              <div className="student-tags">
                <span className="tag">{s.department}</span>
                <span className="tag tag-soft">{s.year}</span>
              </div>
              <div className="student-att">
                <div className="att-row">
                  <span>Attendance</span>
                  <strong className={`text-${attendanceTone(s.attendance)}`}>{s.attendance}%</strong>
                </div>
                <Progress value={s.attendance} size="sm" tone={attendanceTone(s.attendance)} label="Attendance" />
              </div>
              <div className="skills-mini">
                {s.skills.slice(0, 3).map((k) => (
                  <span key={k} className="skill">
                    {k}
                  </span>
                ))}
                {s.skills.length > 3 && <span className="skill more">+{s.skills.length - 3}</span>}
              </div>
              <Link href={`/students/${s.id}`} className="btn btn-secondary btn-block">
                View details <Icon name="arrowRight" size={16} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Year</th>
                <th>Attendance</th>
                <th className="ta-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td data-label="Student">
                    <div className="cell-user">
                      <Avatar name={s.name} size={36} />
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Department">{s.department}</td>
                  <td data-label="Year">{s.year}</td>
                  <td data-label="Attendance">
                    <div className="cell-att">
                      <Progress value={s.attendance} size="sm" tone={attendanceTone(s.attendance)} label="Attendance" />
                      <span className={`text-${attendanceTone(s.attendance)}`}>{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="ta-right">
                    <Link href={`/students/${s.id}`} className="btn btn-secondary btn-sm">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="page" />}>
      <StudentsView />
    </Suspense>
  );
}
