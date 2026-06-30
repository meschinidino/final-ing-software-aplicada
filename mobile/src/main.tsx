import React from "react";
import ReactDOM from "react-dom/client";
import {
  IonApp,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from "@ionic/react";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import {
  MOBILE_AUTH_TOKEN_KEY,
  ApiRequestError,
  TodoSnapshot,
  authenticate,
  loadTodoSnapshot,
  readCachedSnapshot,
  register,
  writeCachedSnapshot,
} from "./api";
import "./styles.css";

type AuthMode = "login" | "register";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function App() {
  const [token, setToken] = React.useState(() => localStorage.getItem(MOBILE_AUTH_TOKEN_KEY) ?? "");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authMode, setAuthMode] = React.useState<AuthMode>("login");
  const [snapshot, setSnapshot] = React.useState<TodoSnapshot | null>(() => readCachedSnapshot());
  const [usingCache, setUsingCache] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const loadData = React.useCallback(
    async (authToken = token) => {
      if (!authToken) {
        return;
      }

      setLoading(true);
      setMessage("");
      try {
        const nextSnapshot = await loadTodoSnapshot(authToken);
        writeCachedSnapshot(nextSnapshot);
        setSnapshot(nextSnapshot);
        setUsingCache(false);
      } catch (err) {
        if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
          setToken("");
          setSnapshot(null);
          setUsingCache(false);
          setMessage("Session expired. Sign in again to load protected todo data.");
          return;
        }

        const cached = readCachedSnapshot();
        if (cached) {
          setSnapshot(cached);
          setUsingCache(true);
          const reason = err instanceof Error ? err.message : "API unavailable";
          setMessage(`Showing cached data because fresh loading failed: ${reason}`);
        } else {
          setSnapshot(null);
          setUsingCache(false);
          setMessage(err instanceof Error ? err.message : "Could not load todo data");
        }
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleAuthenticate() {
    setLoading(true);
    setMessage("");
    try {
      if (authMode === "register") {
        await register(email, password);
      }

      const response = await authenticate(email, password);
      localStorage.setItem(MOBILE_AUTH_TOKEN_KEY, response.token);
      setToken(response.token);
      await loadData(response.token);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not authenticate");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
    setToken("");
    setPassword("");
    setUsingCache(false);
    setMessage("");
  }

  const taskCount = snapshot?.tasks.length ?? 0;
  const listCount = snapshot?.lists.length ?? 0;

  return (
    <IonApp>
      <IonPage>
        <IonContent className="app-page" fullscreen>
          {!token ? (
            <main className="screen login-screen">
              <div className="brand-block">
                <h1>TodoList</h1>
                <p>Mobile access for lists, tasks, and offline review.</p>
              </div>

              <section className="auth-panel" aria-label="Authentication">
                <IonSegment
                  className="mode-tabs"
                  onIonChange={(event) => setAuthMode(event.detail.value as AuthMode)}
                  value={authMode}
                >
                  <IonSegmentButton value="login">Sign in</IonSegmentButton>
                  <IonSegmentButton value="register">Register</IonSegmentButton>
                </IonSegment>

                <div className="field-stack">
                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      autocomplete="email"
                      inputmode="email"
                      onIonInput={(event) => setEmail(String(event.detail.value ?? ""))}
                      required
                      type="email"
                      value={email}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput
                      autocomplete={authMode === "login" ? "current-password" : "new-password"}
                      onIonInput={(event) => setPassword(String(event.detail.value ?? ""))}
                      required
                      type="password"
                      value={password}
                    />
                  </IonItem>

                  {message ? <div className="status-pill error">{message}</div> : null}

                  <IonButton
                    className="primary-action"
                    disabled={loading || !email || !password}
                    expand="block"
                    onClick={() => void handleAuthenticate()}
                  >
                    {loading ? <IonSpinner name="crescent" /> : authMode === "login" ? "Sign in" : "Create account"}
                  </IonButton>
                </div>
              </section>
            </main>
          ) : (
            <main className="screen">
              <header className="workspace-header">
                <div className="header-copy">
                  <h1>TodoList</h1>
                  <p>{listCount} lists and {taskCount} tasks available on this device.</p>
                </div>
                <div className="header-actions">
                  <IonButton disabled={loading} onClick={() => void loadData()} size="small">
                    {loading ? <IonSpinner name="crescent" /> : "Refresh"}
                  </IonButton>
                  <IonButton fill="outline" onClick={handleLogout} size="small">
                    Log out
                  </IonButton>
                </div>
              </header>

              <div className="status-strip" aria-live="polite">
                {usingCache ? (
                  <div className="status-pill cached">
                    Offline cache from {snapshot ? formatSavedAt(snapshot.saved_at) : "last session"}
                  </div>
                ) : snapshot ? (
                  <div className="status-pill">Fresh data loaded {formatSavedAt(snapshot.saved_at)}</div>
                ) : null}
                {message ? <div className="status-pill error">{message}</div> : null}
              </div>

              <section className="content-panel" aria-labelledby="todo-data-title">
                <div className="panel-heading">
                  <h2 id="todo-data-title">Todo data</h2>
                  <span className="counter">{loading ? "Loading" : `${listCount} lists`}</span>
                </div>

                {!snapshot || snapshot.lists.length === 0 ? (
                  <div className="empty-state">
                    No todo lists are available yet. Create data from the web app or API, then refresh here.
                  </div>
                ) : (
                  <div className="list-stack">
                    {snapshot.lists.map((list) => {
                      const tasks = snapshot.tasks.filter((task) => task.todo_list_id === list.id);
                      return (
                        <article className="list-card" key={list.id}>
                          <h3>{list.title}</h3>
                          {list.description ? <p className="muted">{list.description}</p> : null}
                          {tasks.length === 0 ? (
                            <p className="muted">No tasks in this list.</p>
                          ) : (
                            <ul className="task-list" aria-label={`Tasks for ${list.title}`}>
                              {tasks.map((task) => (
                                <li className="task-item" key={task.id}>
                                  <span className="task-title">{task.title}</span>
                                  <span className="task-status">{formatStatus(task.status)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </main>
          )}
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
