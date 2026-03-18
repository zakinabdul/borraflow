/**
 * Converts a LaTeX string (document-level) to an HTML string for TipTap.
 *
 * Math is output as data-attribute markers:
 *   <span data-math-inline="LATEX">  ← parsed by MathInline TipTap node
 *   <div data-math-block="LATEX">    ← parsed by MathBlock TipTap node
 * KaTeX rendering happens inside TipTap NodeViews, not here.
 */

// ─── Math marker helpers ─────────────────────────────────────────────────────

function mathInlineMarker(tex) {
    return `<span data-math-inline="${encodeURIComponent(tex.trim())}"></span>`
}

function mathBlockMarker(tex) {
    return `<div data-math-block="${encodeURIComponent(tex.trim())}"></div>`
}

// ─── Inline formatting (applied recursively on text nodes) ───────────────────

function convertInline(text) {
    // Escaped special chars first
    text = text
        .replace(/\\%/g, '%')
        .replace(/\\&/g, '&amp;')
        .replace(/\\\$/g, '&#36;')
        .replace(/\\#/g, '#')
        .replace(/\\_/g, '_')
        .replace(/\\\{/g, '{')
        .replace(/\\\}/g, '}')
        .replace(/\\textasciitilde\b/g, '~')
        .replace(/\\textasciicircum\b/g, '^')
        .replace(/---/g, '&mdash;')
        .replace(/--/g, '&ndash;')
        .replace(/``/g, '\u201C')
        .replace(/''/g, '\u201D')

    // Inline math: $...$  — output as data-attribute marker for MathInline node
    text = text.replace(/\$([^$\n]+?)\$/g, (_, tex) => mathInlineMarker(tex))

    // Text commands
    text = text.replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
    text = text.replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
    text = text.replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
    text = text.replace(/\\texttt\{([^}]*)\}/g, '<code>$1</code>')
    text = text.replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>')
    text = text.replace(/\\textsc\{([^}]*)\}/g, '<span style="font-variant:small-caps">$1</span>')
    text = text.replace(/\\textsuperscript\{([^}]*)\}/g, '<sup>$1</sup>')
    text = text.replace(/\\textsubscript\{([^}]*)\}/g, '<sub>$1</sub>')

    // Hyperlinks
    text = text.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1">$2</a>')
    text = text.replace(/\\url\{([^}]*)\}/g, '<a href="$1">$1</a>')

    // Footnotes – render inline for now
    text = text.replace(/\\footnote\{([^}]*)\}/g, '<sup title="$1">[note]</sup>')

    // Line breaks
    text = text.replace(/\\\\(\s*)/g, '<br/>')
    text = text.replace(/\\newline\b/g, '<br/>')

    // Strip remaining simple commands that don't map to HTML
    text = text.replace(/\\[a-zA-Z]+\s*/g, '')

    return text
}

// ─── Block / environment converters ──────────────────────────────────────────

function convertItemize(body) {
    const items = body
        .split(/\\item\b/)
        .slice(1)
        .map(s => `<li>${convertInline(s.trim())}</li>`)
        .join('\n')
    return `<ul>${items}</ul>`
}

function convertEnumerate(body) {
    const items = body
        .split(/\\item\b/)
        .slice(1)
        .map(s => `<li>${convertInline(s.trim())}</li>`)
        .join('\n')
    return `<ol>${items}</ol>`
}

function convertTabular(body) {
    // Strip column spec line (first line like {lcc})
    const lines = body.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('{'))
    const rows = lines.map(line => {
        if (/\\hline/.test(line)) return null          // skip \hline rows
        const cells = line.replace(/\\\\/, '').split('&').map(c =>
            `<td style="border:1px solid #ccc;padding:4px 8px">${convertInline(c.trim())}</td>`
        ).join('')
        return `<tr>${cells}</tr>`
    }).filter(Boolean).join('\n')
    return `<table style="border-collapse:collapse;margin:8px 0">${rows}</table>`
}

// ─── Main converter ──────────────────────────────────────────────────────────

export function latexToHtml(latex) {
    if (!latex) return ''

    let text = latex

    // 1. Strip LaTeX comments
    text = text.replace(/%[^\n]*/g, '')

    // 2. Extract preamble metadata before stripping
    const titleMatch = text.match(/\\title\{([^}]*)\}/)
    const authorMatch = text.match(/\\author\{([^}]*)\}/)
    const dateMatch = text.match(/\\date\{([^}]*)\}/)
    const titleVal = titleMatch ? convertInline(titleMatch[1]) : ''
    const authorVal = authorMatch ? convertInline(authorMatch[1]) : ''
    const dateVal = dateMatch ? convertInline(dateMatch[1]) : ''

    // 3. Strip preamble (everything before \begin{document})
    const docStart = text.indexOf('\\begin{document}')
    if (docStart !== -1) {
        text = text.slice(docStart + '\\begin{document}'.length)
    }

    // 4. Strip \end{document}
    text = text.replace(/\\end\{document\}/g, '')

    // 5. Strip remaining preamble-only commands
    text = text
        .replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/g, '')
        .replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, '')
        .replace(/\\geometry\{[^}]*\}/g, '')
        .replace(/\\pagestyle\{[^}]*\}/g, '')
        .replace(/\\setlength\{[^}]*\}\{[^}]*\}/g, '')

    // 6. Build title block from \maketitle
    let titleBlock = ''
    if (text.includes('\\maketitle')) {
        const parts = []
        if (titleVal) parts.push(`<h1 style="margin-bottom:4px">${titleVal}</h1>`)
        if (authorVal) parts.push(`<p style="color:#555;margin:2px 0"><em>${authorVal}</em></p>`)
        if (dateVal) parts.push(`<p style="color:#888;font-size:0.9em">${dateVal}</p>`)
        titleBlock = parts.join('\n') + (parts.length ? '<hr style="margin:12px 0"/>' : '')
        text = text.replace(/\\maketitle\b/g, '\x00TITLEBLOCK\x00')
    }
    // Strip standalone title/author/date commands (already captured)
    text = text
        .replace(/\\title\{[^}]*\}/g, '')
        .replace(/\\author\{[^}]*\}/g, '')
        .replace(/\\date\{[^}]*\}/g, '')

    // 7. Block math: $$...$$ and \[...\] — data-attribute markers for MathBlock node
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => mathBlockMarker(tex))
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => mathBlockMarker(tex))

    // 8. equation / align environments
    text = text.replace(
        /\\begin\{(equation|align|equation\*|align\*)\}([\s\S]*?)\\end\{\1\}/g,
        (_, _env, tex) => mathBlockMarker(tex)
    )

    // 9. verbatim / lstlisting
    text = text.replace(
        /\\begin\{(verbatim|lstlisting)\}([\s\S]*?)\\end\{\1\}/g,
        (_, _env, body) => `<pre><code>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    )

    // 10. Lists (handle nested by processing deepest first — repeat passes)
    for (let i = 0; i < 4; i++) {
        text = text.replace(
            /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,
            (_, body) => convertItemize(body)
        )
        text = text.replace(
            /\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g,
            (_, body) => convertEnumerate(body)
        )
    }

    // 11. Tabular
    text = text.replace(
        /\\begin\{tabular\}(\{[^}]*\})?([\s\S]*?)\\end\{tabular\}/g,
        (_, _spec, body) => convertTabular(body)
    )

    // 12. Abstract environment
    text = text.replace(
        /\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g,
        (_, body) =>
            `<blockquote style="border-left:4px solid #ccc;padding:4px 12px;color:#555"><strong>Abstract</strong><br/>${convertInline(body.trim())}</blockquote>`
    )

    // 13. Generic environments — strip begin/end tags, keep content
    text = text.replace(/\\begin\{[^}]*\}/g, '')
    text = text.replace(/\\end\{[^}]*\}/g, '')

    // 14. Sections
    text = text.replace(/\\section\*?\{([^}]*)\}/g, (_, t) => `<h2>${convertInline(t)}</h2>`)
    text = text.replace(/\\subsection\*?\{([^}]*)\}/g, (_, t) => `<h3>${convertInline(t)}</h3>`)
    text = text.replace(/\\subsubsection\*?\{([^}]*)\}/g, (_, t) => `<h4>${convertInline(t)}</h4>`)
    text = text.replace(/\\paragraph\*?\{([^}]*)\}/g, (_, t) => `<p><strong>${convertInline(t)}</strong></p>`)

    // 15. Horizontal rules
    text = text.replace(/\\hrule\b/g, '<hr/>')
    text = text.replace(/\\hline\b/g, '')

    // 16. Table of contents / index commands — strip
    text = text.replace(/\\tableofcontents\b/g, '')
    text = text.replace(/\\listoffigures\b/g, '')
    text = text.replace(/\\listoftables\b/g, '')
    text = text.replace(/\\printindex\b/g, '')

    // 17. newpage / clearpage
    text = text.replace(/\\(newpage|clearpage|pagebreak)\b/g, '<hr style="border-style:dashed"/>')

    // 18. Spacing commands
    text = text.replace(/\\(vspace|hspace|vskip|hskip)\{[^}]*\}/g, '')
    text = text.replace(/\\(bigskip|medskip|smallskip|noindent|indent)\b\s*/g, '')

    // 19. Apply inline formatting to remaining text
    text = convertInline(text)

    // 20. Convert double newlines to paragraphs
    const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
    text = blocks.map(block => {
        // Don't wrap already-block HTML elements
        if (/^<(h[1-6]|ul|ol|li|table|pre|div|blockquote|hr)/.test(block)) return block
        return `<p>${block.replace(/\n/g, '<br/>')}</p>`
    }).join('\n')

    // 21. Inject title block
    text = text.replace('\x00TITLEBLOCK\x00', titleBlock)
    if (titleBlock && !text.includes(titleBlock)) {
        text = titleBlock + text
    }

    return text
}
