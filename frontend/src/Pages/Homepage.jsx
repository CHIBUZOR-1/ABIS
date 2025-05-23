import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../Components/Avatar';
import { FaCamera } from "react-icons/fa";
import { logout, updateProfilez } from '../Redux/UserSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../Components/Layout';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const user = useSelector(state=> state?.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const profileImgRef = useRef(null);
  const [load, setLoad] = useState(false);
  const [det, setDet] = useState({})
  useEffect(() => {
  if (user) {
    setDet({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      image: '',
    });
  }
}, [user]);
  const handleChange = (e) => {
    setDet({ ...det, [e.target.name]: e.target.value });
  }
  const uploadImg = (e) => {
    const file = e.target.files[0]
    setDet(prev => ({...prev, image: file}))
  }
  const handleFileUpload = async (file) => { 
    const formData = new FormData(); 
    formData.append('file', file); 
    try { 
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/uploadProfilePhoto`, formData); 
        return data; 
    } catch (error) { 
        console.error('Error uploading file:', error); 
        return null; 
    } 
};
  const logOut = async()=> {
    const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/logout`);
    if(data.ok) {
      toast.success(data.msg);
      dispatch(logout());
      navigate('/')
    }
    
  }
 const handleUpdate = async(e) => {
    e.preventDefault()
    let imageUrl = null;
    let image_id = null;
    if (det.image) { 
      const result = await handleFileUpload(det.image);
      imageUrl = result.secure_url;
      image_id = result.public_id
    }
    const newDetails = { name: det.name, email: det.email, phone: det.phone, image: imageUrl, image_id};
    try {
      setLoad(true)
      const {data} = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/update-user`, newDetails) 
      if(data.ok) {
        dispatch(updateProfilez(data.updatedUser));
        setDet({
          name: data.updatedUser.name,
          email:  data.updatedUser.email,
          phone:  data.updatedUser.phone,
          image: ''
        })
        toast.success(data.msg)
      }
    } catch (error) {
      console.log(error.response)
      toast.error(error.response.data.msg)
    } finally {
      setLoad(false)
    }
 }
  return (
    <Layout title={'ABIS - Home'}>
      <div className='w-full h-screen flex flex-col gap-2 pt-16 items-center p-2'>
        <div className="w-full p-2">
          <h3 data-testid="home-title" className='text-xl font-semibold'>My Profile</h3>
        </div>
        <div className='w-full flex items-center justify-center'>
          <div className=' relative w-fit rounded-full '>
            <Avatar height={300} image={!det?.image?  user?.photo : URL.createObjectURL(det?.image)} width={300} s={50} name={(user?.name)?.toUpperCase() || ""}/>
            <div onClick={()=> profileImgRef.current.click()} className={`absolute hover hover:text-slate-50  cursor-pointer rounded-full w-8 h-8 p-2 bg-slate-200 flex items-center justify-center right-10 bottom-2 shadow`}><FaCamera /><label htmlFor="profilePic" className=' sr-only'>Camera</label></div>
            <input id='profilePic' onChange={uploadImg} ref={profileImgRef} hidden accept='image/*' type="file" />
          </div>
        </div>
        
        <div className='w-full space-y-1 border p-1'>
          <div className='w-full gap-2 flex items-center justify-center'>
            <label htmlFor="name" className='font-medium text-slate-600'>Fullname:</label>
            <input id='name' className='w-full border text-slate-600 font-semibold p-1' onChange={handleChange} value={det?.name} type="text" name="name"/> 
          </div>
          <div className='w-full gap-2 flex items-center justify-center'>
            <label htmlFor='email' className='font-medium text-slate-600'>Email:</label>
            <input id='email' className='w-full border text-slate-600 font-semibold p-1' onChange={handleChange} value={det?.email} type="email" name="email"/> 
          </div>
          <div className='w-full gap-2 flex items-center justify-center'>
            <label htmlFor='phone' className='font-medium text-slate-600'>Phone:</label>
            <input id='phone' className='w-full border text-slate-600 font-semibold p-1' onChange={handleChange} value={det?.phone} type="text" name="phone" /> 
          </div>
          
        </div>
        <div className='w-full flex flex-col gap-2 items-center justify-center p-1'>
          <button onClick={handleUpdate}  className='p-2 w-[70%] flex gap-2 justify-center items-center active:bg-slate-100 bg-slate-200 text-slate-600 font-semibold rounded-md'>Update {load && <span className='h-5 w-5 border-[2px] rounded-full  border-t-teal-400 animate-spin'></span>}</button>
          <button onClick={logOut} className='p-2 border rounded-md flex items-center justify-center bg-slate-200 font-medium active:bg-slate-100 w-[70%] text-slate-600'>Logout</button>
        </div>
      </div>
    </Layout>
  )
}

export default Homepage