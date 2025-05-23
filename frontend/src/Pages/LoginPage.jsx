import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import axios from 'axios'
import { toast } from 'react-toastify';
import { setUser } from '../Redux/UserSlice';
import Layout from '../Components/Layout';

const LoginPage = () => {
  const nav = useNavigate();
  const dispatch = useDispatch()
  const [details, setDetails] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value})
  }
  const Submit = async() => {
    try {
      setLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, details);
      if (data.ok) {
        toast.success(data.msg);
        dispatch(setUser(data.details));
        nav('/home');
      } 
    } catch (error) {
      console.log(error.response)
      toast.error(error.response.data.msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={'ABIS - Login'}>
      <div className='h-screen bg-gray-200 flex justify-center items-center p-3'>
        <div className='h-full flex flex-col  items-center bg-white w-full'>
          <div className='w-full flex items-center justify-center p-2'>
            <h1 className='bg-gray-950 inline-block h-20 w-20 p-4 text-5xl text-slate-50 text-center font-semibold rounded-full'>A</h1>
          </div>
          <div className='w-full space-y-2 p-2'>
            <input type="email" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='email' value={details.email} placeholder='Email' />
            <input type="password" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='password' value={details.password} placeholder='Password' />
          </div>
          <div className='w-full p-2 flex items-center justify-center'>
            <button onClick={Submit} className='p-1 border rounded-md flex items-center justify-center gap-2 bg-slate-300 font-medium active:bg-slate-100 w-[70%]'>Login {loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-slate-600 animate-spin'></span>}</button>
          </div>
          <div className='w-full'>
            <div className='flex p-2'>
              <p onClick={()=> nav('/reset-password')} className='ml-auto text-blue-500 font-medium hover:underline cursor-pointer'>Forgot Password</p>
            </div>
            <div className='flex items-center p-2 justify-center'>
              <p className='text-slate-500 font-medium'>Don't have an account? <span onClick={()=> nav('/register')} className='text-blue-500 hover:underline cursor-pointer'>Sign up</span></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage