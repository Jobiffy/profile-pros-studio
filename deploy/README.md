# Deploy runbook

The app is built on GitHub Actions and rsync'd as static files to an EC2
instance. nginx serves it at `https://ai.jobiffy.co/ai-resume-builder/`.

## What's in this directory

| File | Purpose |
|---|---|
| `nginx.conf` | Server block for `ai.jobiffy.co` — copy to `/etc/nginx/sites-available/`. |
| `ec2-bootstrap.sh` | One-time setup for a fresh Ubuntu EC2: installs nginx, creates `deploy` user, opens UFW. |
| `README.md` | This file. |

The Actions workflow itself lives at [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

## First-time deploy — the path from a fresh EC2 to a live site

These steps are one-time. After they're done, every push to `main` deploys
automatically.

### 1. EC2 bootstrap (on the instance, one time)

SSH in with the keypair you used at launch:

```bash
ssh -i ~/.ssh/jobiffy-ai-resume-builder.pem ubuntu@3.6.89.151
```

Pull this repo (or just upload `deploy/ec2-bootstrap.sh`) and run it:

```bash
sudo bash ec2-bootstrap.sh
```

That installs nginx + certbot, creates the `deploy` user, prepares
`/var/www/dev/ai-resume-builder`, and enables UFW.

### 2. nginx config

Still on the instance:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/ai.jobiffy.co
sudo ln -sf /etc/nginx/sites-available/ai.jobiffy.co \
            /etc/nginx/sites-enabled/ai.jobiffy.co
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 3. AWS security group

In the EC2 console, edit the instance's security group. Inbound rules:

| Type | Port | Source |
|---|---|---|
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| SSH | 22 | your IP only |

UFW on the instance is now also restricting these — both layers must allow.

### 4. DNS

In your domain registrar (GoDaddy, per the existing records on `jobiffy.co`):

```text
Type   Name   Value           TTL
A      ai     3.6.89.151      1 Hour
```

Wait ~1 minute for propagation, then:

```bash
dig ai.jobiffy.co +short
# expect: 3.6.89.151
```

### 5. HTTPS via Let's Encrypt

After DNS resolves to the instance:

```bash
sudo certbot --nginx -d ai.jobiffy.co
```

certbot rewrites the nginx config in place to add the 443 server block and a
301 redirect from 80. Renewal is auto-scheduled via systemd timer.

### 6. SSH key for the deploy user

On your laptop, generate a deploy-only keypair (don't reuse your AWS
keypair):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/jobiffy_deploy -C "github-actions deploy" -N ""
```

Append the public key to the deploy user on the instance:

```bash
# Run from the instance, with sudo:
sudo bash -c 'cat >> /home/deploy/.ssh/authorized_keys' <<< "<paste contents of ~/.ssh/jobiffy_deploy.pub>"
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Test from your laptop:

```bash
ssh -i ~/.ssh/jobiffy_deploy deploy@3.6.89.151 'whoami && ls /var/www/dev/ai-resume-builder'
```

If that prints `deploy` and the directory listing, you're set.

### 7. GitHub Actions secrets

In the repo: Settings → Secrets and variables → Actions → New repository
secret. Add three:

| Name | Value |
|---|---|
| `EC2_HOST` | `3.6.89.151` (or `ai.jobiffy.co` once DNS is live) |
| `EC2_USER` | `deploy` |
| `EC2_SSH_KEY` | the **entire** contents of `~/.ssh/jobiffy_deploy` (the private file, including the BEGIN/END lines). |

### 8. Supabase auth allowed redirect URLs

The Google OAuth and magic-link flows redirect back to
`window.location.origin + import.meta.env.BASE_URL`. In production that's
`https://ai.jobiffy.co/ai-resume-builder/`. Add it to:

> Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

so the auth callback is accepted. Also update **Site URL** to the same.

### 9. Trigger the first deploy

```bash
git push origin main
```

or run the workflow manually from the Actions tab (it's gated on
`workflow_dispatch`). Watch the run; it should finish in ~90 seconds.
After it succeeds, hit `https://ai.jobiffy.co/ai-resume-builder/` in a
browser. You should see the Landing page.

## Day 2: regular deploys

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. Checkout, `npm ci`, `npm run build`.
2. SSH-rsync `dist/` (minus `index.html`) to the instance — new hashed
   assets land alongside old ones.
3. SSH-rsync `index.html` last, so visitors atomically flip from the old
   bundle to the new one.
4. Sweep `dist/assets/*` files older than 14 days.

No nginx reload is needed; nginx serves whatever's on disk.

## Troubleshooting

**Build failed in Actions, "EACCES" on `/var/www/dev/ai-resume-builder`.**
The deploy user doesn't own the directory. On the instance:
`sudo chown -R deploy:www-data /var/www/dev`.

**`nginx -t` says "host not found in upstream".**
You probably used a non-existent server block include. The config in this
repo only `listen`s on 80 and serves static files, no upstream. Re-paste it.

**OAuth lands on `/auth/callback` and 404s.**
Supabase's allowed redirect URL list doesn't include
`https://ai.jobiffy.co/ai-resume-builder/`. Step 8.

**SPA route refresh (e.g. /ai-resume-builder/builder) gives 404.**
The `try_files` fallback isn't in nginx. Re-check that
`/etc/nginx/sites-enabled/ai.jobiffy.co` matches `deploy/nginx.conf` and
nginx has been reloaded.

**Certbot fails with "DNS problem".**
DNS hasn't propagated yet, or AWS security group is blocking port 80 from
the world (Let's Encrypt's HTTP-01 challenge needs port 80 open).

**Deploy succeeded but the site still shows the old version.**
Browser cache. Hard reload (Ctrl+Shift+R). The `index.html` Cache-Control
header is `no-cache`, so any actual cache miss serves the new shell.
