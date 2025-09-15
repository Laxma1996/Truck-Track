# 🔐 Fix GitHub Authentication Issues

## Why Authentication is Failing
GitHub **no longer accepts password authentication** for Git operations (since August 2021). You need a **Personal Access Token** instead.

## Solution 1: Create Personal Access Token (Recommended)

### Step 1: Create Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Name**: "Truck Tracker Push Access"
4. **Expiration**: 90 days (or your preference)
5. **Scopes**: Check **"repo"** (Full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token** (starts with `ghp_`)

### Step 2: Use Token Instead of Password
Replace your password with the token:

```bash
# Instead of: Gnana151:Ganesh1883.
# Use: Gnana151:ghp_your_token_here
```

### Step 3: Update Remote URL
```bash
git remote set-url origin https://Gnana151:ghp_your_token_here@github.com/Gnana151/truck-tracker.git
```

### Step 4: Push Code
```bash
git push origin main
```

## Solution 2: Use GitHub CLI (Alternative)

### Install GitHub CLI
```bash
# Windows (using winget)
winget install GitHub.cli

# Or download from: https://cli.github.com/
```

### Login with GitHub CLI
```bash
gh auth login
# Follow the prompts to authenticate
```

### Push using GitHub CLI
```bash
gh repo create truck-tracker --public --source=. --remote=origin --push
```

## Solution 3: Use GitHub Desktop (Easiest)

### Download GitHub Desktop
1. Go to: https://desktop.github.com/
2. Download and install GitHub Desktop
3. Sign in with your GitHub account
4. Clone your repository
5. Push changes through the GUI

## Solution 4: Manual Upload (No Authentication Needed)

### Upload Files via GitHub Web Interface
1. Go to: https://github.com/Gnana151/truck-tracker
2. Click **"uploading an existing file"**
3. Upload all your files
4. Commit changes

## Quick Fix Commands

### Check Current Remote
```bash
git remote -v
```

### Update Remote with Token
```bash
git remote set-url origin https://Gnana151:YOUR_TOKEN_HERE@github.com/Gnana151/truck-tracker.git
```

### Push to Repository
```bash
git push -u origin main
```

## Why This Happened

- **Security**: Passwords can be easily compromised
- **Tokens**: More secure, can be revoked, have specific permissions
- **GitHub Policy**: All Git operations now require tokens
- **Two-Factor Auth**: If you have 2FA enabled, you MUST use tokens

## Test Authentication

### Test with Token
```bash
git ls-remote origin
```

### If Successful
You'll see the repository branches listed.

### If Failed
Check your token permissions and expiration.

---

**Choose the solution that works best for you! I recommend Solution 1 (Personal Access Token) as it's the most secure and reliable.**
