import React from 'react'
import { useLocation } from 'react-router-dom'

const Appbar = () => {
  const loc = useLocation();
  return (
    <div className={`w-full ${['/', '/register', '/reset-password'].includes(loc.pathname) && 'hidden'} p-2 flex items-center z-20 gap-2 border-b bg-white fixed`}>
      <div className='bg-gray-900 rounded-full flex items-center justify-center w-12 h-12'>
        <h1 className=' text-slate-50 font-bold text-3xl'>A</h1>
      </div>
      <p className='font-medium text-slate-500'>ABIS.</p>
    </div>
  )
}

export default Appbar