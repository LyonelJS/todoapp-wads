"use client";

import { useState, useTransition } from "react";
import {
  toggleTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "@/actions/todos";
import toast from "react-hot-toast";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  dueDate: Date | null;
  createdAt: Date;
};

const PRIORITY = {
  high:   { label: "High",   cls: "badge-high",   dot: "#ef4444" },
  medium: { label: "Medium", cls: "badge-medium",  dot: "#f59e0b" },
  low:    { label: "Low",    cls: "badge-low",     dot: "#22c55e" },
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function isOverdue(date: Date | null, completed: boolean) {
  if (!date || completed) return false;
  return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
}

export default function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isUpdating, startUpdate] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const prio = PRIORITY[todo.priority as keyof typeof PRIORITY] ?? PRIORITY.medium;
  const overdue = isOverdue(todo.dueDate, todo.completed);

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleTodoAction(todo.id);
      if (!result.success) toast.error(result.error || "Failed to update.");
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteTodoAction(todo.id);
      if (!result.success) toast.error(result.error || "Failed to delete.");
      else toast.success("Task deleted.");
      setShowDeleteConfirm(false);
    });
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    formData.set("completed", todo.completed.toString());

    startUpdate(async () => {
      const result = await updateTodoAction(todo.id, formData);
      if (result.success) {
        setIsEditing(false);
        toast.success("Task updated!");
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        toast.error(result.error || "Failed to update.");
      }
    });
  }

  /* ── Edit mode ─────────────────────────────────────── */
  if (isEditing) {
    return (
      <div className="todo-item todo-item-editing">
        <form onSubmit={handleEdit} className="edit-form">
          <div className="form-group">
            <input
              name="title"
              type="text"
              defaultValue={todo.title}
              required
              autoFocus
              className={`form-input ${fieldErrors.title ? "input-error" : ""}`}
              placeholder="Task title"
            />
            {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
          </div>

          <div className="form-group">
            <textarea
              name="description"
              defaultValue={todo.description || ""}
              className="form-input form-textarea"
              placeholder="Description (optional)"
              rows={2}
            />
          </div>

          <div className="edit-row">
            <div className="form-group edit-half">
              <label className="form-label">Priority</label>
              <div className="priority-selector">
                {[
                  { value: "low",    label: "Low",    color: "prio-low" },
                  { value: "medium", label: "Medium", color: "prio-med" },
                  { value: "high",   label: "High",   color: "prio-high" },
                ].map((p) => (
                  <label key={p.value} className={`prio-option ${p.color}`}>
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      defaultChecked={todo.priority === p.value}
                      className="prio-radio"
                    />
                    <span className="prio-label">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group edit-half">
              <label className="form-label">Due date</label>
              <input
                name="dueDate"
                type="date"
                defaultValue={
                  todo.dueDate
                    ? new Date(todo.dueDate).toISOString().split("T")[0]
                    : ""
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="edit-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setIsEditing(false); setFieldErrors({}); }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="btn btn-primary btn-sm"
            >
              {isUpdating ? (
                <span className="btn-loading"><span className="spinner" />Saving…</span>
              ) : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ── Normal view ───────────────────────────────────── */
  return (
    <div
      className={`todo-item ${todo.completed ? "todo-done" : ""} ${isDeleting ? "todo-deleting" : ""}`}
    >
      {/* Left: checkbox */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`checkbox ${todo.completed ? "checkbox-checked" : ""}`}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        {todo.completed && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Middle: content */}
      <div className="item-content">
        <div className="item-top">
          <span className={`item-title ${todo.completed ? "item-title-done" : ""}`}>
            {todo.title}
          </span>
          <span
            className={`prio-badge ${prio.cls}`}
            title={`${prio.label} priority`}
          >
            <span
              className="prio-dot"
              style={{ background: prio.dot }}
            />
            {prio.label}
          </span>
        </div>

        {todo.description && (
          <p className="item-desc">{todo.description}</p>
        )}

        {todo.dueDate && (
          <div className={`item-due ${overdue ? "item-overdue" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {overdue ? "Overdue · " : "Due "}{formatDate(todo.dueDate)}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="item-actions">
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <span className="delete-confirm-text">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="confirm-yes"
            >
              {isDeleting ? <span className="spinner spinner-sm" /> : "Yes"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="confirm-no"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="icon-btn icon-edit"
              aria-label="Edit task"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="icon-btn icon-delete"
              aria-label="Delete task"
              title="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3.5 4l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
