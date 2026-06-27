import DOMPurify from "dompurify"

/**
 * Lightweight Markdown -> HTML renderer for module content.
 * Supports: headings, bold, italic, inline code, unordered/ordered lists,
 * GitHub-style tables, blockquotes, and paragraphs.
 * Output is sanitized with DOMPurify before being injected.
 */
export function renderMarkdown(md: string): string {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

  const inline = (text: string) =>
    escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")

  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const html: string[] = []
  let i = 0

  const flushTable = (start: number): number => {
    // Detect GitHub table: header row, separator row (---), then body rows
    const headerLine = lines[start]
    const sepLine = lines[start + 1]
    if (
      !headerLine?.includes("|") ||
      !sepLine ||
      !/^\s*\|?[\s:-]*\|[\s:|-]*$/.test(sepLine) ||
      !sepLine.includes("-")
    ) {
      return -1
    }

    const parseRow = (line: string) =>
      line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim())

    const headers = parseRow(headerLine)
    let row = start + 2
    const bodyRows: string[][] = []
    while (row < lines.length && lines[row].includes("|") && lines[row].trim() !== "") {
      bodyRows.push(parseRow(lines[row]))
      row++
    }

    const thead = `<thead><tr>${headers.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead>`
    const tbody = `<tbody>${bodyRows
      .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
      .join("")}</tbody>`
    html.push(`<table>${thead}${tbody}</table>`)
    return row
  }

  while (i < lines.length) {
    const line = lines[i]

    // Blank line
    if (line.trim() === "") {
      i++
      continue
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length) {
      const next = flushTable(i)
      if (next !== -1) {
        i = next
        continue
      }
    }

    // Heading
    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length + 1 // shift so # -> h2
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      i++
      continue
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(inline(lines[i].replace(/^>\s?/, "")))
        i++
      }
      html.push(`<blockquote>${quote.join("<br/>")}</blockquote>`)
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`)
        i++
      }
      html.push(`<ol>${items.join("")}</ol>`)
      continue
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s+/, ""))}</li>`)
        i++
      }
      html.push(`<ul>${items.join("")}</ul>`)
      continue
    }

    // Paragraph (collect consecutive non-special lines)
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !lines[i].includes("|")
    ) {
      para.push(inline(lines[i]))
      i++
    }
    if (para.length) {
      html.push(`<p>${para.join("<br/>")}</p>`)
    } else {
      // Line contained a pipe but wasn't a table — treat as paragraph
      html.push(`<p>${inline(lines[i])}</p>`)
      i++
    }
  }

  const raw = html.join("\n")
  // Sanitize on the client; on the server return raw (content is trusted/admin-authored)
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(raw)
  }
  return raw
}
