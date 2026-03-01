/*
This is for global state management — data that multiple components across different pages need to access simultaneously.
Think about BorraFlow's split screen editor. Your ChatInterface.jsx on the left and DocumentContent.jsx on the right both need to know about the same document at the same time. If a user selects text in the preview and types an instruction in the chat, both components need to share that selected text information. That shared data lives in the store.
store/
├── index.js           # main store setup
├── documentSlice.js   # document state
├── chatSlice.js       # chat state
└── authSlice.js       # user auth state
You'd likely use Zustand or Redux Toolkit here — Zustand is simpler and perfect for BorraFlow's scale right now.
*/

