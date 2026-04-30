import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTodosAction } from "@/actions/todos";
import TodoDashboard from "@/components/todos/TodoDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks – TodoApp",
  description: "Manage your todos and stay productive.",
};

export default async function TodosPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const todos = await getTodosAction();

  return (
    <TodoDashboard
      todos={todos}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
