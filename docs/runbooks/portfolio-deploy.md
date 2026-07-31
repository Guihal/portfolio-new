# Portfolio deploy runbook

## Primary auto-deploy

Pushes to `master` on `github.com/Guihal/portfolio-new` fire a GitHub webhook
to `https://portfolio.dmtr.ru/webhook/portfolio-deploy`. The webhook
receiver (soulteary/webhook) verifies the HMAC signature and runs
`/srv/portfolio/scripts/deploy.sh` on the VPS. This is the only path that
auto-deploys — no local post-push hook is configured (lefthook v2.1.10
does not support `post-push`).

## Manual deploy from the dev box

```bash
bun scripts/deploy-remote.sh
```

The script sources `.env.deploy`, ssh's to the VPS, and runs the same
remote deploy.sh with `X_GITHUB_DELIVERY=manual`. The `manual*|local*`
prefix in deploy.sh's dedup-skip branch ensures manual deploys always
proceed.

## Manual deploy over ssh (when the dev box is gone)

```bash
ssh -i ~/.ssh/subbrain_deploy root@95.163.152.76 \
  "X_GITHUB_DELIVERY=manual /srv/portfolio/scripts/deploy.sh"
```

## HMAC secret rotation

The single-secret approach is in use. Rotation = brief deploy downtime.

1. On host: edit `/etc/webhook/secret.env` to the new value.
2. `systemctl restart webhook` — re-renders hooks.json from the template
   on every start; the new secret is active.
3. In the GitHub webhook UI (`https://github.com/Guihal/portfolio-new/settings/hooks`),
   click the webhook, change "Secret" to the new value, save.
4. Push a trivial commit to verify the new secret matches.

For zero-downtime rotation (v2): add a second `or` rule in `hooks.json.tpl`
matching a second secret file (`/etc/webhook/secret.v2.env`), run both
secrets in parallel for 24h, then drop the old one.

## Coupled failure recovery (portfolio cert + webhook)

The webhook and portfolio share the `portfolio.dmtr.ru` site block in
Caddy. If the LE cert for `portfolio.dmtr.ru` fails to issue, the entire
block fails to load and the webhook returns 404.

Recovery:
- `ssh` in, run `journalctl -u caddy-app -n 50` to see the cert error.
- If rate-limited or DNS-misconfigured, fix and force reissue:
  `systemctl restart caddy-app`.
- Until the cert is fixed, deploys are blocked. Use the manual deploy
  paths above.
