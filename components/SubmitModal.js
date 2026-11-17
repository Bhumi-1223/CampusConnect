"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { Modal } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { getCourse } from "@/data/data";
import { cx, formatDate, relativeDue } from "@/lib/utils";

export default function SubmitModal({ assignment, onClose }) {
  const { submitAssignment, toast } = useApp();
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  if (!assignment) return null;
  const course = getCourse(assignment.courseId);

  function pick(f) {
    if (!f) return;
    setFile({ name: f.name, size: f.size });
    setError("");
  }

  function handleSubmit() {
    if (!file) {
      setError("Please attach your work before submitting.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      submitAssignment(assignment.id, { file: file.name, note });
      toast(`“${assignment.title}” submitted successfully`);
      setBusy(false);
      onClose();
    }, 700);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Submit assignment"
      subtitle={`${assignment.title} · ${course?.name}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? <span className="spinner" /> : <Icon name="upload" size={17} />}
            {busy ? "Submitting…" : "Submit work"}
          </button>
        </>
      }
    >
      <div className="submit-meta">
        <div>
          <span className="meta-label">Due date</span>
          <strong>{formatDate(assignment.dueDate)}</strong>
        </div>
        <div>
          <span className="meta-label">Timeline</span>
          <strong className={assignment.state === "Overdue" ? "text-danger" : ""}>
            {relativeDue(assignment.dueDate)}
          </strong>
        </div>
        <div>
          <span className="meta-label">Points</span>
          <strong>{assignment.points}</strong>
        </div>
      </div>

      <label
        className={cx("dropzone", dragging && "dragging", file && "has-file", error && "invalid")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        <input ref={inputRef} type="file" hidden onChange={(e) => pick(e.target.files?.[0])} />
        {file ? (
          <div className="file-chip">
            <span className="file-icon">
              <Icon name="file" size={20} />
            </span>
            <div className="file-info">
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(1)} KB · Ready to submit</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label="Remove file"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
              }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        ) : (
          <>
            <span className="dropzone-icon">
              <Icon name="upload" size={22} />
            </span>
            <strong>Drop your file here, or <span className="link">browse</span></strong>
            <span className="muted small">PDF, DOCX, ZIP or images · up to 25 MB</span>
          </>
        )}
      </label>
      {error && (
        <p className="field-error">
          <Icon name="alert" size={14} /> {error}
        </p>
      )}

      <div className="field">
        <label htmlFor="note" className="label">
          Note to instructor <span className="optional">Optional</span>
        </label>
        <textarea
          id="note"
          rows={3}
          className="input"
          placeholder="Anything your instructor should know about this submission…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}
