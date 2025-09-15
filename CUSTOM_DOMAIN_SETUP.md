# 🌐 Custom Domain Setup for GitHub Pages

## Current Setup
- **Repository**: https://github.com/Gnana151/truck-tracker
- **GitHub Pages URL**: https://gnana151.github.io/truck-tracker/
- **Custom Domain**: (To be configured)

## Step 1: Configure Custom Domain in GitHub

### Option A: Using GitHub Web Interface
1. Go to your repository: https://github.com/Gnana151/truck-tracker
2. Click **Settings** tab
3. Scroll to **Pages** section
4. In **Custom domain** field, enter your domain (e.g., `trucktracker.com` or `app.trucktracker.com`)
5. Check **"Enforce HTTPS"** (recommended)
6. Click **Save**

### Option B: Using CNAME File
1. Create a file named `CNAME` in your repository root
2. Add your domain name (one per line)
3. Example content:
   ```
   trucktracker.com
   ```

## Step 2: DNS Configuration

### For Root Domain (e.g., trucktracker.com)
Add these DNS records to your domain provider:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### For Subdomain (e.g., app.trucktracker.com)
Add this DNS record:

```
Type: CNAME
Name: app
Value: gnana151.github.io
```

## Step 3: Update GitHub Actions Workflow

I'll update the workflow to support custom domains:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  if: github.ref == 'refs/heads/main'
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    cname: your-domain.com  # Add your custom domain here
```

## Step 4: Verify Domain

### Check DNS Propagation
- Use tools like https://dnschecker.org
- Verify all A records point to GitHub's IPs
- Check CNAME record points to your GitHub Pages URL

### Test Domain
1. Wait 24-48 hours for DNS propagation
2. Visit your custom domain
3. Check that it redirects to your app

## Common Issues & Solutions

### Issue 1: Domain Not Working
**Solution**: Check DNS records are correct and propagated

### Issue 2: HTTPS Not Working
**Solution**: Enable "Enforce HTTPS" in GitHub Pages settings

### Issue 3: CNAME File Missing
**Solution**: Create CNAME file with your domain name

### Issue 4: DNS Propagation Delay
**Solution**: Wait 24-48 hours, check with DNS checker tools

## Step 5: Update App Configuration

Update your app.json to reflect the custom domain:

```json
{
  "expo": {
    "name": "Truck Tracker",
    "slug": "truck-tracker",
    "web": {
      "bundler": "metro",
      "output": "static",
      "baseUrl": "https://your-domain.com"
    }
  }
}
```

## Testing Your Custom Domain

1. **Check DNS**: Use https://dnschecker.org
2. **Test HTTPS**: Ensure SSL certificate is working
3. **Test App**: Verify all features work on custom domain
4. **Mobile Test**: Test on mobile devices

## Popular Domain Providers

### Free Options:
- **Freenom**: Free .tk, .ml, .ga domains
- **GitHub Student Pack**: Free domain with education

### Paid Options:
- **Namecheap**: Affordable domains
- **GoDaddy**: Popular domain registrar
- **Cloudflare**: Domain + DNS management

## Your Custom Domain Options

### Option 1: Free Subdomain
- Use: `trucktracker.tk` (from Freenom)
- Cost: Free
- Setup: CNAME record

### Option 2: Custom Domain
- Use: `trucktracker.com` (your choice)
- Cost: $10-15/year
- Setup: A records + CNAME

### Option 3: GitHub Subdomain
- Use: `gnana151.github.io/truck-tracker`
- Cost: Free
- Setup: Already working

---

**What specific custom domain issue are you facing? I can help you resolve it!**
