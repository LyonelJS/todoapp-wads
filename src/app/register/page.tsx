import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account – TodoApp",
  description: "Create your free TodoApp account.",
};

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <RegisterForm />
    </div>
  );
}
