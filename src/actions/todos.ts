"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todoSchema, updateTodoSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function getTodosAction() {
  const user = await getAuthUser();
  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return todos;
}

export async function createTodoAction(
  formData: FormData
): Promise<ActionResult> {
  const user = await getAuthUser();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    priority: (formData.get("priority") as string) || "medium",
    dueDate: (formData.get("dueDate") as string) || undefined,
  };

  const parsed = todoSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    await prisma.todo.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        userId: user.id!,
      },
    });

    revalidatePath("/todos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create todo. Please try again." };
  }
}

export async function updateTodoAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await getAuthUser();

  const todo = await prisma.todo.findFirst({
    where: { id, userId: user.id },
  });

  if (!todo) {
    return { success: false, error: "Todo not found." };
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    priority: (formData.get("priority") as string) || todo.priority,
    dueDate: (formData.get("dueDate") as string) || undefined,
    completed: formData.get("completed") === "true",
  };

  const parsed = updateTodoSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    await prisma.todo.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        completed: parsed.data.completed ?? todo.completed,
      },
    });

    revalidatePath("/todos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update todo. Please try again." };
  }
}

export async function toggleTodoAction(id: string): Promise<ActionResult> {
  const user = await getAuthUser();

  const todo = await prisma.todo.findFirst({
    where: { id, userId: user.id },
  });

  if (!todo) {
    return { success: false, error: "Todo not found." };
  }

  try {
    await prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });

    revalidatePath("/todos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update todo. Please try again." };
  }
}

export async function deleteTodoAction(id: string): Promise<ActionResult> {
  const user = await getAuthUser();

  const todo = await prisma.todo.findFirst({
    where: { id, userId: user.id },
  });

  if (!todo) {
    return { success: false, error: "Todo not found." };
  }

  try {
    await prisma.todo.delete({ where: { id } });
    revalidatePath("/todos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete todo. Please try again." };
  }
}
