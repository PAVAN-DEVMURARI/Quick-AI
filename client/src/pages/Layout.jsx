import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../components/SideBar'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <SideBar 
        isMobileOpen={isSidebarOpen} 
        onMobileClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 overflow-auto md:ml-0">
        {/* Mobile menu button */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout