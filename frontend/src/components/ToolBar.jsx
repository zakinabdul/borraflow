import { useEffect, useState } from 'react'
import { FaUndo, FaRedo, FaDownload, FaShareAlt, FaRegEye } from 'react-icons/fa'
import { FiCopy } from 'react-icons/fi'
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
    ListBulletIcon, NumberedListIcon, CodeBracketIcon, ChatBubbleBottomCenterTextIcon
} from './ToolBarIcons'
import UserMenu from './UserMenu'
import { useEditorContext } from '../context/EditorContext'

// ─── Tiny reusable toolbar button ────────────────────────────────────────────
function TBtn({ onClick, active, title, children, disabled }) {
    return (
        <button
            onMouseDown={(e) => { e.preventDefault(); onClick?.() }}
            disabled={disabled}
            title={title}
            className={`
        flex items-center justify-center w-7 h-7 rounded text-[13px] transition-all select-none
        ${active
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/40'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            {children}
        </button>
    )
}

// ─── Heading dropdown ─────────────────────────────────────────────────────────
function HeadingDropdown({ editor }) {
    const [open, setOpen] = useState(false)

    const options = [
        { label: 'Normal', action: () => editor.chain().focus().setParagraph().run(), active: editor?.isActive('paragraph') },
        { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }) },
        { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
        { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
        { label: 'Heading 4', action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), active: editor?.isActive('heading', { level: 4 }) },
    ]

    const current = options.find(o => o.active) || options[0]

    return (
        <div className="relative">
            <button
                onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p) }}
                className="flex items-center gap-1 px-2 h-7 rounded text-[12px] text-gray-300 hover:bg-white/10 transition-all select-none whitespace-nowrap"
            >
                {current.label}
                <span className="text-gray-500 text-[10px]">▾</span>
            </button>
            {open && (
                <div
                    className="absolute top-9 left-0 z-50 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl py-1 min-w-[130px]"
                    onMouseLeave={() => setOpen(false)}
                >
                    {options.map(opt => (
                        <button
                            key={opt.label}
                            onMouseDown={(e) => { e.preventDefault(); opt.action(); setOpen(false) }}
                            className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-white/10 transition-all ${opt.active ? 'text-indigo-300' : 'text-gray-300'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
    return <div className="w-px h-5 bg-white/10 mx-1" />
}

// ─── Main ToolBar ─────────────────────────────────────────────────────────────
const ToolBar = () => {
    const { editor } = useEditorContext()
    const [status, setStatus] = useState('saved')
    const [, forceUpdate] = useState(0)

    // Re-render when editor selection changes (to update active states)
    useEffect(() => {
        if (!editor) return
        const update = () => forceUpdate(n => n + 1)
        editor.on('selectionUpdate', update)
        editor.on('transaction', update)
        return () => {
            editor.off('selectionUpdate', update)
            editor.off('transaction', update)
        }
    }, [editor])

    // Auto-save indicator
    useEffect(() => {
        setStatus('saving')
        const timer = setTimeout(() => setStatus('saved'), 1200)
        return () => clearTimeout(timer)
    }, [])

    const e = editor // shorthand

    return (
        <div className="flex flex-col bg-[#1a1a24] border-b border-white/8 select-none">

            {/* ── Top bar: title + meta actions ───────────────────────── */}
            <div className="flex items-center pb-2 pt-4 px-4">

                <input
                    placeholder="Untitled Document"
                    maxLength={17}
                    className="
            bg-transparent border border-transparent
            text-white font-medium text-lg outline-none
            px-2 py-1 rounded transition-all duration-200 min-w-[120px]
            hover:bg-white/5 focus:bg-white/5
          "
                />

                <div className="flex items-center ml-3">
                    <button className={`
            text-[12px] font-normal px-2 py-1 rounded-md whitespace-nowrap select-none transition-all border
            ${status === 'saving'
                            ? 'text-[#94a3b8] bg-[#1e293b] border-[rgba(148,163,184,0.2)]'
                            : 'text-[#86efac] bg-[#1e293b] border-[rgba(134,239,172,0.2)]'
                        }
          `}>
                        {status === 'saving' ? 'Saving...' : 'Saved'}
                    </button>
                </div>

                <div className="flex items-center gap-4 text-gray-600 text-xl ml-auto">
                    <FaDownload className="cursor-pointer hover:text-gray-400 transition-colors" title="Download" />
                    <FiCopy className="cursor-pointer hover:text-gray-400 transition-colors" title="Copy" />
                    <FaShareAlt className="cursor-pointer hover:text-gray-400 transition-colors" title="Share" />
                    <FaRegEye className="cursor-pointer hover:text-gray-400 transition-colors" title="Preview" />
                    <ArrowsPointingOutIcon className="w-5 h-5 cursor-pointer hover:text-gray-400 transition-colors" title="Fullscreen" />
                    <div className="w-10 h-10 text-sm font-semibold ml-2">
                        <UserMenu />
                    </div>
                </div>
            </div>

            {/* ── Formatting ribbon ────────────────────────────────────── */}
            <div className="flex items-center gap-0.5 px-4 pb-2.5 flex-wrap">

                {/* Undo / Redo */}
                <TBtn onClick={() => e?.chain().focus().undo().run()} disabled={!e?.can().undo()} title="Undo (Ctrl+Z)">
                    <FaUndo className="w-3 h-3" />
                </TBtn>
                <TBtn onClick={() => e?.chain().focus().redo().run()} disabled={!e?.can().redo()} title="Redo (Ctrl+Y)">
                    <FaRedo className="w-3 h-3" />
                </TBtn>

                <Divider />

                {/* Heading dropdown */}
                <HeadingDropdown editor={e} />

                <Divider />

                {/* Text formatting */}
                <TBtn onClick={() => e?.chain().focus().toggleBold().run()} active={e?.isActive('bold')} title="Bold (Ctrl+B)">
                    <BoldIcon />
                </TBtn>
                <TBtn onClick={() => e?.chain().focus().toggleItalic().run()} active={e?.isActive('italic')} title="Italic (Ctrl+I)">
                    <ItalicIcon />
                </TBtn>
                <TBtn onClick={() => e?.chain().focus().toggleUnderline().run()} active={e?.isActive('underline')} title="Underline (Ctrl+U)">
                    <UnderlineIcon />
                </TBtn>
                <TBtn onClick={() => e?.chain().focus().toggleStrike().run()} active={e?.isActive('strike')} title="Strikethrough">
                    <StrikethroughIcon />
                </TBtn>

                <Divider />

                {/* Lists */}
                <TBtn onClick={() => e?.chain().focus().toggleBulletList().run()} active={e?.isActive('bulletList')} title="Bullet list">
                    <ListBulletIcon />
                </TBtn>
                <TBtn onClick={() => e?.chain().focus().toggleOrderedList().run()} active={e?.isActive('orderedList')} title="Numbered list">
                    <NumberedListIcon />
                </TBtn>

                <Divider />

                {/* Block types */}
                <TBtn onClick={() => e?.chain().focus().toggleBlockquote().run()} active={e?.isActive('blockquote')} title="Blockquote">
                    <ChatBubbleBottomCenterTextIcon />
                </TBtn>
                <TBtn onClick={() => e?.chain().focus().toggleCodeBlock().run()} active={e?.isActive('codeBlock')} title="Code block">
                    <CodeBracketIcon />
                </TBtn>

                <Divider />

                {/* Clear formatting */}
                <TBtn onClick={() => e?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">
                    <span className="font-mono text-[11px] font-bold leading-none">Tx</span>
                </TBtn>

            </div>
        </div>
    )
}

export default ToolBar