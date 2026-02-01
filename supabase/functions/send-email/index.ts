// Supabase Edge Function: send-email
// Sends transactional emails for Guild Hall notifications
// Uses Mailjet API for email delivery

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY')
const MAILJET_SECRET_KEY = Deno.env.get('MAILJET_SECRET_KEY')
const GUILD_NAME = Deno.env.get('GUILD_NAME') || 'Guild Hall'
const GUILD_LOGO_URL = Deno.env.get('GUILD_LOGO_URL') || ''
const APP_URL = Deno.env.get('APP_URL') || 'https://guild-hall.app'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@guild-hall.app'
const FROM_NAME = Deno.env.get('FROM_NAME') || GUILD_NAME

// Email types
type EmailType =
  | 'objective_approved'
  | 'objective_rejected'
  | 'quest_completed'
  | 'extension_approved'
  | 'extension_denied'
  | 'private_message'

interface EmailPayload {
  type: EmailType
  to: string
  user_name: string
  // Common fields
  quest_title?: string
  quest_id?: string
  user_quest_id?: string
  // Objective specific
  objective_title?: string
  feedback?: string
  // Extension specific
  new_deadline?: string
  original_deadline?: string
  reason?: string
  // Private message specific
  message_title?: string
  message_content?: string
  gm_name?: string
  // Quest completion
  points_earned?: number
  badge_url?: string
}

// Brand colors from the Guild Hall theme
const BRAND = {
  gold: '#B8860B',
  cream: '#FDF8E8',
  accentGold: '#C9A857',
  textDark: '#3D2E1F',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
}

const LOGO_URL = 'https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png'

function getBaseTemplate(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Guild Hall - ${GUILD_NAME}</title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND.cream}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0; }
    .content { padding: 32px 24px; color: ${BRAND.textDark}; }
    .hero { text-align: center; padding: 24px 0; }
    .hero-icon { font-size: 48px; }
    .hero-text { font-size: 28px; font-weight: bold; color: ${BRAND.textDark}; margin: 16px 0 8px 0; }
    .button { display: inline-block; background-color: ${BRAND.gold}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .button:hover { background-color: ${BRAND.accentGold}; }
    .footer { background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666; }
    .badge-img { max-width: 120px; margin: 16px auto; display: block; }
    .feedback-box { background-color: #f5f5f5; border-left: 4px solid ${BRAND.gold}; padding: 16px; margin: 16px 0; }
    .stats { display: flex; justify-content: center; gap: 32px; margin: 24px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: ${BRAND.gold}; }
    .stat-label { font-size: 14px; color: #666666; }
    @media only screen and (max-width: 600px) {
      .content { padding: 24px 16px; }
      .stats { flex-direction: column; gap: 16px; }
    }
  </style>
</head>
<body>
  <!-- Preview text -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <div class="container">
    <div class="header">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</td>
          <td style="text-align: center;"><img src="${LOGO_URL}" alt="Logo" style="height: 28px; vertical-align: middle;"></td>
          <td style="text-align: right; font-size: 18px; font-weight: 600; color: #3D2E1F;">${GUILD_NAME}</td>
        </tr>
      </table>
    </div>

    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <p>This email was sent by ${GUILD_NAME}</p>
      <p>
        <a href="${APP_URL}/settings/privacy" style="color: #666666;">Email Preferences</a> |
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}

function getEmailContent(payload: EmailPayload): { subject: string; html: string } {
  switch (payload.type) {
    case 'objective_approved':
      return {
        subject: `✅ Objective Complete: ${payload.objective_title}`,
        html: getBaseTemplate(
          `
          <div class="hero">
            <div class="hero-icon">✅</div>
            <div class="hero-text">Well Done!</div>
            <p>Your objective has been approved</p>
          </div>

          <p>Hey ${payload.user_name},</p>

          <p>Great news! Your submission for <strong>"${payload.objective_title}"</strong> in the quest <strong>"${payload.quest_title}"</strong> has been approved!</p>

          ${payload.feedback ? `
          <div class="feedback-box">
            <strong>GM Feedback:</strong><br>
            ${payload.feedback}
          </div>
          ` : ''}

          <p style="text-align: center;">
            <a href="${APP_URL}/my-quests/${payload.user_quest_id}" class="button">View Quest Progress</a>
          </p>

          <p>Keep up the great work, adventurer!</p>
          `,
          `Your objective "${payload.objective_title}" has been approved!`
        ),
      }

    case 'objective_rejected':
      return {
        subject: `📝 Feedback on Your Submission: ${payload.objective_title}`,
        html: getBaseTemplate(
          `
          <div class="hero">
            <div class="hero-icon">📝</div>
            <div class="hero-text">Revision Needed</div>
            <p>Your submission needs some adjustments</p>
          </div>

          <p>Hey ${payload.user_name},</p>

          <p>Your submission for <strong>"${payload.objective_title}"</strong> in the quest <strong>"${payload.quest_title}"</strong> needs some revision.</p>

          ${payload.feedback ? `
          <div class="feedback-box">
            <strong>GM Feedback:</strong><br>
            ${payload.feedback}
          </div>
          ` : ''}

          <p>Don't worry - this is all part of the journey! Review the feedback above and give it another shot.</p>

          <p style="text-align: center;">
            <a href="${APP_URL}/my-quests/${payload.user_quest_id}" class="button">Revise Submission</a>
          </p>
          `,
          `Feedback on your submission for "${payload.objective_title}"`
        ),
      }

    case 'quest_completed':
      return {
        subject: `🎉 Quest Complete! ${payload.quest_title}`,
        html: getBaseTemplate(
          `
          <div class="hero">
            <div class="hero-icon">🏆</div>
            <div class="hero-text">VICTORY!</div>
            <p>You have completed the quest!</p>
          </div>

          ${payload.badge_url ? `<img src="${payload.badge_url}" alt="Quest Badge" class="badge-img" />` : ''}

          <p>Congratulations, ${payload.user_name}!</p>

          <p>You have successfully completed <strong>"${payload.quest_title}"</strong>!</p>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">+${payload.points_earned || 0}</div>
              <div class="stat-label">Points Earned</div>
            </div>
          </div>

          <p style="text-align: center;">Your achievement has been recorded in the guild ledger. May this victory fuel your next adventure!</p>

          <p style="text-align: center;">
            <a href="${APP_URL}/quests" class="button">Find Your Next Quest</a>
          </p>
          `,
          `Congratulations! You completed "${payload.quest_title}" and earned ${payload.points_earned} points!`
        ),
      }

    case 'extension_approved':
      return {
        subject: `⏰ Extension Granted: ${payload.quest_title}`,
        html: getBaseTemplate(
          `
          <div class="hero">
            <div class="hero-icon">⏰</div>
            <div class="hero-text">Extra Time Granted</div>
            <p>Your extension request has been approved</p>
          </div>

          <p>Hey ${payload.user_name},</p>

          <p>Good news! Your extension request for <strong>"${payload.quest_title}"</strong> has been approved.</p>

          <div class="feedback-box">
            <strong>New Deadline:</strong> ${payload.new_deadline}<br>
            <em>Original deadline was: ${payload.original_deadline}</em>
          </div>

          <p>Use this extra time wisely, adventurer!</p>

          <p style="text-align: center;">
            <a href="${APP_URL}/my-quests/${payload.user_quest_id}" class="button">Continue Quest</a>
          </p>
          `,
          `Your extension for "${payload.quest_title}" has been approved`
        ),
      }

    case 'extension_denied':
      return {
        subject: `⏰ Extension Update: ${payload.quest_title}`,
        html: getBaseTemplate(
          `
          <div class="hero">
            <div class="hero-icon">⏰</div>
            <div class="hero-text">Extension Not Granted</div>
            <p>Your extension request could not be approved</p>
          </div>

          <p>Hey ${payload.user_name},</p>

          <p>Unfortunately, your extension request for <strong>"${payload.quest_title}"</strong> could not be approved at this time.</p>

          ${payload.reason ? `
          <div class="feedback-box">
            <strong>Reason:</strong><br>
            ${payload.reason}
          </div>
          ` : ''}

          <p>Your current deadline remains: <strong>${payload.original_deadline}</strong></p>

          <p>If you need assistance, please reach out to your Game Master.</p>

          <p style="text-align: center;">
            <a href="${APP_URL}/my-quests/${payload.user_quest_id}" class="button">View Quest</a>
          </p>
          `,
          `Your extension request for "${payload.quest_title}" was not approved`
        ),
      }

    case 'private_message':
      return {
        subject: `💬 Message from Your Game Master`,
        html: getBaseTemplate(
          `
          <div class="hero">
            <div class="hero-icon">💬</div>
            <div class="hero-text">A Message Awaits</div>
            <p>You have a new message from ${payload.gm_name || 'your Game Master'}</p>
          </div>

          <p>Hey ${payload.user_name},</p>

          ${payload.message_title ? `<h2 style="color: ${BRAND.textDark}; margin-bottom: 8px;">${payload.message_title}</h2>` : ''}

          <div class="feedback-box">
            ${payload.message_content}
          </div>

          <p style="text-align: center;">
            <a href="${APP_URL}/dashboard" class="button">View in ${GUILD_NAME}</a>
          </p>
          `,
          `New message from ${payload.gm_name || 'your Game Master'}`
        ),
      }

    default:
      throw new Error(`Unknown email type: ${payload.type}`)
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
      console.error('Mailjet credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload: EmailPayload = await req.json()

    if (!payload.to || !payload.type || !payload.user_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, type, user_name' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html } = getEmailContent(payload)

    // Mailjet uses Basic Auth with API_KEY:SECRET_KEY
    const authHeader = btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`)

    // Send email via Mailjet API v3.1
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: FROM_EMAIL,
              Name: FROM_NAME,
            },
            To: [
              {
                Email: payload.to,
                Name: payload.user_name,
              },
            ],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Mailjet API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)

    // Mailjet returns Messages array with status
    const messageResult = result.Messages?.[0]
    const messageId = messageResult?.To?.[0]?.MessageID

    return new Response(
      JSON.stringify({ success: true, id: messageId, status: messageResult?.Status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
