import React from 'react'
import { PricingTable } from '@clerk/clerk-react'

const Plan = () => {
  return (
    <div className='max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto z-20 my-20 md:my-30 px-4'>

        <div className='text-center'>
            <h2 className='text-slate-700 text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold'>
                Choose Your Plan
            </h2>
            <p className='text-gray-500 text-sm sm:text-base max-w-xs sm:max-w-lg md:max-w-xl mx-auto mt-3 sm:mt-4'>
                Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
            </p>
        </div>

        <div className='mt-8 sm:mt-10 md:mt-14 mx-4 sm:mx-6 md:mx-8'>
            <PricingTable />
        </div>

    </div>
  )
}

export default Plan