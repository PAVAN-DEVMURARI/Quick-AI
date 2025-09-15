import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { UserButton, useUser, useAuth } from '@clerk/clerk-react'
import { 
  Home, 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  ImageIcon, 
  Users, 
  Scissors, 
  Eraser,
  FileCheck,
  Sparkles
} from 'lucide-react'

const SideBar = ({ isMobileOpen, onMobileClose }) => {
  const { user } = useUser()
  const { has } = useAuth()
  const navigate = useNavigate()
  
  // Debug: Log user data to see what's available
  React.useEffect(() => {
    if (user) {
      console.log('User data:', user);
      console.log('Public metadata:', user.publicMetadata);
      console.log('Private metadata:', user.privateMetadata);
      console.log('Unsafe metadata:', user.unsafeMetadata);
      console.log('Has premium permission:', has?.({ permission: "premium" }));
      console.log('Has premium role:', has?.({ role: "premium" }));
    }
  }, [user, has]);

  // Check if user has premium plan using multiple methods
  const checkPremiumStatus = () => {
    // Method 1: Check Clerk roles/permissions
    if (has?.({ permission: "premium" }) || has?.({ role: "premium" })) {
      return true;
    }
    
    // Method 2: Check public metadata
    if (user?.publicMetadata?.subscription === "premium" || 
        user?.publicMetadata?.plan === "premium" ||
        user?.publicMetadata?.isPremium === true) {
      return true;
    }
    
    // Method 3: Check private metadata
    if (user?.privateMetadata?.subscription === "premium" ||
        user?.privateMetadata?.plan === "premium") {
      return true;
    }
    
    // Method 4: For testing - remove this when you have real subscription logic
    return true; // TODO: Set to false and implement real logic
  };
  
  const isPremium = checkPremiumStatus();

  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      path: '/',
      color: 'text-blue-600'
    },
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/app/dashboard',
      color: 'text-purple-600'
    },
    {
      title: 'Write Article',
      icon: PenTool,
      path: '/app/write-article',
      color: 'text-green-600'
    },
    {
      title: 'Blog Title',
      icon: FileText,
      path: '/app/blog-title',
      color: 'text-orange-600'
    },
    {
      title: 'Generate Images',
      icon: ImageIcon,
      path: '/app/generate-images',
      color: 'text-pink-600'
    },
    {
      title: 'Remove Background',
      icon: Scissors,
      path: '/app/remove-background',
      color: 'text-red-600'
    },
    {
      title: 'Remove Object',
      icon: Eraser,
      path: '/app/remove-object',
      color: 'text-yellow-600'
    },
    {
      title: 'Review Resume',
      icon: FileCheck,
      path: '/app/review-resume',
      color: 'text-indigo-600'
    },
    {
      title: 'Community',
      icon: Users,
      path: '/app/community',
      color: 'text-teal-600'
    }
  ]

  return (
    <div className={`
      fixed md:relative h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-50
      transform transition-transform duration-300 ease-in-out
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Logo/Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SwiftSuggest
            </h1>
          </div>
          {/* Close button for mobile */}
          <button
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
            onClick={onMobileClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>



      {/* Navigation Menu */}
      <nav className="flex-1 px-3 md:px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose} // Close mobile menu when navigating
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-l-4 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Icon className={`w-5 h-5 ${item.color}`} />
              <span className="truncate">{item.title}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 md:w-10 md:h-10"
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
              {user?.firstName || 'User'}
            </p>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isPremium ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="text-xs text-gray-500">
                  {isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
              {!isPremium && (
                <button 
                  onClick={() => {
                    navigate('/');
                    onMobileClose?.();
                  }}
                  className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-md hover:opacity-90 transition-opacity"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar