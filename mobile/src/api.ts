const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export const MOBILE_AUTH_TOKEN_KEY = "todolist.mobile.auth.token";
export const MOBILE_TODO_CACHE_KEY = "todolist.mobile.todo.snapshot";

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

export type TodoSnapshot = {
  saved_at: string;
  lists: TodoList[];
  tasks: Task[];
};

type ApiError = {
  error?: string;
};

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

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
    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function register(email: string, password: string): Promise<void> {
  await request<void>("/api/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function authenticate(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/authenticate", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loadTodoSnapshot(token: string): Promise<TodoSnapshot> {
  const [lists, tasks] = await Promise.all([
    request<TodoList[]>("/api/todo-lists", { headers: authHeaders(token) }),
    request<Task[]>("/api/tasks", { headers: authHeaders(token) }),
  ]);

  return {
    saved_at: new Date().toISOString(),
    lists,
    tasks,
  };
}

export function readCachedSnapshot(): TodoSnapshot | null {
  const raw = localStorage.getItem(MOBILE_TODO_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as TodoSnapshot;
    if (!Array.isArray(parsed.lists) || !Array.isArray(parsed.tasks) || !parsed.saved_at) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedSnapshot(snapshot: TodoSnapshot) {
  localStorage.setItem(MOBILE_TODO_CACHE_KEY, JSON.stringify(snapshot));
}
