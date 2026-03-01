import React, { useState } from 'react'
import logo from '../assets/logo1_bg.png'
import UserMenu from '../components/UserMenu';
import { useNavigate } from 'react-router-dom';

function HomePage() {

    const navigate = useNavigate();
    
    const [input, setInput] = useState("");

    const handleTransformText = () => {
        if (!input.trim()) return;

        navigate("/editor", {
            state : {
                firstMessage : input
            }
        });
    }

  return (
    <>
        <div className='min-h-screen w-full bg-gradient-to-br from-[#0a0f1f] to-[#1c133b] text-white px-6 py-6'>

            <div className='flex justify-between item-center mb-19'>
                <div className="
                    flex items-center gap-1 group cursor-pointer
                    transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                    hover:-translate-y-[2px]
                    hover:drop-shadow-[0_8px_25px_rgba(99,102,241,0.3)]
                ">
                    <div className="
                        w-[clamp(40px,8vw,48px)]
                        h-[clamp(40px,8vw,48px)]
                        rounded-full flex items-center justify-center
                        bg-transparent overflow-hidden
                        transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                        group-hover:rotate-[5deg]
                        group-hover:scale-110
                        group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]
                    ">
                        <img
                            src={logo}
                            alt="logo"
                            className="w-[80%] h-[80%] object-contain animate-sparkle"
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
                    ">
                        DraftFlow
                    </h1>
                </div>

                <UserMenu />
                
            </div>

            <div className='text-center'>
                <h1 className="
                    font-bold
                    leading-[1.2]
                    text-[clamp(2rem,7vw,3.8rem)]
                    bg-gradient-to-br from-white via-[#6366f1] to-[#8b5cf6]
                    bg-clip-text 
                    text-transparent
                    animate-titleGlow
                ">
                    TRANSFORM YOUR TEXT
                </h1>
                <p className="
                    mt-4
                    font-normal
                    text-[clamp(0.875rem,3vw,1.25rem)]
                    text-white/70
                    max-w-[min(600px,90vw)]
                    mx-auto
                    opacity-0
                    animate-fadeInUp
                ">
                  Convert unformatted text into beautifully styled documents  
                  <br />
                  with AI-powered formatting
                </p>
            </div>

            
            <div className='
                max-w-3xl mx-auto mt-11 bg-white/5 backdrop-blur-lg border border-gray-600/20 rounded-2xl p-6 shadow-xl relative
                
                [scrollbar-width:thin]
                [scrollbar-color:rgba(255,255,255,0.3)_transparent]

                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                hover:[&::-webkit-scrollbar-thumb]:bg-white/50
                [&::-webkit-scrollbar-thumb]:bg-white/30
            '>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleTransformText();
                        }
                    }}
                    placeholder="Paste your unformatted text here and watch the magic happen... ✨"
                    className="
                        w-full h-64 bg-[#0f0f1a] 
                        rounded-xl p-4 
                        outline-none
                        resize-none 
                        text-gray-100
                        border border-white/10
                        focus:border-blue-500/40
                        focus:shadow-[0_0_20px_rgba(0,150,255,0.3)]
                        transition-all duration-300
                    "
                ></textarea>
                <div className="text-gray-400 text-right text-sm -mb-3">
                    {input.length} characters
                </div>
            </div>


            <div className='flex justify-center gap-4 mt-10'>
                <button className='
                    px-8 py-3 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] transition font-semibold shadow-lg cursor-pointer
                    flex items-center justify-center gap-3
                    relative overflow-hidden
                    text-white font-semibold
                    shadow-[0_0_20px_rgba(99,102,241,0.3)]
                    hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]
                    active:-translate-y-[1px] active:scale-[0.98]
                    transition-all duration-300 '

                    onClick={handleTransformText}
                >
                    Transform Text
                </button>

                <button
                    onClick={() => setInput("")}
                    className='
                        px-8 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition font-semibold cursor-pointer
                        border border-white/20
                        backdrop-blur-md
                        text-white/70
                        text-[clamp(0.875rem,2vw,1rem)]
                        hover:bg-white/10 hover:text-white hover:-translate-y-[2px]
                        transition-all duration-300
                           
                    '
                >
                    Clear All
                </button>
            </div>
        </div>
    </>
  )
}

export default HomePage