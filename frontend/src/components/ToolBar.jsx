import { useState, useEffect, } from 'react';
import { FaUndo, FaRedo, FaDownload, FaShareAlt, FaRegEye } from 'react-icons/fa'
import { FiCopy } from 'react-icons/fi'
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import UserMenu from './UserMenu'

const ToolBar = () => {


    const [status, setStatus] = useState("saved"); 

    useEffect(() => {
        setStatus("saving");

        const timer = setTimeout(() => {
            setStatus("saved");
        }, 1200);

        return () => clearTimeout(timer);
    }, []);


  return (
    <>
        <div className='flex items-center pb-3 pt-4 px-4 border-b bg-[#1a1a24]'>
        
            
            <input
                placeholder="Untitled Document"
                maxLength={17}
                className="
                    bg-transparent 
                    border border-transparent
                    text-white font-medium text-lg 
                    outline-none 
                    px-2 py-1
                    rounded
                    transition-all duration-200 
                    min-w-[120px]

                    hover:bg-[var(--glass-bg)]
                    focus:bg-[var(--glass-bg)]
                    
                "
            />

            <div className='flex items-center text-gray-700 text-xl gap-14 space-x-6 ml-7'>
                <button className={`
                    text-[12px] font-normal px-2 py-1 rounded-md whitespace-nowrap select-none transition-all border -ml-10
                    ${status === "saving" ? 
                        "text-[#94a3b8] bg-[#1e293b] border-[rgba(148,163,184,0.2)]" 
                    : 
                        "text-[#86efac] bg-[#1e293b] border-[rgba(134,239,172,0.2)]"
                    }
                `}>
                    {status === "saving" ? "Saving..." : "Saved"}
                </button>
            </div>

            <div className='flex items-center gap-14 text-gray-700 text-xl space-x-6 ml-auto'>
                
                <FaUndo className="cursor-pointer -mr-0" />
                <FaRedo className="cursor-pointer -mr-0" />
                <FaDownload className="cursor-pointer" />
                <FiCopy className="cursor-pointer" />
                <FaShareAlt className="cursor-pointer" />
                <FaRegEye className="cursor-pointer -mr-0" />
                <ArrowsPointingOutIcon className="w-5 h-5 -mr-2 cursor-pointer" />

                <div className='w-10 h-10 text-sm font-semibold ml-4'>
                    <UserMenu />
                </div>

            </div>
        </div>
    </>
  )
}

export default ToolBar