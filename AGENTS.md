# AGENTS.md

## Cursor Cloud specific instructions

This repo is **infrastructure/config only** — there is no application source code, and no
lint/test/build tooling. The runnable product is the n8n orchestration stack defined in
`docker-compose.yml` (Postgres + n8n + Caddy). See `README.md` for the product overview and the
production run flow.

### Environment facts (already handled by the VM snapshot)
- Docker Engine + Compose plugin are installed. Docker 29 is configured with the `fuse-overlayfs`
  storage driver and `containerd-snapshotter` disabled (see `/etc/docker/daemon.json`) — required
  for Docker-in-Docker in this VM.
- `docker` requires `sudo` in this VM (the `ubuntu` user is not in the `docker` group).
- A local `.env` (gitignored) is present with `N8N_DOMAIN=localhost` and generated
  `N8N_ENCRYPTION_KEY` / `POSTGRES_PASSWORD`. Do **not** regenerate `N8N_ENCRYPTION_KEY` on an
  existing n8n data volume — it will make stored credentials unreadable.

### Starting the Docker daemon
systemd is not running, so start `dockerd` yourself in a tmux session before using Docker:
```
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s dockerd -- bash -lc 'sudo dockerd > /tmp/dockerd.log 2>&1'
```
Check it is up with `sudo docker info`.

### Running n8n locally (dev)
The committed `docker-compose.yml` targets a VPS with a **real public domain + Caddy TLS**, which
cannot work in this VM. Use the local override `docker-compose.local.yml`, which exposes n8n over
plain HTTP on `localhost:5678` and skips Caddy:
```
sudo docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres n8n
```
Then open `http://localhost:5678`. On first run n8n asks you to create an owner account. Caddy is
production-only TLS and is intentionally not run locally (no public domain / Let's Encrypt).

### Validating the Supabase schema
`db/migrations/001_init.sql` is written for Supabase's SQL editor, but it is standard PostgreSQL and
can be validated against the local Postgres container (use a throwaway database so you don't touch
n8n's `n8n` DB):
```
sudo docker compose exec -T postgres psql -U n8n -d n8n -c "CREATE DATABASE supabase_test;"
sudo docker compose exec -T postgres psql -U n8n -d supabase_test -v ON_ERROR_STOP=1 < db/migrations/001_init.sql
```

### External integrations (not testable without secrets)
End-to-end pipeline testing needs Supabase, the Anthropic Claude API, and Google Drive OAuth, all
configured **inside the n8n UI** (per `.env.example`). The n8n workflow JSON files described in
`n8n/workflows/README.md` are not committed yet, so the full content pipeline cannot be run from the
repo alone.
