import React from "react";
import ReactDOM from "react-dom/client";
import {
  AUTH_TOKEN_KEY,
  Task,
  TaskStatus,
  TodoList,
  authenticate,
  createTask,
  createTodoList,
  deleteTask,
  deleteTodoList,
  listTasks,
  listTodoLists,
} from "./api";
import "./styles.css";

function App() {
  const [token, setToken] = React.useState(() => localStorage.getItem(AUTH_TOKEN_KEY) ?? "");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [lists, setLists] = React.useState<TodoList[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedListID, setSelectedListID] = React.useState<number | null>(null);
  const [listTitle, setListTitle] = React.useState("");
  const [listDescription, setListDescription] = React.useState("");
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskStatus, setTaskStatus] = React.useState<TaskStatus>("pending");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const selectedList = lists.find((list) => list.id === selectedListID) ?? null;
  const visibleTasks = tasks.filter((task) => task.todo_list_id === selectedListID);

  const loadData = React.useCallback(
    async (authToken = token) => {
      if (!authToken) {
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [nextLists, nextTasks] = await Promise.all([
          listTodoLists(authToken),
          listTasks(authToken),
        ]);
        setLists(nextLists);
        setTasks(nextTasks);
        setSelectedListID((current) => {
          if (current && nextLists.some((list) => list.id === current)) {
            return current;
          }
          return nextLists[0]?.id ?? null;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load todo data");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authenticate(email, password);
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      setToken(response.token);
      await loadData(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken("");
    setLists([]);
    setTasks([]);
    setSelectedListID(null);
    setPassword("");
    setError("");
  }

  async function handleCreateList(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const created = await createTodoList(token, {
        title: listTitle,
        description: listDescription,
      });
      setLists((current) => [...current, created]);
      setSelectedListID(created.id);
      setListTitle("");
      setListDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create todo list");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteList(id: number) {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await deleteTodoList(token, id);
      setLists((current) => current.filter((list) => list.id !== id));
      setTasks((current) => current.filter((task) => task.todo_list_id !== id));
      setSelectedListID((current) => (current === id ? null : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete todo list");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedListID) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const created = await createTask(token, {
        todo_list_id: selectedListID,
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
      });
      setTasks((current) => [...current, created]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id: number) {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await deleteTask(token, id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="app-shell login-page">
        <section className="login-panel" aria-labelledby="login-title">
          <h1 id="login-title">TodoList</h1>
          <p>Sign in to manage lists and tasks.</p>
          <form className="form-stack" onSubmit={handleLogin}>
            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button disabled={loading} type="submit">
              {loading ? "Signing in" : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell workspace">
      <header className="workspace-header">
        <div>
          <h1>TodoList</h1>
          <p>Authenticated workspace for todo lists and tasks.</p>
        </div>
        <button className="secondary" onClick={handleLogout} type="button">
          Log out
        </button>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <div className="workspace-grid">
        <section className="panel" aria-labelledby="lists-title">
          <div className="toolbar">
            <h2 id="lists-title">Todo lists</h2>
            <span className="status-line">{loading ? "Loading" : `${lists.length} total`}</span>
          </div>

          <form className="create-form" onSubmit={handleCreateList}>
            <label>
              List title
              <input
                name="list-title"
                onChange={(event) => setListTitle(event.target.value)}
                required
                value={listTitle}
              />
            </label>
            <label>
              Description
              <textarea
                name="list-description"
                onChange={(event) => setListDescription(event.target.value)}
                value={listDescription}
              />
            </label>
            <button disabled={loading} type="submit">
              Create list
            </button>
          </form>

          <div className="item-list" aria-label="Todo lists">
            {lists.length === 0 ? <p className="empty-state">No todo lists yet.</p> : null}
            {lists.map((list) => (
              <article
                className={`list-item ${list.id === selectedListID ? "selected" : ""}`}
                key={list.id}
              >
                <div className="item-main">
                  <div>
                    <p className="item-title">{list.title}</p>
                    {list.description ? (
                      <p className="item-description">{list.description}</p>
                    ) : null}
                  </div>
                  <div className="inline-actions">
                    <button
                      className="secondary"
                      onClick={() => setSelectedListID(list.id)}
                      type="button"
                    >
                      Select
                    </button>
                    <button
                      className="danger"
                      onClick={() => void handleDeleteList(list.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" aria-labelledby="tasks-title">
          <div className="toolbar">
            <h2 id="tasks-title">{selectedList ? `Tasks for ${selectedList.title}` : "Tasks"}</h2>
            <span className="status-line">{visibleTasks.length} visible</span>
          </div>

          {selectedList ? (
            <form className="create-form" onSubmit={handleCreateTask}>
              <label>
                Task title
                <input
                  name="task-title"
                  onChange={(event) => setTaskTitle(event.target.value)}
                  required
                  value={taskTitle}
                />
              </label>
              <label>
                Description
                <textarea
                  name="task-description"
                  onChange={(event) => setTaskDescription(event.target.value)}
                  value={taskDescription}
                />
              </label>
              <label>
                Status
                <select
                  name="task-status"
                  onChange={(event) => setTaskStatus(event.target.value as TaskStatus)}
                  value={taskStatus}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <button disabled={loading} type="submit">
                Create task
              </button>
            </form>
          ) : (
            <p className="empty-state">Create or select a todo list to manage tasks.</p>
          )}

          <div className="item-list" aria-label="Tasks">
            {selectedList && visibleTasks.length === 0 ? (
              <p className="empty-state">No tasks for this list yet.</p>
            ) : null}
            {visibleTasks.map((task) => (
              <article className="task-item" key={task.id}>
                <div className="item-main">
                  <div>
                    <p className="item-title">{task.title}</p>
                    {task.description ? (
                      <p className="item-description">{task.description}</p>
                    ) : null}
                  </div>
                  <button
                    className="danger"
                    onClick={() => void handleDeleteTask(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
                <span className="task-meta">{task.status.replace("_", " ")}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
