import React from 'react'

const Loader = () => {
  return (
     <div className='w-full h-screen flex items-center justify-center'>
       <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-stone-900 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 flex  rounded-full items-center justify-center">
                <h1 className='text-7xl font-bold text-white '>A</h1>
                {/*<img src="/logo.png" alt="Logo" className="w-10 h-10" />*/}
                {/* Or use text instead */}
                {/* <span className="text-sm font-semibold">Loading</span> */}
            </div>
        </div> 
    </div>
  )
}

export default Loader