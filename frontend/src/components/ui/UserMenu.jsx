import { signOut } from 'firebase/auth';
import { auth } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react'
import EditProfileModal from './EditProfileModal';


const getInitials = (name) => {
    if (!name) return "" ;

    const words = name.trim().split(" ");
    
    return words.length === 1
        ? words[0].charAt(0).toUpperCase()
        : (words[0][0] + words[words.length -1][0]).toUpperCase();
};


const UserMenu = () => {

    const [openMenu, setOpenMenu] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);

    const menuRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => {
            if(menuRef.current && !menuRef.current.contains(e.target)){
                setOpenMenu(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully");
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error.message);
        }
    };


    const user = auth.currentUser;
    const initials = getInitials(user?.displayName);



  return (
    <>
        <div className='relative' ref={menuRef}>

            <button
                onClick={() => setOpenMenu(!openMenu)} 
                className='w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-semibold text-white hover:bg-purple-600 transition cursor-pointer'
            >
                {initials}
            </button>

            {openMenu && (
                <div className='absolute right-0 mt-3 w-44 bg-[#121528] text-white rounded-xl shadow-lg border border-white/10 p-3 animate-fade z-50'>
                    <ul className='space-y-2'>
                        <li
                            onClick={() => {
                                setOpenProfile(true);
                                setOpenMenu(false);
                            }} 
                            className='cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg'>
                            Profile
                        </li>
                        <li className='cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg'>
                            Settings
                        </li>
                        <li className='cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg'>
                            Help & Support
                        </li>
                        <li className='cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg'>
                            About
                        </li>
                        <li className='cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg'>
                            Privacy
                        </li>
                        <li 
                            className='cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg text-red-400'
                            onClick={handleLogout}
                        >
                            Logout
                        </li>
                    </ul>
                </div>
            )}
        </div>


        {openProfile && (
            <EditProfileModal 
                currentName={user.displayName}
                email = {user.email}
                onClose={() => setOpenProfile(false)}
                initials={initials}
            />
        )}
    </>
  )
}

export default UserMenu