"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import { cx, initials, toneFor } from "@/lib/utils";

export function Avatar({ name, size = 40, tone, className }) {
  return (
    <span
      className={cx("avatar", `tone-${tone || toneFor(name)}`, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions, back }) {
  return (
    <header className="page-header">
      <div>
        {back && (
          <Link href={back.href} className="back-link">
            <Icon name="arrowLeft" size={16} /> {back.label}
          </Link>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Card({ title, action, children, className, padded = true, ...rest }) {
  return (
    <section className={cx("card", padded && "card-padded", className)} {...rest}>
      {(title || action) && (
        <div className="card-head">
          {title && <h2 className="card-title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Progress({ value, tone = "accent", size = "md", label }) {
  return (
    <div
      className={cx("progress", `progress-${size}`)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cx("progress-fill", `fill-${tone}`)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Ring({ value, size = 96, stroke = 9, tone = "accent", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={cx("ring-value", `stroke-${tone}`)}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-label">{children ?? `${value}%`}</div>
    </div>
  );
}

const STATUS_META = {
  Submitted: { tone: "success", icon: "checkCircle" },
  Pending: { tone: "warning", icon: "clock" },
  Overdue: { tone: "danger", icon: "alert" },
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { tone: "neutral", icon: "clock" };
  return (
    <span className={cx("badge", `badge-${meta.tone}`)}>
      <Icon name={meta.icon} size={13} strokeWidth={2.2} />
      {status}
    </span>
  );
}

export function Badge({ tone = "neutral", children, className }) {
  return <span className={cx("badge", `badge-${tone}`, className)}>{children}</span>;
}

export function EmptyState({ icon = "inbox", title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("input, textarea, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Switch({ checked, onChange, label, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      className={cx("switch", checked && "on")}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-thumb" />
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder, className }) {
  return (
    <div className={cx("search", className)}>
      <Icon name="search" size={18} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange("")} aria-label="Clear search">
          <Icon name="x" size={14} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={cx("segment", value === o.value && "active")}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={16} />}
          {o.label}
          {o.count !== undefined && <span className="segment-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
