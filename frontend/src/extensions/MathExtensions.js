import { Node } from '@tiptap/core'
import katex from 'katex'

// ─── Inline math: $...$ ───────────────────────────────────────────────────────
export const MathInline = Node.create({
    name: 'mathInline',
    group: 'inline',
    inline: true,
    atom: true,   // treated as a single, non-editable unit
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            latex: { default: '' },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-math-inline]',
                getAttrs: (el) => ({
                    latex: decodeURIComponent(el.getAttribute('data-math-inline') || '')
                }),
            },
        ]
    },

    renderHTML({ node }) {
        // Stored representation — KaTeX renders via NodeView at runtime
        return ['span', { 'data-math-inline': node.attrs.latex, class: 'math-inline-node' }, 0]
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('span')
            dom.className = 'math-inline-node'
            dom.contentEditable = 'false'

            try {
                katex.render(node.attrs.latex, dom, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html',
                })
            } catch {
                dom.textContent = `$${node.attrs.latex}$`
            }

            return { dom }
        }
    },
})

// ─── Block math: $$...$$ / \[...\] / equation env ───────────────────────────
export const MathBlock = Node.create({
    name: 'mathBlock',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            latex: { default: '' },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-math-block]',
                getAttrs: (el) => ({
                    latex: decodeURIComponent(el.getAttribute('data-math-block') || '')
                }),
            },
        ]
    },

    renderHTML({ node }) {
        return ['div', { 'data-math-block': node.attrs.latex, class: 'math-block-node' }, 0]
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('div')
            dom.className = 'math-block-node'
            dom.contentEditable = 'false'

            try {
                katex.render(node.attrs.latex, dom, {
                    throwOnError: false,
                    displayMode: true,
                    output: 'html',
                })
            } catch {
                dom.textContent = `$$${node.attrs.latex}$$`
            }

            return { dom }
        }
    },
})
