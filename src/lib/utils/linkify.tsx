import React from 'react'

/**
 * Parse text and convert URLs and markdown-style links to clickable links
 * Supports:
 * - Plain URLs: https://example.com
 * - Markdown links: [link text](https://example.com)
 */
export function linkifyText(text: string, linkClassName?: string): React.ReactNode[] {
  // Regex patterns
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,;:!?"'\])>])/g

  // First, process markdown links and replace with placeholders
  const placeholders: { placeholder: string; element: React.ReactNode }[] = []
  let processedText = text

  // Replace markdown links with placeholders
  let match
  let placeholderIndex = 0
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const [fullMatch, linkText, url] = match
    const placeholder = `__LINK_PLACEHOLDER_${placeholderIndex}__`
    placeholders.push({
      placeholder,
      element: (
        <a
          key={`md-${placeholderIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName || 'underline hover:no-underline font-medium'}
        >
          {linkText}
        </a>
      ),
    })
    processedText = processedText.replace(fullMatch, placeholder)
    placeholderIndex++
  }

  // Now process plain URLs (that aren't already part of markdown links)
  const urlMatches = processedText.match(urlRegex) || []
  for (const url of urlMatches) {
    const placeholder = `__LINK_PLACEHOLDER_${placeholderIndex}__`
    placeholders.push({
      placeholder,
      element: (
        <a
          key={`url-${placeholderIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName || 'underline hover:no-underline font-medium'}
        >
          {url}
        </a>
      ),
    })
    processedText = processedText.replace(url, placeholder)
    placeholderIndex++
  }

  // If no links found, return original text
  if (placeholders.length === 0) {
    return [text]
  }

  // Split by placeholders and rebuild with React elements
  const result: React.ReactNode[] = []
  let remaining = processedText

  for (const { placeholder, element } of placeholders) {
    const parts = remaining.split(placeholder)
    if (parts[0]) {
      result.push(parts[0])
    }
    result.push(element)
    remaining = parts.slice(1).join(placeholder)
  }

  if (remaining) {
    result.push(remaining)
  }

  return result
}
