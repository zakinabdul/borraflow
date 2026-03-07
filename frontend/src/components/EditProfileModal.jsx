import { auth } from '../firebase/auth';
import { updateProfile } from 'firebase/auth';
import React, { useState } from 'react'

const EditProfileModal = ({ currentName, onClose, initials, email }) => {

    const [displayName, setDisplayName] = useState(currentName);

    const handleSave = async () => {
        if (!auth.currentUser) return;

        await updateProfile(auth.currentUser, {
            displayName: displayName
        });

        onClose();
    };


  return (
    <>

        <div
            onClick={onClose} 
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'
        >
            <div
                onClick={(e) => e.stopPropagation()} 
                className='w-full max-w-md rounded-2xl bg-[#1e1e1e] text-white p-6 shadow-2xl'
            >

                <h2 className='text-lg font-semibold mb-6'>Edit Profile</h2>

                <div className='flex justify-center mb-2'>
                    <div className='relative'>
                        <div className='w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center font-semibold text-white text-3xl'>
                            {initials}
                        </div>
                    </div>
                </div>
                <p className='text-sm font-sm flex items-center justify-center text-gray-400 mb-5'>{email}</p>


                <div className='mb-4'>
                    <label className='text-sm text-gray-400'>Display Name</label>
                    <input
                        type='text'
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className='mt-1 w-full rounded-lg bg[#121212] border border-white/10 px-3 py-2 focus:outline-none focus:border-purple-500'
                    />
                </div>

                <p className="text-xs text-gray-400 mb-6">
                    Your profile helps people recognize you. Your name and
                    username are also used in the app.
                </p>

                <div className='flex justify-end gap-3'>
                    <button 
                        className='px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer'
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        className="rounded-lg px-4 py-2 bg-white text-black font-semibold hover:bg-gray-300 transition cursor-pointer"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </>
  )
}

export default EditProfileModal