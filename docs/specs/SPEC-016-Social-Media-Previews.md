# SPEC-016: Social Media Previews

**Status:** Implemented
**Related ADR:** None (pattern extension, not architectural change)
**Created:** 2026-02-08

---

## Overview

This specification defines the implementation of Open Graph and Twitter Card metadata for rich social media link previews across Guild Hall.

## Supported Platforms

| Platform | Protocol | Image Requirement |
|----------|----------|-------------------|
| Facebook | Open Graph | 1200x630, < 8MB |
| Twitter/X | Twitter Cards | 1200x630, < 5MB |
| LinkedIn | Open Graph | 1200x627, < 5MB |
| WhatsApp | Open Graph | 1200x630, < 300KB recommended |
| Slack | Open Graph | 1200x630 |
| Discord | Open Graph | 1200x630 |
| iMessage | Open Graph | 1200x630 |

## Image Specifications

### Default OG Image (`/public/og-image.jpg`)

| Property | Value |
|----------|-------|
| Dimensions | 1200 x 630 pixels |
| Aspect Ratio | 1.91:1 |
| Format | JPEG |
| Quality | 85% |
| Max Size | 300KB |
| Source | Cropped from `/public/guild-hall.jpg` |

### Quest Featured Images

Quest featured images uploaded by GMs are used when sharing quest deeplinks. Requirements:

- Recommended: 1200x630 (1.91:1 aspect ratio)
- Minimum: 600x315
- Format: JPEG or PNG
- Storage: Supabase Storage `avatars` bucket, `featured-images/` folder

## Meta Tag Implementation

### Root Layout (Default)

All pages inherit these base tags from `src/app/layout.tsx`:

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Guild Hall" />
<meta property="og:title" content="Guild Hall" />
<meta property="og:description" content="Quest-based engagement platform" />
<meta property="og:url" content="https://guild-hall.agentics.nz" />
<meta property="og:image" content="https://guild-hall.agentics.nz/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Guild Hall - Quest-based engagement platform" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Guild Hall" />
<meta name="twitter:description" content="Quest-based engagement platform" />
<meta name="twitter:image" content="https://guild-hall.agentics.nz/og-image.jpg" />
```

### Quest Detail Pages

Quest pages use `generateMetadata()` to provide dynamic OG tags:

```html
<meta property="og:type" content="article" />
<meta property="og:title" content="{Quest Title}" />
<meta property="og:description" content="{Quest Description (truncated to 200 chars)}" />
<meta property="og:url" content="https://guild-hall.agentics.nz/quests/{id}" />
<meta property="og:image" content="{featured_image_url OR default og-image.jpg}" />
```

## Route Behavior Matrix

| Route | OG Image | Title Pattern | Description Source |
|-------|----------|---------------|-------------------|
| `/` | `/og-image.jpg` | Guild Hall | Site description |
| `/quests/[id]` | `featured_image_url` or `/og-image.jpg` | `{Quest Title}` | Quest short_description or description |
| `/users/[id]` | User avatar or none | `{Display Name} \| Guild Hall` | User bio or stats |
| Other pages | `/og-image.jpg` | `{Page Title} \| Guild Hall` | Inherited from root |

## Environment Variables

```bash
# Site URL for canonical links and absolute image URLs
NEXT_PUBLIC_SITE_URL=https://guild-hall.agentics.nz
```

## Storage Policies

Featured images require RLS policies to allow GM upload and public read:

- `featured-images/` folder in `avatars` bucket
- GMs can INSERT, UPDATE, DELETE
- Public can SELECT (read)

See migration `143_storage_featured_image_policies.sql`.

## Testing

### Validators

| Platform | Validator URL |
|----------|---------------|
| Facebook | https://developers.facebook.com/tools/debug/ |
| Twitter | https://cards-dev.twitter.com/validator |
| LinkedIn | https://www.linkedin.com/post-inspector/ |

### Test Cases

1. **Root URL** → Shows default OG image
2. **Quest with featured image** → Shows featured image
3. **Quest without featured image** → Falls back to default OG image
4. **Unpublished quest** → Shows "Quest Not Found" metadata

### Cache Busting

Social platforms cache previews aggressively (24-48 hours). To force refresh during testing:

1. Append query param: `?v=2`
2. Use platform's refresh/scrape button
3. Wait for cache expiry

## Implementation Files

| File | Purpose |
|------|---------|
| `public/og-image.jpg` | Default OG image (1200x630) |
| `src/app/layout.tsx` | Root metadata with OG/Twitter defaults |
| `src/app/(dashboard)/quests/[id]/page.tsx` | Server component with generateMetadata |
| `src/app/(dashboard)/quests/[id]/quest-detail-client.tsx` | Extracted client component |
| `supabase/migrations/143_storage_featured_image_policies.sql` | Storage RLS for featured images |
| `.env.example` | NEXT_PUBLIC_SITE_URL variable |

## WhatsApp Compatibility Notes

WhatsApp uses Open Graph tags exclusively (ignores Twitter Cards). Key requirements:

- HTTPS required
- Image must be < 300KB for reliable loading
- Server-rendered HTML (Next.js metadata API satisfies this)
- Aggressive caching (24-48 hours)
