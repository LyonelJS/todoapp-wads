"use client";

import { useState } from "react";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
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

  const activeCount = initialTodos.filter((t) => !t.completed).length;
  const completedCount = initialTodos.filter((t) => t.completed).length;

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
        toastOptions={{
          className: "toast",
          duration: 3000,
        }}
      />

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-icon">✓</span>
          <span className="brand-name">TodoApp</span>
        </div>

        <div className="header-user">
          <div className="user-info">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="user-avatar" />
            ) : (
              <div className="user-avatar user-avatar-initials">{initials}</div>
            )}
            <span className="user-name">{displayName}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-value">{initialTodos.length}</p>
            <p className="stat-label">Total</p>
          </div>
          <div className="stat-card">
            <p className="stat-value stat-active">{activeCount}</p>
            <p className="stat-label">Active</p>
          </div>
          <div className="stat-card">
            <p className="stat-value stat-done">{completedCount}</p>
            <p className="stat-label">Done</p>
          </div>
        </div>

        {/* Add todo form */}
        <section className="section-card">
          <h2 className="section-title">Add a new task</h2>
          <TodoForm />
        </section>

        {/* Todo list section */}
        <section className="section-card">
          {/* Filters & sort */}
          <div className="list-controls">
            <div className="filter-tabs">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-tab ${filter === f ? "filter-tab-active" : ""}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="filter-count">
                    {f === "all"
                      ? initialTodos.length
                      : f === "active"
                      ? activeCount
                      : completedCount}
                  </span>
                </button>
              ))}
            </div>

            <div className="sort-control">
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="form-input form-select sort-select"
              >
                <option value="createdAt">Newest first</option>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="form-input search-input"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="search-clear"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* List */}
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              {search ? (
                <>
                  <p className="empty-icon">🔍</p>
                  <p className="empty-title">No results found</p>
                  <p className="empty-sub">Try a different search term.</p>
                </>
              ) : filter === "completed" ? (
                <>
                  <p className="empty-icon">🏆</p>
                  <p className="empty-title">No completed tasks yet</p>
                  <p className="empty-sub">Finish a task to see it here.</p>
                </>
              ) : (
                <>
                  <p className="empty-icon">📝</p>
                  <p className="empty-title">No tasks yet</p>
                  <p className="empty-sub">Add your first task above to get started.</p>
                </>
              )}
            </div>
          ) : (
            <div className="todo-list">
              {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
