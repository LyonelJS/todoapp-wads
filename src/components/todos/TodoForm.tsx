"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createTodoAction } from "@/actions/todos";
import toast from "react-hot-toast";

interface TodoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TodoFormModal({ isOpen, onClose }: TodoFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createTodoAction(formData);
      if (result.success) {
        form.reset();
        onClose();
        toast.success("Task added successfully!");
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        toast.error(result.error || "Failed to add task.");
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label="Add new task"
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="modal-title">New Task</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="modal-title" className="form-label">
              Task title <span className="required">*</span>
            </label>
            <input
              ref={titleRef}
              id="modal-title"
              name="title"
              type="text"
              required
              className={`form-input ${fieldErrors.title ? "input-error" : ""}`}
              placeholder="What needs to be done?"
              maxLength={200}
            />
            {fieldErrors.title && (
              <p className="field-error">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="modal-desc" className="form-label">
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id="modal-desc"
              name="description"
              className="form-input form-textarea"
              placeholder="Add more details..."
              rows={3}
              maxLength={1000}
            />
            {fieldErrors.description && (
              <p className="field-error">{fieldErrors.description}</p>
            )}
          </div>

          {/* Priority + Due date */}
          <div className="modal-row">
            <div className="form-group">
              <label htmlFor="modal-priority" className="form-label">Priority</label>
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
                      defaultChecked={p.value === "medium"}
                      className="prio-radio"
                    />
                    <span className="prio-label">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-due" className="form-label">Due date</label>
              <input
                id="modal-due"
                name="dueDate"
                type="date"
                className="form-input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Adding task...
                </span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                  Add Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
