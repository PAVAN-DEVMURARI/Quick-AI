import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets.js';
const Hero = () => {

    const navigate = useNavigate();


  return (
    <div className='px-4 sm:px-8 md:px-16 lg:px-20 xl:px-32 relative flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen pt-20'>


        <div className='text-center mb-6 max-w-6xl mx-auto'>
            <h1 className='text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold mx-auto leading-[1.1] sm:leading-[1.2] mb-4 sm:mb-6'>
                Create Amazing Content <br className='hidden sm:block' /> 
                <span className='text-primary'>with AI tools</span>
            </h1>
            <p className='mt-4 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-gray-600 px-2'>
                Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
            </p>


            <div className='flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 text-xs sm:text-sm mt-6 sm:mt-8 px-4'>
                <button 
                    onClick={() => navigate('/app')} 
                    className='bg-primary text-white py-3 px-6 sm:px-8 md:px-10 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer w-full sm:w-auto'
                >
                    Start Creating Now
                </button>
                <button className='bg-white px-6 sm:px-8 md:px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer w-full sm:w-auto'>
                    Watch Demo
                </button>
            </div>
        </div>
        
        <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm'>
            <img src={assets.user_group} alt="User group" className='h-6 sm:h-8' />
            <span className='text-center'>Trusted by 10k+ people</span>
        </div>


    </div>
  );
};

export default Hero;
