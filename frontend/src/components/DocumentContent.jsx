import React, { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import 'katex/dist/katex.min.css'
import { MathInline, MathBlock } from '../extensions/MathExtensions'
import { latexToHtml } from '../utils/latexToHtml'
import { useEditorContext } from '../context/EditorContext'

const DocumentContent = ({ answer, loading }) => {
  const { setEditor } = useEditorContext()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      MathInline,
      MathBlock,
    ],
    content: '<p style="color:#aaa">Ask something to generate documentation.</p>',
    editorProps: {
      attributes: {
        class: 'tiptap outline-none',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      // Future: auto-save hook can go here
    },
  })

  // Share editor instance via context (so ToolBar can access it)
  useEffect(() => {
    setEditor(editor)
    return () => setEditor(null)
  }, [editor])

  // Load converted LaTeX into the editor whenever answer changes
  useEffect(() => {
    if (!editor || loading) return

    if (answer) {
      const html = latexToHtml(answer)
      // Use setTimeout to ensure editor is ready after any React re-render
      setTimeout(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(html, false)
        }
      }, 0)
    } else {
      editor.commands.setContent(
        '<p style="color:#9ca3af">Ask something to generate documentation.</p>'
      )
    }
  }, [answer, loading, editor])

  return (
    <div className="h-[91vh] overflow-y-auto bg-[#f0ede8]">

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm font-mono text-gray-400">Generating documentation...</span>
        </div>
      )}

      {/* Paper sheet with TipTap editor */}
      {!loading && (
        <div className="py-10 px-6 min-h-full">
          <div
            className="bg-white mx-auto shadow-md"
            style={{
              maxWidth: '740px',
              minHeight: '1050px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
            }}
          >
            <EditorContent
              editor={editor}
              style={{ padding: '72px 80px', minHeight: '1050px' }}
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default DocumentContent
