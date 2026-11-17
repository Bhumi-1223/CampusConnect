"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { Avatar, EmptyState, PageHeader, Progress, SearchInput, Segmented } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { courses } from "@/data/data";

function stage(p) {
  if (p >= 75) return "almost";
  if (p >= 45) return "progress";
  return "early";
}

export default function CoursesPage() {
  const { assignments } = useApp();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (tab === "all" || stage(c.progress) === tab) &&
        (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.faculty.toLowerCase().includes(q))
    );
  }, [tab, search]);

  const count = (t) => courses.filter((c) => stage(c.progress) === t).length;
  const credits = courses.reduce((s, c) => s + c.credits, 0);

  return (
    <div className="page">
      <PageHeader
        title="Courses"
        subtitle={`${courses.length} courses · ${credits} credits this semester`}
      />

      <div className="toolbar-inline">
        <Segmented
          label="Filter courses"
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: courses.length },
            { value: "early", label: "Just started", count: count("early") },
            { value: "progress", label: "In progress", count: count("progress") },
            { value: "almost", label: "Almost done", count: count("almost") },
          ]}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search courses…" />
      </div>

      {list.length === 0 ? (
        <EmptyState icon="book" title="No courses found" text="Try another search term or filter." />
      ) : (
        <div className="course-grid">
          {list.map((c) => {
            const pending = assignments.filter((a) => a.courseId === c.id && a.state !== "Submitted").length;
            return (
              <article key={c.id} className={`course-card accent-${c.color}`}>
                <div className="course-band">
                  <span className="course-code">{c.code}</span>
                  <span className="course-credits">
                    <Icon name="award" size={14} /> {c.credits} credits
                  </span>
                </div>
                <div className="course-body">
                  <h3>{c.name}</h3>
                  <div className="faculty">
                    <Avatar name={c.faculty.replace(/^(Dr\.|Prof\.)\s/, "")} size={30} tone={c.color} />
                    <div>
                      <span className="muted xsmall">Faculty</span>
                      <strong>{c.faculty}</strong>
                    </div>
                  </div>
                  <div className="course-meta">
                    <span>
                      <Icon name="clock" size={15} /> {c.schedule}
                    </span>
                    <span>
                      <Icon name="clipboard" size={15} /> {pending} pending
                    </span>
                  </div>
                  <div className="course-prog">
                    <div className="att-row">
                      <span>Progress</span>
                      <strong>{c.progress}%</strong>
                    </div>
                    <Progress value={c.progress} tone={c.color} label={`${c.name} progress`} />
                  </div>
                  <Link href={`/courses/${c.id}`} className="btn btn-secondary btn-block">
                    View course <Icon name="arrowRight" size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
