# Send Email Edge Function

Transactional email notifications for Guild Hall using Resend API.

## Email Types

| Type | Trigger | Description |
|------|---------|-------------|
| `objective_approved` | Objective status → approved | Celebrates completed objectives |
| `objective_rejected` | Objective status → rejected | Provides revision feedback |
| `quest_completed` | User quest status → completed | Celebratory completion email with badge |
| `extension_approved` | Extension granted | Confirms new deadline |
| `extension_denied` | Extension denied | Explains denial with reason |
| `private_message` | Banner with `also_send_email=true` | GM private message to user |

## Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (for custom FROM address)
3. Create an API key

### 2. Set Supabase Secrets

```bash
# Set required secrets
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
npx supabase secrets set GUILD_NAME="Your Guild Name"
npx supabase secrets set APP_URL="https://your-guild.app"
npx supabase secrets set FROM_EMAIL="notifications@your-guild.app"

# Optional: Guild logo for emails
npx supabase secrets set GUILD_LOGO_URL="https://your-guild.app/logo.png"
```

### 3. Deploy the Function

```bash
# Deploy to Supabase
npx supabase functions deploy send-email

# Verify deployment
npx supabase functions list
```

### 4. Configure Database Settings

The database triggers need the edge function URL and service role key:

```sql
-- Run in Supabase SQL Editor
ALTER DATABASE postgres SET app.edge_function_url = 'https://your-project.supabase.co/functions/v1/send-email';
ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';
```

Or set via vault for better security:
```sql
SELECT vault.create_secret('edge_function_url', 'https://your-project.supabase.co/functions/v1/send-email');
```

### 5. Push Migration

```bash
# Push the email trigger migration
npx supabase db push
```

## Testing

### Test via cURL

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "quest_completed",
    "to": "test@example.com",
    "user_name": "Test User",
    "quest_title": "First Steps",
    "points_earned": 100
  }'
```

### Test via Supabase Dashboard

1. Go to Edge Functions → send-email → Invoke
2. Paste test payload
3. Check Resend dashboard for delivery status

## User Preferences

Users can disable email notifications in Settings → Privacy:
- Emails respect the `email_notifications` column in `privacy_settings`
- Default is `true` (emails enabled)

## Troubleshooting

### Emails not sending

1. Check Resend dashboard for errors
2. Verify `RESEND_API_KEY` secret is set
3. Check function logs: `npx supabase functions logs send-email`

### pg_net not available

The triggers use `pg_net` for async HTTP calls. If not available:
- Enable in Supabase Dashboard → Database → Extensions
- Or manually call the function from application code

### Domain verification

Resend requires domain verification for custom FROM addresses:
- Without verification, use `onboarding@resend.dev` for testing
- Add DNS records as instructed by Resend
