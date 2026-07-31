#!/usr/bin/env bash
# Trigger a deploy on the VPS via SSH. Same remote code path as the GitHub webhook.
# Sources .env.deploy from the repo root (one level up from this script).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.deploy"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found." >&2
    echo "       cp $REPO_ROOT/.env.deploy.example $ENV_FILE and fill in your VPS IP." >&2
    exit 1
fi

# Load env vars. Use set -a so all assignments are exported.
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${DEPLOY_HOST:?DEPLOY_HOST is required in .env.deploy}"
: "${DEPLOY_USER:?DEPLOY_USER is required in .env.deploy}"
: "${DEPLOY_SSH_KEY:?DEPLOY_SSH_KEY is required in .env.deploy}"
: "${DEPLOY_REMOTE_DIR:?DEPLOY_REMOTE_DIR is required in .env.deploy}"

SSH_OPTS=(-i "$DEPLOY_SSH_KEY" -p "${DEPLOY_PORT:-22}" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)

echo ">> deploying to $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_REMOTE_DIR"
# X_GITHUB_DELIVERY=manual so the deploy.sh's idempotency dedup doesn't
# conflict with a real webhook delivery. The remote script logs the prefix.
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
    "X_GITHUB_DELIVERY=manual $DEPLOY_REMOTE_DIR/scripts/deploy.sh"
