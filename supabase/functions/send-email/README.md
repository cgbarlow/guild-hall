# Send Email Edge Function

Transactional email notifications for Guild Hall using Mailjet API.

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

### 1. Get Mailjet API Credentials

1. Log in to [Mailjet](https://app.mailjet.com)
2. Go to **Account Settings → API Key Management**
3. Copy your **API Key** and **Secret Key**

### 2. Set Supabase Secrets

```bash
# Set required secrets
npx supabase secrets set MAILJET_API_KEY=your_api_key_here
npx supabase secrets set MAILJET_SECRET_KEY=your_secret_key_here
npx supabase secrets set GUILD_NAME="Your Guild Name"
npx supabase secrets set APP_URL="https://your-guild.app"
npx supabase secrets set FROM_EMAIL="notifications@your-guild.app"
npx supabase secrets set FROM_NAME="Your Guild Name"

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
3. Check Mailjet dashboard for delivery status

## User Preferences

Users can disable email notifications in Settings → Privacy:
- Emails respect the `email_notifications` column in `privacy_settings`
- Default is `true` (emails enabled)

## Troubleshooting

### Emails not sending

1. Check Mailjet dashboard for errors (Statistics → Email logs)
2. Verify `MAILJET_API_KEY` and `MAILJET_SECRET_KEY` secrets are set
3. Check function logs: `npx supabase functions logs send-email`

### pg_net not available

The triggers use `pg_net` for async HTTP calls. If not available:
- Enable in Supabase Dashboard → Database → Extensions
- Or manually call the function from application code

### Sender verification

Mailjet requires sender address verification:
- Verify your sending domain in Mailjet → Senders & Domains
- Add SPF/DKIM records as instructed by Mailjet
