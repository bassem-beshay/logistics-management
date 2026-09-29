# Logistics Management System

Full-stack delivery operations system built with Frappe (server) and React 18 (client).

## What it solves

Dispatchers create open delivery orders and group them into a driver's ordered run. A driver then executes only their own stops. The server, not the browser, owns every state transition and updates the linked Order, Stop, Run, and Driver together.

## Repository layout

- `backend/logistics_management`: installable Frappe application.
- `frontend`: React 18 + Vite operations UI.

## Status flow

```
Order: Open -> Assigned -> En Route -> Delivered -> Cash Banked
                                  \-> Failed
Run:   Draft -> Assigned -> En Route -> Completed -> Cash Banked
Driver Available -> On Run -> Available
```

Only delivered orders contribute cash. Failed orders are never banked.

## Run locally on Windows + WSL

The backend must run inside Linux/WSL. The React frontend runs from Windows PowerShell. The prepared local environment in this repository uses:

| Service | Address |
| --- | --- |
| Frappe backend | `http://localhost:8001` |
| React frontend | `http://localhost:5173` |
| MariaDB | `127.0.0.1:3307` inside WSL |
| Redis cache | `127.0.0.1:13000` inside WSL |
| Redis queue | `127.0.0.1:11000` inside WSL |
| Frappe site | `logistics.localhost` |

### 1. Start the backend

Open PowerShell and enter Ubuntu:

```powershell
wsl -d Ubuntu-24.04
```

After a fresh WSL restart, start MariaDB and both Redis processes. Skip a command if that port is already listening.

```bash
sudo mkdir -p /home/frappe/logistics-local/run /home/frappe/logistics-local/logs /home/frappe/frappe-bench/config/pids

sudo mariadbd --no-defaults \
  --datadir=/home/frappe/logistics-local/mariadb \
  --socket=/home/frappe/logistics-local/run/mariadb.sock \
  --pid-file=/home/frappe/logistics-local/run/mariadb.pid \
  --port=3307 \
  --bind-address=127.0.0.1 \
  --skip-log-bin \
  --user=root \
  --log-error=/home/frappe/logistics-local/logs/mariadb.log &

sudo -u frappe redis-server /home/frappe/frappe-bench/config/redis_cache.conf --daemonize yes
sudo -u frappe redis-server /home/frappe/frappe-bench/config/redis_queue.conf --daemonize yes
```

Check the required ports:

```bash
ss -ltn | grep -E ':(3307|13000|11000)'
```

Then start Frappe in the foreground:

```bash
cd /home/frappe/frappe-bench
sudo -u frappe /usr/local/bin/bench --site logistics.localhost serve --port 8001 --noreload
```

Keep that terminal open. Frappe should now be available at [http://localhost:8001](http://localhost:8001).

### 2. Install or update the backend app

Run these commands inside WSL when setting up the app for the first time or after backend schema changes:

```bash
cd /home/frappe/frappe-bench
sudo -u frappe ./env/bin/pip install -e /mnt/c/Users/Dell/Desktop/task/backend/logistics_management
grep -qxF logistics_management sites/apps.txt || echo logistics_management | sudo -u frappe tee -a sites/apps.txt
sudo -u frappe /usr/local/bin/bench --site logistics.localhost install-app logistics_management
sudo -u frappe /usr/local/bin/bench --site logistics.localhost migrate
```

`install-app` is only needed once. On an existing site, confirm installation with:

```bash
cd /home/frappe/frappe-bench
sudo -u frappe /usr/local/bin/bench --site logistics.localhost list-apps
sudo -u frappe /usr/local/bin/bench --site logistics.localhost migrate
```

Installation creates the three Frappe roles: `Logistics Manager`, `Logistics Dispatcher`, and `Logistics Driver`. Assign each account its appropriate role and link each driver account to a Driver record using the `user` field.

### 3. Start the React frontend

Open a second Windows PowerShell window:

```powershell
Set-Location C:\Users\Dell\Desktop\task\frontend

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

npm install
npm run dev -- --host localhost
```

Open [http://localhost:5173](http://localhost:5173). Use `localhost` for both frontend and backend so the Frappe session cookie stays on the same hostname.

### 4. Sign in and open the correct role route

1. Sign in through [http://localhost:8001/login](http://localhost:8001/login).
2. In the same browser profile, open the route for the account role:

```text
Admin:  http://localhost:5173/admin
User:   http://localhost:5173/user
Driver: http://localhost:5173/driver
```

The frontend obtains the CSRF token from the authenticated `me` endpoint and proxies `/api` to Frappe. For local development, keep `VITE_FRAPPE_URL` empty and use `FRAPPE_PROXY_TARGET=http://localhost:8001` in `frontend/.env`.

### 5. Build and verify

From Windows PowerShell:

```powershell
Set-Location C:\Users\Dell\Desktop\task\frontend
npm run build
npm audit --omit=dev
```

Check both services:

```powershell
curl.exe -I http://localhost:8001/login
curl.exe -I http://localhost:5173/admin
```

Run the backend integration tests on a disposable/test site inside WSL:

```bash
cd /home/frappe/frappe-bench
sudo -u frappe /usr/local/bin/bench --site logistics-test.local set-config allow_tests true
sudo -u frappe /usr/local/bin/bench --site logistics-test.local run-tests --app logistics_management
```

### Troubleshooting

- `403` from `/api/method/logistics_management.api.me`: sign in to Frappe first and use the same browser profile and hostname.
- Frontend cannot reach Frappe: confirm port `8001` is listening and `FRAPPE_PROXY_TARGET` points to `http://localhost:8001`.
- MariaDB connection error: confirm port `3307` and `/home/frappe/logistics-local/run/mariadb.pid`.
- Redis connection error: confirm ports `13000` and `11000`.
- Do not run Bench with native Windows Python; use WSL.

## Role-based frontend routes

The React client presents three deliberately separate experiences while preserving the existing Frappe roles and API contracts:

| Frontend route | Existing Frappe role | Experience |
| --- | --- | --- |
| `/user` | `Logistics Dispatcher` | Request and follow deliveries without driver-management or admin metrics |
| `/driver` | `Logistics Driver` | Current assignment, next stop, delivery outcomes, and route completion |
| `/admin` | `Logistics Manager` | Operations summary, orders, runs, drivers, exceptions, and cash reconciliation |

After session bootstrap, the frontend redirects each account to its own route and prevents cross-role navigation in the client. Server permissions remain authoritative and unchanged. Admin subsections use `/admin/orders`, `/admin/runs`, and `/admin/drivers`.

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

The backend was verified on Frappe 17 using an isolated Linux/WSL site and MariaDB instance: all 6 integration tests pass and Python modules pass `compileall`. The frontend is now a React application; run `npm run build` after dependency installation to verify the current client bundle.
