const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export const AUTH_TOKEN_KEY = "todolist.auth.token";

export type TodoList = {
  id: number;
  title: string;
  description: string;
};

export type TaskStatus = "pending" | "in_progress" | "done";

export type Task = {
  id: number;
  todo_list_id: number;
  title: string;
  description: string;
  status: TaskStatus;
};

export type AuthResponse = {
  token: string;
  expires_at: string;
};

type ApiError = {
  error?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ApiError;
      if (body.error) {
        message = body.error;
      }
    } catch {
      // Keep the status-based fallback when the API does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function authenticate(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/authenticate", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function listTodoLists(token: string): Promise<TodoList[]> {
  return request<TodoList[]>("/api/todo-lists", {
    headers: authHeaders(token),
  });
}

export function createTodoList(
  token: string,
  payload: Pick<TodoList, "title" | "description">,
): Promise<TodoList> {
  return request<TodoList>("/api/todo-lists", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteTodoList(token: string, id: number): Promise<void> {
  return request<void>(`/api/todo-lists/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function listTasks(token: string): Promise<Task[]> {
  return request<Task[]>("/api/tasks", {
    headers: authHeaders(token),
  });
}

export function createTask(
  token: string,
  payload: {
    todo_list_id: number;
    title: string;
    description: string;
    status: TaskStatus;
  },
): Promise<Task> {
  return request<Task>("/api/tasks", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteTask(token: string, id: number): Promise<void> {
  return request<void>(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
