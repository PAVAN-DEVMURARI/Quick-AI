import React, { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { dummyPublishedCreationData } from '../assets/assets';
import axios from 'axios';
import toast from 'react-hot-toast';


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';


const Community = () => {

  const [creation,setCreation] = useState([])
  const {user} = useUser();

  const [loading,setLoading] = useState(true);
  const {getToken} = useAuth();
 
  const fetchCreations = async() => {
    try{
      console.log('Fetching published creations...');
      const {data} = await axios.get('/api/user/get-published-creations',{
        headers : {Authorization : `Bearer ${await getToken()}`},
      })
      console.log('API Response:', data);
      if (data.success)
      {
        console.log('Creations found:', data.creations.length);
        setCreation(data.creations);
      }
      else
      {
        console.log('API returned error:', data.message);
        // Fallback to dummy data if API fails
        setCreation(dummyPublishedCreationData);
      }
    }
    catch(error)
    {
      console.error('Error fetching creations:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load creations, showing sample data');
      // Fallback to dummy data if API call fails
      setCreation(dummyPublishedCreationData);
    }
    setLoading(false);
  }

  const imageLikeToggle = async(id) => {
     try{
            console.log('Toggling like for creation ID:', id);
            const {data} = await axios.post('/api/user/toggle-like-creation',{
               id
            },{
               headers : {Authorization : `Bearer ${await getToken()}`},
            })

            console.log('Like toggle response:', data);
            if (data.success)
            {
               toast.success(data.message);
               await fetchCreations();
            }
            else
            {
                toast.error(data.message);
            }
     }
     catch(error)
      {
          console.error('Like toggle error:', error);
          console.error('Error response:', error.response?.data);
          toast.error(error.response?.data?.message || error.message);
      }
  }

  useEffect(() => {
    if (user)
    {
      fetchCreations();
    }
  }, [user])

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <h1 className='text-2xl font-semibold text-gray-800'>Community Creations</h1>
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll p-4'>

        {loading ? (
          <div className='flex justify-center items-center h-full'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          </div>
        ) : creation.length === 0 ? (
          <div className='flex justify-center items-center h-full'>
            <p className='text-gray-500'>No creations found. Be the first to share!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {creation.map((creation, index) => (
              <div key={index} className='relative group'>
                <div className='aspect-square overflow-hidden rounded-lg bg-gray-100'>
                  <img 
                    src={creation.content || '/gradientBackground.png'} 
                    alt={creation.prompt || 'AI Generated Creation'}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Image+Not+Found';
                    }}
                  />
                  
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'>
                    <div className='absolute bottom-0 left-0 right-0 p-4'>
                      <p className='text-white text-sm mb-2 line-clamp-2'>{creation.prompt}</p>
                      <div className='flex items-center justify-between'>
                        <span className='text-white/80 text-xs'>{creation.type}</span>
                        <div className='flex gap-1 items-center'>
                          <span className='text-white text-sm'>{creation.likes?.length || 0}</span>
                          <Heart 
                            onClick={() => imageLikeToggle(creation.id)}
                            className={`w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${
                              creation.likes?.includes(user?.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-white hover:text-red-400'
                            }`} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Community