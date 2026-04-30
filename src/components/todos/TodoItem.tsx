"use client";

import { useState, useTransition } from "react";
import { toggleTodoAction, deleteTodoAction, updateTodoAction } from "@/actions/todos";
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

const PRIORITY_CONFIG = {
  high: { label: "High", class: "priority-high", dot: "🔴" },
  medium: { label: "Medium", class: "priority-medium", dot: "🟡" },
  low: { label: "Low", class: "priority-low", dot: "🟢" },
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(date: Date | null, completed: boolean) {
  if (!date || completed) return false;
  return new Date(date) < new Date();
}

export default function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, startToggleTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const priority = PRIORITY_CONFIG[todo.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  const overdue = isOverdue(todo.dueDate, todo.completed);

  function handleToggle() {
    startToggleTransition(async () => {
      const result = await toggleTodoAction(todo.id);
      if (!result.success) toast.error(result.error || "Failed to update.");
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteTodoAction(todo.id);
      if (!result.success) toast.error(result.error || "Failed to delete.");
      else toast.success("Todo deleted.");
    });
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("completed", todo.completed.toString());

    startUpdateTransition(async () => {
      const result = await updateTodoAction(todo.id, formData);
      if (result.success) {
        setIsEditing(false);
        toast.success("Todo updated!");
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        toast.error(result.error || "Failed to update.");
      }
    });
  }

  if (isEditing) {
    return (
      <div className={`todo-item todo-item-editing ${todo.completed ? "todo-completed" : ""}`}>
        <form onSubmit={handleEdit} className="edit-form">
          <div className="form-group">
            <input
              name="title"
              type="text"
              defaultValue={todo.title}
              required
              className={`form-input ${fieldErrors.title ? "input-error" : ""}`}
              placeholder="Todo title"
              autoFocus
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

          <div className="todo-form-row">
            <div className="form-group form-group-half">
              <label className="form-label">Priority</label>
              <select name="priority" defaultValue={todo.priority} className="form-input form-select">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group form-group-half">
              <label className="form-label">Due date</label>
              <input
                name="dueDate"
                type="date"
                defaultValue={todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""}
                className="form-input"
              />
            </div>
          </div>

          <div className="todo-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" disabled={isUpdating} className="btn btn-primary btn-sm">
              {isUpdating ? (
                <span className="btn-loading"><span className="spinner" />Saving...</span>
              ) : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`todo-item ${todo.completed ? "todo-completed" : ""} ${isDeleting ? "todo-deleting" : ""}`}
    >
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`todo-checkbox ${todo.completed ? "todo-checkbox-checked" : ""}`}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {todo.completed && <span className="checkmark">✓</span>}
      </button>

      <div className="todo-content">
        <div className="todo-header">
          <p className={`todo-title ${todo.completed ? "todo-title-done" : ""}`}>
            {todo.title}
          </p>
          <span className={`priority-badge ${priority.class}`}>
            {priority.dot} {priority.label}
          </span>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        {todo.dueDate && (
          <p className={`todo-due ${overdue ? "todo-overdue" : ""}`}>
            📅 {overdue ? "Overdue · " : "Due "}{formatDate(todo.dueDate)}
          </p>
        )}
      </div>

      <div className="todo-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="action-btn action-edit"
          aria-label="Edit todo"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="action-btn action-delete"
          aria-label="Delete todo"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
