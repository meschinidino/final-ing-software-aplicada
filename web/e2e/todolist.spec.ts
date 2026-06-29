import { expect, request, test, type APIRequestContext } from "@playwright/test";
import { mkdirSync } from "node:fs";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:8080";
const AUTH_TOKEN_KEY = "todolist.auth.token";
const STORAGE_STATE_PATH = "test-results/api-storage-state.json";

function uniqueUser(label: string) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    email: `${label}-${stamp}@example.test`,
    password: "TestPassword123!",
  };
}

async function registerUser(api: APIRequestContext, user: { email: string; password: string }) {
  const response = await api.post(`${API_URL}/api/register`, { data: user });
  expect(response.status()).toBe(201);
}

async function authenticateUser(api: APIRequestContext, user: { email: string; password: string }) {
  const response = await api.post(`${API_URL}/api/authenticate`, { data: user });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { token: string };
  expect(body.token).toBeTruthy();
  return body.token;
}

test("logs in through the UI and stores the session token", async ({ page }) => {
  const api = await request.newContext();
  const user = uniqueUser("ui-login");
  await registerUser(api, user);

  await page.goto("/");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Todo lists" })).toBeVisible();
  await expect(page.getByText("No todo lists yet.")).toBeVisible();
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), AUTH_TOKEN_KEY))
    .toBeTruthy();

  await api.dispose();
});

test("uses API authentication storage state for an authenticated UI action", async ({
  browser,
  baseURL,
}) => {
  const api = await request.newContext();
  const user = uniqueUser("api-storage");
  await registerUser(api, user);
  const token = await authenticateUser(api, user);

  const setupContext = await browser.newContext();
  const setupPage = await setupContext.newPage();
  await setupPage.goto(baseURL ?? "/");
  await setupPage.evaluate(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: AUTH_TOKEN_KEY, value: token },
  );
  mkdirSync("test-results", { recursive: true });
  await setupContext.storageState({ path: STORAGE_STATE_PATH });
  await setupContext.close();

  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();
  await page.goto("/");

  const title = `API seeded list ${Date.now()}`;
  await page.getByLabel("List title").fill(title);
  await page.getByLabel("Description").fill("Created after API-authenticated storage setup");
  await page.getByRole("button", { name: "Create list" }).click();

  await expect(page.locator(".list-item").filter({ hasText: title })).toBeVisible();

  await context.close();
  await api.dispose();
});

test("creates and deletes a todo list and task through the UI", async ({ page }) => {
  const api = await request.newContext();
  const user = uniqueUser("ui-crud");
  await registerUser(api, user);

  await page.goto("/");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  const listTitle = `Release checklist ${Date.now()}`;
  const taskTitle = `Run Playwright ${Date.now()}`;

  await page.getByLabel("List title").fill(listTitle);
  await page.getByLabel("Description").fill("Milestone 4 validation list");
  await page.getByRole("button", { name: "Create list" }).click();
  await expect(page.locator(".list-item").filter({ hasText: listTitle })).toBeVisible();

  await page.getByLabel("Task title").fill(taskTitle);
  await page.getByLabel("Description").last().fill("Verify CRUD through the browser");
  await page.getByLabel("Status").selectOption("in_progress");
  await page.getByRole("button", { name: "Create task" }).click();

  const createdTask = page.locator(".task-item").filter({ hasText: taskTitle });
  await expect(createdTask).toBeVisible();
  await expect(createdTask.getByText("in progress")).toBeVisible();

  await createdTask.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(taskTitle)).toHaveCount(0);

  await page
    .locator(".list-item")
    .filter({ hasText: listTitle })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByText(listTitle)).toHaveCount(0);

  await api.dispose();
});
