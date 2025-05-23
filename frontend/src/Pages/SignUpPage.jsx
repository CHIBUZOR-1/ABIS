import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../Components/Layout';

const SignUpPage = () => {
    const nav = useNavigate();
  const dispatch = useDispatch();
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    secret: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('')

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value})
  }
  const Submit = async() => {
    try {
      setLoading(true);
      if (details.password !== details.confirmPassword) {
          toast.warn("Passwords do not match.");
          setLoading(false);
          return;
      }
      if (!details.secret.trim()) {
        setNote('Secret Keyword required!')
        setLoading(false);
        return;
      }
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, details);
      if (data.ok) {
        toast.success(data.msg);
        nav('/');
      } 
    } catch (error) {
      console.log(error.response)
      toast.error(error.response.data.msg)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Layout title={'ABIS - Sign up'}>
      <div className='h-screen bg-gray-200 flex justify-center items-center p-3'>
        <div className='h-full flex flex-col  items-center bg-white w-full'>
          <div className='w-full flex items-center justify-center p-2'>
            <h1 className='bg-gray-950 inline-block h-20 w-20 p-4 text-5xl text-slate-50 text-center font-semibold rounded-full'>A</h1>
          </div>
          <div className='w-full space-y-2 p-2'>
            <input type="text" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='name' value={details.name} placeholder='Name' />
            <input type="email" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='email' value={details.email} placeholder='Email' />
            <input type="text" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='phone' value={details.phone} placeholder='Phone' />
            <input type="text" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='secret' value={details.secret} placeholder='Secret key' />
            <input type="password" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='password' value={details.password} placeholder='Password' />
            <input type="password" onChange={handleChange} className='w-full border p-1 font-medium bg-slate-100 text-slate-500 rounded-md' name='confirmPassword' value={details.confirmPassword} placeholder='Confirm Password' />
          </div>
          <div className={`${!note && 'hidden'} p-1`}>
            <p className='text-sm text-red-500 font-medium'>{note}</p>
          </div>
          <div className='w-full p-2 flex items-center justify-center'>
            <button onClick={Submit} className='p-1 border rounded-md flex items-center justify-center gap-2 bg-slate-300 font-medium active:bg-slate-100 w-[70%]'>Sign Up {loading && <span className='h-5 w-5 border-[2px] rounded-full  border-t-slate-600 animate-spin'></span>}</button>
          </div>
          <div className='w-full'>
            <div className='flex items-center p-2 justify-center'>
              <p className='text-slate-500 font-medium'>Already have an account? <span onClick={()=> nav('/')} className='text-blue-500 hover:underline cursor-pointer'>Sign In</span></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SignUpPage