import React from 'react'
import Layout from '../Components/Layout'
import { Link } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <Layout title={'Page not found'}>
      <div className=' flex min-h[65vh] flex-col pt-8 items-center justify-center'>
        <h1 className=' font-semibold text-[90px]'>404</h1>
        <h2>oops ! Page Not Found</h2>
        <Link to="/home" className=' m-3 p-3 bg-slate-100 border border-solid active:bg-black active:text-white'>Go Back</Link>
     </div>
    </Layout>
  )
}

export default PageNotFound