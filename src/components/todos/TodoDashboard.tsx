"use client";

import { useState } from "react";
import TodoItem from "./TodoItem";
import TodoFormModal from "./TodoForm";
import { logoutAction } from "@/actions/auth";
import toast, { Toaster } from "react-hot-toast";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  dueDate: Date | null;
  createdAt: Date;
};

type Filter = "all" | "active" | "completed";
type SortBy = "createdAt" | "dueDate" | "priority";

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

function sortTodos(todos: Todo[], sortBy: SortBy): Todo[] {
  return [...todos].sort((a, b) => {
    if (sortBy === "priority") {
      return (
        (PRIORITY_WEIGHT[b.priority as keyof typeof PRIORITY_WEIGHT] || 2) -
        (PRIORITY_WEIGHT[a.priority as keyof typeof PRIORITY_WEIGHT] || 2)
      );
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function TodoDashboard({
  todos: initialTodos,
  user,
}: {
  todos: Todo[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCount = initialTodos.filter((t) => !t.completed).length;
  const completedCount = initialTodos.filter((t) => t.completed).length;
  const completionPct =
    initialTodos.length > 0
      ? Math.round((completedCount / initialTodos.length) * 100)
      : 0;

  const filteredTodos = sortTodos(
    initialTodos.filter((todo) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);
      const matchesSearch =
        !search ||
        todo.title.toLowerCase().includes(search.toLowerCase()) ||
        (todo.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchesFilter && matchesSearch;
    }),
    sortBy
  );

  async function handleLogout() {
    toast.loading("Signing out...");
    await logoutAction();
  }

  const avatarUrl = user.image || null;
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard">
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3500 }}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-logo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8.5l3.5 3.5L14 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">Taskly</span>
        </div>

        <div className="header-right">
          <div className="header-user">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="user-avatar" />
            ) : (
              <div className="user-avatar user-avatar-initials">{initials}</div>
            )}
            <div className="user-meta">
              <span className="user-name">{displayName}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="dashboard-main">

        {/* Page title + CTA */}
        <div className="page-top">
          <div>
            <h1 className="page-title">My Tasks</h1>
            <p className="page-sub">
              {activeCount === 0 && initialTodos.length > 0
                ? "All tasks complete 🎉"
                : activeCount > 0
                ? `${activeCount} task${activeCount > 1 ? "s" : ""} remaining`
                : "No tasks yet — add one!"}
            </p>
          </div>
          <button
            id="add-task-btn"
            onClick={() => setIsModalOpen(true)}
            className="btn-add-task"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Add New Task
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon-wrap stat-icon-total">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="stat-value">{initialTodos.length}</p>
              <p className="stat-label">Total tasks</p>
            </div>
          </div>

          <div className="stat-card stat-active">
            <div className="stat-icon-wrap stat-icon-active">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="stat-value">{activeCount}</p>
              <p className="stat-label">In progress</p>
            </div>
          </div>

          <div className="stat-card stat-done">
            <div className="stat-icon-wrap stat-icon-done">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 10l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="stat-value">{completedCount}</p>
              <p className="stat-label">Completed</p>
            </div>
          </div>

          {/* Progress card */}
          <div className="stat-card stat-progress">
            <div className="progress-top">
              <p className="stat-label">Overall Progress</p>
              <p className="progress-pct">{completionPct}%</p>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Task list card ─────────────────────────── */}
        <div className="tasks-card">
          {/* Controls row */}
          <div className="tasks-controls">
            {/* Filter tabs */}
            <div className="filter-tabs">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-tab ${filter === f ? "filter-tab-active" : ""}`}
                >
                  {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
                  <span className="filter-badge">
                    {f === "all" ? initialTodos.length : f === "active" ? activeCount : completedCount}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + sort */}
            <div className="controls-right">
              <div className="search-box">
                <svg className="search-ico" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks…"
                  className="search-input"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="search-clear" aria-label="Clear">×</button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="sort-select"
                aria-label="Sort by"
              >
                <option value="createdAt">Newest</option>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Task list */}
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-visual">
                {search ? (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="22" cy="22" r="14" stroke="#cbd5e1" strokeWidth="3"/>
                    <path d="M32 32l10 10" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M17 22h10M22 17v10" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                ) : filter === "completed" ? (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="18" stroke="#cbd5e1" strokeWidth="3"/>
                    <path d="M14 25l7 7 13-14" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="10" width="32" height="28" rx="4" stroke="#cbd5e1" strokeWidth="3"/>
                    <path d="M16 20h16M16 28h10" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M24 6v8" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <p className="empty-title">
                {search ? "No matching tasks" : filter === "completed" ? "No completed tasks yet" : "No tasks yet"}
              </p>
              <p className="empty-sub">
                {search
                  ? "Try a different search term."
                  : filter === "completed"
                  ? "Complete a task to see it here."
                  : "Click \"Add New Task\" to get started."}
              </p>
              {!search && filter === "all" && (
                <button onClick={() => setIsModalOpen(true)} className="empty-cta">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add your first task
                </button>
              )}
            </div>
          ) : (
            <div className="todo-list">
              {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal ──────────────────────────────────────── */}
      <TodoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
