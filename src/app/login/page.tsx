import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in – TodoApp",
  description: "Sign in to your TodoApp account.",
};

export default function LoginPage() {
  return (
    <div className="auth-page">
      <LoginForm />
    </div>
  );
}
