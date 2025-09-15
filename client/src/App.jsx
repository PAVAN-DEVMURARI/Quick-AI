import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitle from './pages/BlogTitle'
import GenerateImages from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import Community from './pages/Community'

const App = () => {
  return (
    <Routes>
      {/* Home page without sidebar */}
      <Route path='/' element={<Home />} />
      
      {/* All app pages with sidebar layout */}
      <Route path='/app' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='write-article' element={<WriteArticle />} /> 
        <Route path='blog-title' element={<BlogTitle />} /> 
        <Route path='generate-images' element={<GenerateImages />} /> 
        <Route path='remove-background' element={<RemoveBackground />} /> 
        <Route path='remove-object' element={<RemoveObject />} /> 
        <Route path='review-resume' element={<ReviewResume />} /> 
        <Route path='community' element={<Community />} /> 
      </Route>
    </Routes>
  ) 
}

export default App