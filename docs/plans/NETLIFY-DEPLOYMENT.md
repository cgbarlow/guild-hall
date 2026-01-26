# Netlify Deployment Plan

## Current Status

✅ `netlify.toml` - Already configured
✅ `@netlify/plugin-nextjs` - Already installed
✅ Node 20 specified
✅ Preview/branch deploy contexts configured

## Pre-Deployment Checklist

### 1. Environment Variables (Required in Netlify UI)

Set these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g., https://guild-hall.netlify.app) | ✅ |
| `NEXT_PUBLIC_GUILD_LOGO_URL` | Custom logo URL | Optional |
| `NEXT_PUBLIC_GUILD_NAME` | Custom guild name | Optional |

### 2. Supabase Configuration

Update in Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: Set to your Netlify production URL
- **Redirect URLs**: Add:
  - `https://your-site.netlify.app/auth/callback`
  - `https://your-site.netlify.app/auth/confirm`
  - `https://*.netlify.app/auth/callback` (for preview deploys)

### 3. Build Verification

```bash
# Run locally to verify build succeeds
npm run build
```

### 4. Netlify Configuration Updates

#### netlify.toml enhancements:
- Add security headers
- Configure redirects for SPA routing
- Add build caching

## Deployment Steps

### Step 1: Connect Repository
1. Go to Netlify Dashboard
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and authorize
4. Choose `cgbarlow/guild-hall` repository
5. Branch: `main`

### Step 2: Configure Build Settings
Netlify should auto-detect from `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 20

### Step 3: Set Environment Variables
Add all required variables from section 1 above.

### Step 4: Deploy
1. Click "Deploy site"
2. Monitor build logs for errors
3. Test the deployed site

### Step 5: Configure Custom Domain (Optional)
1. Site settings → Domain management
2. Add custom domain
3. Configure DNS
4. Enable HTTPS

## Post-Deployment Verification

- [ ] Landing page loads with background image
- [ ] Authentication flow works (login/register)
- [ ] OAuth providers work (if configured)
- [ ] Quest images load from Supabase storage
- [ ] Badge images display correctly
- [ ] All themes work (Light/Warm/Dark)
- [ ] Mobile responsiveness

## Rollback Plan

If issues occur:
1. Netlify Dashboard → Deploys
2. Find last working deploy
3. Click "Publish deploy"

## Performance Optimizations (Future)

- [ ] Enable Netlify Edge Functions for middleware
- [ ] Configure asset caching headers
- [ ] Set up Netlify Analytics
- [ ] Configure build plugins for optimization
