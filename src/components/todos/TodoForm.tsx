"use client";

import { useState, useTransition } from "react";
import { createTodoAction } from "@/actions/todos";
import toast from "react-hot-toast";

export default function TodoForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createTodoAction(formData);
      if (result.success) {
        form.reset();
        setIsExpanded(false);
        toast.success("Todo added!");
        onSuccess?.();
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        toast.error("Please fix the errors below.");
      } else {
        toast.error(result.error || "Failed to add todo.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          name="title"
          type="text"
          required
          className={`form-input todo-title-input ${fieldErrors.title ? "input-error" : ""}`}
          placeholder="What needs to be done?"
          onFocus={() => setIsExpanded(true)}
        />
        {fieldErrors.title && (
          <p className="field-error">{fieldErrors.title}</p>
        )}
      </div>

      {isExpanded && (
        <div className="todo-form-expanded">
          <div className="form-group">
            <textarea
              name="description"
              className="form-input form-textarea"
              placeholder="Add a description (optional)"
              rows={2}
              maxLength={1000}
            />
            {fieldErrors.description && (
              <p className="field-error">{fieldErrors.description}</p>
            )}
          </div>

          <div className="todo-form-row">
            <div className="form-group form-group-half">
              <label className="form-label">Priority</label>
              <select name="priority" className="form-input form-select">
                <option value="low">🟢 Low</option>
                <option value="medium" defaultValue="medium">
                  🟡 Medium
                </option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="form-group form-group-half">
              <label className="form-label">Due date</label>
              <input
                name="dueDate"
                type="date"
                className="form-input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="todo-form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
              {isPending ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Adding...
                </span>
              ) : (
                "Add Todo"
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
