/*
React hooks are reusable pieces of logic that manage state and behavior. Instead of writing the same logic repeatedly across multiple components you extract it into a custom hook.
For BorraFlow specifically you'll need hooks like:
hooks/
├── useDocument.js      # manages document state, content, changes
├── useChat.js          # manages chat messages, AI responses
├── useEditor.js        # manages edit mode, toolbar actions, undo/redo
└── useAuth.js          # manages user session, login state
For example useDocument.js would handle all the logic around — fetching the document, tracking changes, sending content to backend, receiving formatted output. Without this hook that logic would be crammed directly into DocumentContent.jsx making it huge and unmanageable.*/
