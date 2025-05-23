import React from 'react'

const Avatar = ({name, image, width, height, s}) => {
    let avatarName = "";
    if(name) {
        const splitName = name?.split(" ");

        if (splitName.length >= 2) {
            avatarName = splitName[0][0] + splitName[splitName.length - 1][0]
        } else {
            avatarName = splitName[0][0]
        }
    }
  return (
    <div style={{width : width+'px', height : height+"px"}} className='rounded-full h-fit w-fit overflow-hidden text-xl justify-center items-center flex flex-shrink-0 border bg-blue-500 text-slate-50 font-bold'>
      {
        image ? (
          <div className='rounded-full relative  h-full w-full' >
            <img src={image} className='rounded-full inset-0 absolute h-full w-full' alt="" />
          </div>
        ) : name ? (
          <div style={{fontSize: s+'px'}}>
            {avatarName.toString()}
          </div>
        ) : (
          <div style={{width : width+'px', height : height+"px"}}>
            <p>NA</p>
          </div>
        )
      }
    </div>
  )
}

export default Avatar