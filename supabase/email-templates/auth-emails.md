# Supabase Auth Email Templates

Copy each template into **Supabase Dashboard → Authentication → Email Templates**

---

## 1. Confirm Signup

**Subject:**
```
🏰 Welcome to Guild Hall - Verify Your Email
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0;">
      <span style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</span>
      <img src="https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png" alt="Logo" style="height: 28px; vertical-align: middle; margin: 0 8px;">
      <span style="font-size: 18px; color: #3D2E1F;">Agentics NZ</span>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px; color: #3D2E1F;">
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 48px;">🏰</div>
        <div style="font-size: 28px; font-weight: bold; color: #3D2E1F; margin: 16px 0 8px 0;">Your Adventure Awaits</div>
        <p style="color: #666666; margin: 0;">Verify your email to begin your journey</p>
      </div>

      <p>Greetings, brave adventurer!</p>

      <p>Welcome to the guild! Before you can embark on your quests, please verify your email address by clicking the button below:</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #B8860B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email Address</a>
      </p>

      <p>If you didn't create an account with Guild Hall, you can safely ignore this email.</p>

      <p>May your quests be legendary!</p>
      <p><em>— The Guild Masters</em></p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">This email was sent by Agentics NZ</p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Invite User

**Subject:**
```
⚔️ You've Been Summoned to Guild Hall
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0;">
      <span style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</span>
      <img src="https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png" alt="Logo" style="height: 28px; vertical-align: middle; margin: 0 8px;">
      <span style="font-size: 18px; color: #3D2E1F;">Agentics NZ</span>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px; color: #3D2E1F;">
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 48px;">⚔️</div>
        <div style="font-size: 28px; font-weight: bold; color: #3D2E1F; margin: 16px 0 8px 0;">A Quest Awaits You</div>
        <p style="color: #666666; margin: 0;">You've been invited to join the guild</p>
      </div>

      <p>Hail, future adventurer!</p>

      <p>You have been summoned to join <strong>Guild Hall</strong>. A world of quests, achievements, and glory awaits you!</p>

      <p>Click the button below to accept your invitation and create your adventurer profile:</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #B8860B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a>
      </p>

      <p>If you weren't expecting this invitation, you can safely ignore this email.</p>

      <p>We look forward to your arrival at the guild hall!</p>
      <p><em>— The Guild Masters</em></p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">This email was sent by Agentics NZ</p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Magic Link

**Subject:**
```
🗝️ Your Guild Hall Portal Key
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0;">
      <span style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</span>
      <img src="https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png" alt="Logo" style="height: 28px; vertical-align: middle; margin: 0 8px;">
      <span style="font-size: 18px; color: #3D2E1F;">Agentics NZ</span>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px; color: #3D2E1F;">
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 48px;">🗝️</div>
        <div style="font-size: 28px; font-weight: bold; color: #3D2E1F; margin: 16px 0 8px 0;">One-Click Entry</div>
        <p style="color: #666666; margin: 0;">Your magic portal key is ready</p>
      </div>

      <p>Greetings, adventurer!</p>

      <p>Click the magic link below to instantly enter the guild hall. No password required!</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #B8860B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Enter the Guild Hall</a>
      </p>

      <p style="font-size: 14px; color: #666666;">This link will expire in 24 hours and can only be used once.</p>

      <p>If you didn't request this link, you can safely ignore this email.</p>

      <p><em>— The Guild Masters</em></p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">This email was sent by Agentics NZ</p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Change Email Address

**Subject:**
```
📜 Confirm Your New Email Address
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0;">
      <span style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</span>
      <img src="https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png" alt="Logo" style="height: 28px; vertical-align: middle; margin: 0 8px;">
      <span style="font-size: 18px; color: #3D2E1F;">Agentics NZ</span>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px; color: #3D2E1F;">
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 48px;">📜</div>
        <div style="font-size: 28px; font-weight: bold; color: #3D2E1F; margin: 16px 0 8px 0;">Update Your Records</div>
        <p style="color: #666666; margin: 0;">Confirm your new scroll address</p>
      </div>

      <p>Greetings, adventurer!</p>

      <p>We received a request to change the email address associated with your Guild Hall account.</p>

      <p>Click the button below to confirm this change:</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #B8860B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirm New Email</a>
      </p>

      <p style="font-size: 14px; color: #666666;">If you didn't request this change, please ignore this email or contact support immediately.</p>

      <p><em>— The Guild Masters</em></p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">This email was sent by Agentics NZ</p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 5. Reset Password

**Subject:**
```
🔒 Reset Your Guild Hall Password
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0;">
      <span style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</span>
      <img src="https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png" alt="Logo" style="height: 28px; vertical-align: middle; margin: 0 8px;">
      <span style="font-size: 18px; color: #3D2E1F;">Agentics NZ</span>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px; color: #3D2E1F;">
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 48px;">🔒</div>
        <div style="font-size: 28px; font-weight: bold; color: #3D2E1F; margin: 16px 0 8px 0;">Forgot Your Password?</div>
        <p style="color: #666666; margin: 0;">No worries, we've got you covered</p>
      </div>

      <p>Greetings, adventurer!</p>

      <p>We received a request to reset the password for your Guild Hall account.</p>

      <p>Click the button below to set a new password:</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #B8860B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
      </p>

      <p style="font-size: 14px; color: #666666;">This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.</p>

      <p><em>— The Guild Masters</em></p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">This email was sent by Agentics NZ</p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 6. Reauthentication (Confirm Current Email)

**Subject:**
```
🛡️ Verify Your Identity - Guild Hall
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF8E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #F5F0E6; padding: 16px 24px; border-bottom: 1px solid #E5DDD0;">
      <span style="font-size: 18px; font-weight: 600; color: #3D2E1F;">Guild Hall</span>
      <img src="https://cdn.disco.co/media/agentics-logo-enhanced-removebg-preview_2949fb89-758d-4d9d-ae30-a51cea979427.png" alt="Logo" style="height: 28px; vertical-align: middle; margin: 0 8px;">
      <span style="font-size: 18px; color: #3D2E1F;">Agentics NZ</span>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px; color: #3D2E1F;">
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 48px;">🛡️</div>
        <div style="font-size: 28px; font-weight: bold; color: #3D2E1F; margin: 16px 0 8px 0;">Security Check</div>
        <p style="color: #666666; margin: 0;">Please verify it's you</p>
      </div>

      <p>Greetings, adventurer!</p>

      <p>For your security, we need to verify your identity before proceeding with your request.</p>

      <p>Click the button below to confirm:</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #B8860B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify My Identity</a>
      </p>

      <p style="font-size: 14px; color: #666666;">If you didn't initiate this request, please secure your account immediately by changing your password.</p>

      <p><em>— The Guild Masters</em></p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">This email was sent by Agentics NZ</p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://agentics-nz.fly.dev" style="color: #666666;">Visit Agentics NZ</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## How to Apply

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template type, click to edit
3. Copy the **Subject** into the subject field
4. Copy the **Body** HTML into the body field
5. Save

The `{{ .ConfirmationURL }}` placeholder is automatically replaced by Supabase with the correct link.
