import React, { createContext, useContext, useState } from 'react'

const EditorContext = createContext(null)

/**
 * Provides the TipTap `editor` instance to any child component.
 * Usage:
 *   const { editor, setEditor } = useEditorContext()
 */
export function EditorProvider({ children }) {
    const [editor, setEditor] = useState(null)

    return (
        <EditorContext.Provider value={{ editor, setEditor }}>
            {children}
        </EditorContext.Provider>
    )
}

export function useEditorContext() {
    return useContext(EditorContext)
}
