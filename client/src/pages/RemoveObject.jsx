import React, { useState } from 'react'
import {Eraser, Scissors, Sparkle} from 'lucide-react'
import axios from 'axios'
// import { toast } from 'react-toastify'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const RemoveObject = () => {

  const [input, setInput] = useState('');
  const [object, setObject] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');

  const {getToken} = useAuth();
    
  const onSubmitHandler = async(e) => {
    e.preventDefault();
    
    // if (!input) {
    //   toast.error('Please upload an image');
    //   return;
    // }
    
    // if (!object.trim()) {
    //   toast.error('Please describe the object to remove');
    //   return;
    // }

    // setResultImage('');
    
    try {
      setIsLoading(true);

      if (object.split(' ').length > 1) 
      {
          return toast('Please provide a single object name');
      }

      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', object);

      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        }
      });

      if (data.success) {
        console.log('Backend response:', data); // Debug log
        setContent(data.image_url); 
        toast.success('Object removed successfully!');
      } else {
        toast.error(data.message || 'Failed to remove object');
      }
    } catch (error) {
      console.error('Error removing object:', error);
      toast.error(error.response?.data?.message || 'Failed to remove object');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

      {/* left col */}
      <form onSubmit={onSubmitHandler} action="" className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">

        <div className="flex items-center gap-3">
          <Sparkle className="w-6 text-[#4A7AFF]" />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>
          Upload Image
        </p>

        <input onChange={(e)=>setInput(e.target.files[0])} type="file" accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'  required/>

        <p className='mt-6 text-sm font-medium'>
          Describe Object to Remove
        </p>

        <textarea onChange={(e)=>setObject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='e.g., Watch or Spoon , Only Single object name' required/>


        <button 
          type="submit"
          disabled={isLoading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed' 
        >
          {
             isLoading ? (<span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>) : <Scissors className='w-5' />
          } 
          Remove Object
        </button>

      </form>


      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
            <div className='flex items-center gap-3'>
              <Scissors className='w-5 h-5 text-[#4A7AFF]' />
              <h1 className='text-xl font-semibold'>Processed Image</h1>
            </div>

            { 
                !content ? (
                  <div className='flex justify-center items-center h-[331px]'>
                    <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                      <Scissors className='w-9 h-9'/>
                      <p>Upload an image and click "Remove Object" to get started</p>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={content} 
                    alt="Processed image" 
                    className='mt-3 w-full h-145 object-contain rounded-lg'
                  />
                )
            }

      </div>


     
    </div>
  )
}

export default RemoveObject