import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react';
import { assets } from '../assets/assets.js'
import {useClerk , UserButton , useUser} from '@clerk/clerk-react'

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();

    const {user} = useUser();
    const {openSignIn} = useClerk();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

  return (
    <>
        <div className='fixed z-50 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 border-b border-white/10'>
            <img src={assets.logo} alt="Logo" className='w-28 sm:w-32 md:w-44 cursor-pointer' onClick={() => {
                navigate('/');
            }}/>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center'>
                {
                  user ? <UserButton /> : (
                    <button onClick={openSignIn} className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-6 lg:px-10 py-2.5'>
                        Get Started
                        <ArrowRight className='w-4 h-4' />
                    </button>
                  )
                }
            </div>

            {/* Mobile Menu Button */}
            <div className='md:hidden'>
                <button 
                    onClick={toggleMobileMenu}
                    className='p-2 rounded-lg hover:bg-white/10 transition-colors'
                >
                    {isMobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                </button>
            </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className='fixed inset-0 z-40 md:hidden'>
                <div className='fixed inset-0 bg-black/50' onClick={toggleMobileMenu}></div>
                <div className='fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out'>
                    <div className='p-6 pt-20'>
                        {user ? (
                            <div className='flex flex-col items-center space-y-4'>
                                <UserButton />
                                <button 
                                    onClick={() => {
                                        navigate('/app');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className='w-full bg-primary text-white py-3 px-6 rounded-lg'
                                >
                                    Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <button 
                                    onClick={() => {
                                        openSignIn();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className='w-full flex items-center justify-center gap-2 rounded-lg text-sm cursor-pointer bg-primary text-white px-6 py-3'
                                >
                                    Get Started
                                    <ArrowRight className='w-4 h-4' />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
  )
}

export default Navbar