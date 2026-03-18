// Minimal SVG icon components for the rich text toolbar
// All icons are 14×14 viewBox to fit in 28px buttons

export function BoldIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <path d="M3 2h5a3 3 0 0 1 0 6H5v4H3V2zm2 5h3a1.5 1.5 0 0 0 0-3H5v3zm0 2v3h3.5a1.5 1.5 0 0 0 0-3H5z" />
        </svg>
    )
}

export function ItalicIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <path d="M5 2h6v2H9.2L7.8 10H10v2H4v-2h1.8L7.2 4H5V2z" />
        </svg>
    )
}

export function UnderlineIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <path d="M3 1h2v5.5a2 2 0 0 0 4 0V1h2v5.5a4 4 0 0 1-8 0V1zM2 11h10v2H2z" />
        </svg>
    )
}

export function StrikethroughIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <path d="M7 1c2.2 0 3.5 1.1 3.5 2.5 0 .6-.2 1.1-.5 1.5H2V6h10v1.5H8.5C9.4 8 10 8.8 10 10c0 1.7-1.4 3-3 3S4 11.7 4 10h1.8c0 .7.6 1.2 1.2 1.2s1.2-.5 1.2-1.2c0-.6-.5-1-1.2-1H2V7.5h10V6H2V5h1.8c-.1-.2-.3-.5-.3-.8C3.5 2 5 1 7 1z" />
        </svg>
    )
}

export function ListBulletIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <circle cx="2" cy="3.5" r="1.2" />
            <rect x="5" y="2.8" width="8" height="1.4" rx="0.7" />
            <circle cx="2" cy="7" r="1.2" />
            <rect x="5" y="6.3" width="8" height="1.4" rx="0.7" />
            <circle cx="2" cy="10.5" r="1.2" />
            <rect x="5" y="9.8" width="8" height="1.4" rx="0.7" />
        </svg>
    )
}

export function NumberedListIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <text x="0.5" y="5" fontSize="5" fontFamily="monospace" fontWeight="bold">1.</text>
            <rect x="5" y="2.8" width="8" height="1.4" rx="0.7" />
            <text x="0.5" y="9" fontSize="5" fontFamily="monospace" fontWeight="bold">2.</text>
            <rect x="5" y="6.8" width="8" height="1.4" rx="0.7" />
            <text x="0.5" y="13" fontSize="5" fontFamily="monospace" fontWeight="bold">3.</text>
            <rect x="5" y="10.8" width="8" height="1.4" rx="0.7" />
        </svg>
    )
}

export function CodeBracketIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4L2 7l3 3M9 4l3 3-3 3" />
        </svg>
    )
}

export function ChatBubbleBottomCenterTextIcon() {
    return (
        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
            <rect x="1" y="1" width="3" height="12" rx="1.5" />
            <rect x="6" y="3" width="7" height="1.3" rx="0.65" />
            <rect x="6" y="6.3" width="6" height="1.3" rx="0.65" />
            <rect x="6" y="9.6" width="5" height="1.3" rx="0.65" />
        </svg>
    )
}
