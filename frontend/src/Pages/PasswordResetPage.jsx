import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../Components/Layout';
import { IoArrowBackOutline } from "react-icons/io5";

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [dataz, setData] = useState({
    email: '',
    secret: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [load, setLoad] = useState(false)
  const handleChange = (e) => {
    setData({ ...dataz, [e.target.name]: e.target.value });
  }
  const handleSubmit = async()=> {
    try {
      setLoad(true)
      if (!dataz.email.trim() || !dataz.secret.trim() || !dataz.newPassword || !dataz.confirmNewPassword) {
        toast.warn("All fields are required.");
        setLoad(false)
        return;
      }
      if (dataz.newPassword !== dataz.confirmNewPassword) {
        toast.warn("Passwords do not match.");
        setLoad(false)
        return;
      }
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/reset-password`, dataz);
      if(data.ok) {
        toast.success(data.msg)
        navigate('/')
      }
    } catch (error) {
      console.log(error.response)
      toast.error(error.response.data.msg)
    } finally {
      setLoad(false)
    }
  }

  return (
    <Layout title={'ABIS - Password Reset'}>
      <div className='flex items-center p-3 h-screen bg-slate-400 justify-center w-full'>
          <div className='flex relative w-full flex-col p-1 bg-white h-full gap-2 items-center justify-center'>
              <div onClick={()=> navigate('/')} className='absolute cursor-pointer top-1 rounded-full active:bg-slate-200 bg-gray-800 group p-2 border z-20 left-1'>
                <IoArrowBackOutline className='text-white' />
              </div>
              <div className='w-full flex items-center justify-center p-2'>
                <h1 className='bg-gray-950 inline-block h-20 w-20 p-4 text-5xl text-slate-50 text-center font-semibold rounded-full'>A</h1>
              </div>
              <div className='border p-3 flex flex-col gap-2 items-center max-md:w-[80%] justify-center rounded-md md:w-[50%]'>
                  <h2 className='font-bold text-2xl max-sm:text-xl text-center text-slate-600'>RESET PASSWORD</h2>
                  <div className='flex flex-col w-full justify-center gap-1'>
                      <div className='text-slate-600'>
                          <input name='email' className='p-2 border font-medium border-slate-300 w-full outline-blue-300 rounded-md' value={dataz.email} type='email' placeholder='Email'  onChange={handleChange} />
                      </div>
                      <br />
                      <div className='text-slate-600'>
                          <input name='secret' className='p-2 border font-medium border-slate-300 w-full outline-blue-300 rounded-md' value={dataz.secret} type='text' placeholder='Secret'  onChange={handleChange} required/>
                      </div>
                      <br />
                      <div className='text-slate-600'>
                          <input name='newPassword' className='p-2 border font-medium border-slate-300 w-full outline-blue-300 rounded-md' value={dataz.newPassword}type='password' placeholder='Password' onChange={handleChange} />
                      </div>
                      <br />
                      <div className='text-slate-600'>
                          <input name='confirmNewPassword' className='p-2 font-medium border border-slate-300 w-full outline-blue-300 rounded-md' value={dataz.confirmNewPassword} type='password' placeholder='Confirm Password' onChange={handleChange} />
                      </div>
                      <br />
                      <div className='w-full flex items-center justify-center p-1'>
                          <button onClick={handleSubmit} className='p-1 border rounded-md flex items-center justify-center gap-2 bg-slate-300 font-medium active:bg-slate-100 w-[70%]'>RESET {load && <span className='h-5 w-5 border-[2px] rounded-full  border-t-slate-600 animate-spin'></span>}</button>
                      </div>
                  </div>
                  
              </div>

        </div>
      </div>
    </Layout>
  )
}

export default PasswordResetPage