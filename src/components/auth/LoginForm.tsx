"use client";

import { useState, useTransition } from "react";
import { googleSignInAction, loginAction } from "@/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success) {
        router.push("/todos");
        router.refresh();
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        setError(result.error || "Login failed.");
      }
    });
  }

  async function handleGoogleSignIn() {
    startGoogleTransition(async () => {
      await googleSignInAction();
    });
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">✓</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="field-error">{fieldErrors.email}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-with-button">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`form-input ${fieldErrors.password ? "input-error" : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="input-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="field-error">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
        >
          {isPending ? (
            <span className="btn-loading">
              <span className="spinner" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="divider">
        <span>or continue with</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGooglePending}
        className="btn btn-google"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
          />
          <path
            fill="#34A853"
            d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
          />
          <path
            fill="#FBBC05"
            d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
          />
          <path
            fill="#EA4335"
            d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
          />
        </svg>
        {isGooglePending ? "Connecting..." : "Continue with Google"}
      </button>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="auth-link">
          Create one
        </Link>
      </p>
    </div>
  );
}
