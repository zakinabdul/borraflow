import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo1_bg.png'
import { AiOutlineStar } from 'react-icons/ai'
import { FiMic, FiSend } from 'react-icons/fi'


const ChatInterface = ({ messages, onSend, loading }) => {

  const navigate = useNavigate();
{/*
    const location = useLocation();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    
    const bottomRef = useRef(null);
    const hasInitialized = useRef(false);
    
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])


    useEffect(() => {
      if (hasInitialized.current) return;

      if (location.state?.firstMessage) {
        hasInitialized.current = true;
        
        const firstUserMessage = {
          id : Date.now(),
          role : "user",
          content : location.state.firstMessage
        }

        setMessages([firstUserMessage])

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id : Date.now() + 1,
              role : "assistant",
              content : "Let's get started. How can I assist you with your document today?"
            }
          ])
        }, 800)
      }
    }, [location.state])


    const handleSend = () => {
      if (!input.trim()) return;

      const userMessage = {
        id : Date.now(),
        role : "user",
        content : input
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("");

      setTimeout(() => {

        const responses = [
          "This is a sample response.",
          "I can help you refine that paragraph. Would you like me to make it more concise or elaborate further?",
          "Great idea! I've drafted a suggestion. Click the insert button to add it to your document.",
          "Here's a polished version of your text with improved clarity and flow.",
          "I've analyzed your request. Here's what I recommend for your document.",
        ]

        setMessages((prev) => [
          ...prev,
          {
            id : Date.now() + 1,
            role : "assistant",
            content : responses[Math.floor(Math.random() * responses.length)]
          }
        ])
      }, 1000)
    }
*/}

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  }
    

  return (
    <>
      <div className='w-1/3 max-w-lg bg-[#1a1a24] text-white pt-3 flex flex-col h-screen shrink-0'>

        <div className="flex items-center gap-1 group">
            <div className="
                w-[clamp(40px,8vw,48px)]
                h-[clamp(40px,8vw,48px)]
                rounded-full flex items-center justify-center
                bg-transparent overflow-hidden
                transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                group-hover:-translate-y-[2px]
                group-hover:rotate-[5deg]
                group-hover:scale-110
                group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]
                group-hover:drop-shadow-[0_8px_25px_rgba(99,102,241,0.3)]
                cursor-pointer                
            ">
                <img
                    src={logo}
                    alt="logo"
                    className="w-[80%] h-[80%] object-contain animate-sparkle"
                    onClick={() => navigate('/home')}   
                />
            </div>
            <h1 className="
                font-bold
                text-[clamp(1.125rem,3vw,1.5rem)]
                bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]
                bg-clip-text text-transparent
                transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                group-hover:bg-gradient-to-br
                group-hover:from-[#6366f1]
                group-hover:via-[#a855f7]
                group-hover:to-[#ec4899]
                cursor-pointer"
                
                onClick={() => navigate("/home")}
            >
                DraftFlow
            </h1>
        </div>

        <div className='w-full h-px bg-white/10 mt-2'></div>

  
        <div className='
          flex-1 overflow-y-auto overflow-x-hidden px-4 mt-4

          [scrollbar-width:thin]
          [scrollbar-color:rgba(255,255,255,0.3)_transparent]

          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:bg-transparent
          hover:[&::-webkit-scrollbar-thumb]:bg-white/50
          [&::-webkit-scrollbar-thumb]:bg-white/30
        '>
          <div className='flex flex-col gap-4 pb-6'>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`text-sm rounded-xl px-4 py-3 max-w-[75%] break-words ${
                    msg.role === "user" ? "bg-purple-500" : "bg-gray-700/60"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
        </div>


        
        <div className="shrink-0 flex items-center bg-[#1b1c2c] border border-white/10 rounded-xl px-4 py-3 mx-3 mb-4 mt-auto">

            <textarea
                type="text"
                placeholder="Ask anything..."
                className="flex-1 bg-transparent outline-none text-gray-200 resize-none overflow-hidden"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  } 
                }}
            />

            <AiOutlineStar className="text-gray-400 text-xl mx-3 cursor-pointer" />
            <FiMic className="text-gray-400 text-xl mx-3 cursor-pointer" />

            <button 
              onClick={handleSend}
              disabled={loading}
              className="w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center"
            >
                <FiSend className="text-white text-xl" />
            </button>

        </div>

      </div>  
    </>
  )
}

export default ChatInterface