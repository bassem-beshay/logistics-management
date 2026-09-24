# Logistics Management System

Full-stack delivery operations system built with Frappe (server) and Vue 3 (client).

## What it solves

Dispatchers create open delivery orders and group them into a driver's ordered run. A driver then executes only their own stops. The server, not the browser, owns every state transition and updates the linked Order, Stop, Run, and Driver together.

## Repository layout

- `backend/logistics_management`: installable Frappe application.
- `frontend`: Vue 3 + Vite operations UI.

## Status flow

```
Order: Open -> Assigned -> En Route -> Delivered -> Cash Banked
                                  \-> Failed
Run:   Draft -> Assigned -> En Route -> Completed -> Cash Banked
Driver Available -> On Run -> Available
```

Only delivered orders contribute cash. Failed orders are never banked.

## Frappe setup (Linux/WSL)

Frappe Bench must run in Linux, not native Windows Python.

```bash
bench get-app /path/to/logistics-management/backend/logistics_management
bench --site logistics.local install-app logistics_management
bench --site logistics.local migrate
```

Installation creates the three Frappe roles: `Logistics Manager`, `Logistics Dispatcher`, and `Logistics Driver`. Assign each user the appropriate role, then link each driver user to a Driver record using the `user` field.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_FRAPPE_URL` to the Frappe site origin. The UI uses the active Frappe session cookie and obtains the session CSRF token from the authenticated `me` endpoint. Log in through Frappe first. For a separate development origin, configure Frappe CORS for that exact origin and allow credentialed requests; a same-origin reverse proxy is recommended for production.

## Assumptions

- One Assigned or En Route run per driver is enforced by server-side locks and driver status.
- A driver can only update stops on their own `En Route` run.
- Banking is a manager action, because it finalizes cash accountability.
- Stop details snapshot the order customer/address/cash values at build time for an auditable route.

## Secure operation endpoints

All mutations are `POST` methods under `/api/method/logistics_management.api` and require a logged-in Frappe session.

| Action | Endpoint | Allowed roles |
| --- | --- | --- |
| Build run | `build_delivery_run` | Manager, Dispatcher |
| Start run | `start_delivery_run` | Manager, Dispatcher |
| Mark delivered / failed | `mark_stop_delivered`, `mark_stop_failed` | Manager, assigned Driver |
| Complete run | `complete_delivery_run` | Manager, assigned Driver |
| Bank cash | `bank_cash` | Manager |

The generic Frappe REST resources are used only for safe records and lists. Lifecycle fields are guarded in the server-side document controllers, so direct REST attempts to change order/run status or stops are rejected. Dispatcher permissions on Delivery Run are read-only; the explicit action endpoints perform the authorized transitions inside the request transaction.

## Tests

Run the integration suite on a disposable or test Bench site:

```bash
bench --site logistics-test.local set-config allow_tests true
bench --site logistics-test.local run-tests --app logistics_management
```

The suite covers the complete cash workflow, stop ownership, direct workflow-bypass attempts, driver deactivation during an active run, open-order/capacity rules, and invalid values.

## Verification completed

Verified on Frappe 17 using an isolated Linux/WSL site and MariaDB instance: all 6 integration tests pass. `npm run build` passes for the Vue application, Python modules pass `compileall`, and Manager/Driver role-aware screens were exercised in a real browser with mocked API data.
