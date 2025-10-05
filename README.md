
This repository contains a simple, client-side To‑Do List web app with login, deadlines, and task management features. It's built with plain HTML, CSS, and JavaScript and stores data in the browser's localStorage.

## Quick features
- Login page (demo — accepts any non-empty username/password).
- Add tasks with a required due date.
- Checkbox-style completion toggle (click the round checkbox).
- Inline edit (Edit → input + Save/Cancel). Empty edits can optionally delete the task.
- Delete individual tasks (Delete button).
- Tasks show a due-date badge and overdue tasks are highlighted.
- Filters for All / Completed / Pending via the stat boxes with live counts.
- Persistent storage via `localStorage` so tasks persist across reloads.

## Files of interest
- `To-Do List.html` — the main app UI (opens the task list after login).
- `To-Do List.css` — app styling (background, container, components).
- `To-Do List.js` — main app logic: add/edit/delete/toggle/filter/persistence.
- `login.html`, `login.css`, `login.js` — login page and logic (local demo auth).

## Run locally
1. Clone the repo and open the workspace folder.
2. Open `login.html` in your browser and sign in (any non-empty credentials will work).
3. After signing in you'll be redirected to `To-Do List.html`.

Or open `To-Do List.html` directly — it will redirect to the login page if you're not signed in.

## Usage notes
- Adding tasks: type the task, choose a due date (required), then click Add or press Enter.
- Editing: click Edit to open an inline editor where you can change text and due date; Save or Cancel.
- Completing: click the circular checkbox to mark complete; completed tasks are counted in the Completed box.
- Filtering: click the stat boxes (All / Completed / Pending) to filter the list.
- Logout: click the Logout button at the top-right to sign out.

## Data & behavior
- Tasks are stored as JSON in `localStorage` under the key `todo_tasks_v1`.
- Login demo stores a `todo_logged_in` flag in `localStorage`.

## Potential improvements
- Add server-backed authentication and storage for multi-device sync.
- Add due-date reminders/notifications.
- Add sorting (by due date, priority) and drag-to-reor

