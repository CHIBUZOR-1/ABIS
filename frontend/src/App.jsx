import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import ScrollToTop from './Components/ScrollToTop';
import Loader from './Components/Loader';
import LoginPage from './Pages/LoginPage';
import Homepage from './Pages/Homepage';
import PageNotFound from './Pages/PageNotFound';
import SignUpPage from './Pages/SignUpPage';
import PasswordResetPage from './Pages/PasswordResetPage';
import { useSelector } from 'react-redux';

function App() {
  const navigate = useNavigate();
  const user = useSelector(state => state.user.user?.id)
  const [loading, setLoading] = useState(true)
  useEffect(() => { 
    setTimeout(() => { 
      setLoading(false); 
    }, 3000);  
  }, []); 

  if (loading) { 
    return <Loader />; 
  }

  return (
    <>
      <ToastContainer className='max-sm:flex max-sm:w-full px-1 max-sm:justify-center font-semibold' />
      <ScrollToTop />
      <Routes>
        <Route path='/' element={user? <Navigate to="/home" /> : <LoginPage />}/>
        <Route path='/home' element={!user? <Navigate to="/" /> : <Homepage />}/>
        <Route path='/register' element={<SignUpPage/>}/>
        <Route path='/reset-password' element={<PasswordResetPage/>}/>
        <Route path='*' element={<PageNotFound />}/>
      </Routes>
    </>
  )
}

export default App
