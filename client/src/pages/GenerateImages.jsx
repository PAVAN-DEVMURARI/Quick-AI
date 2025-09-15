import React from 'react'
import {Hash, Image, Sparkle} from 'lucide-react'
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';


const GenerateImages = () => {

  const ImageStyle = [
        'Realistic' , 'Ghibli Style' , 'Anime Style' , 'Cartoon Style' , 'Fantasy Style' , 'Realistic Style' , '3D Style' , 'Portrait Style'
      ]

      const [selectedStyle, setSelectedStyle] = useState(ImageStyle[0]);
      const [input, setInput] = useState('');
      const [published, setPublished] = useState(false);
      const [loading , setLoading] = useState(false);
      const [content , setContent] = useState('');

      const {getToken} = useAuth();

      const onSubmitHandler = async(e) => {
        e.preventDefault();
        try{
          setLoading(true);
          const prompt = `Generate an image of ${input} in ${selectedStyle} style.`;

          const {data} = await axios.post('/api/ai/generate-image', 
              {prompt , publish: published},
              {headers: {Authorization : `Bearer ${await getToken()}`}},
          )

          if (data.success)
          {
            setContent(data.secure_url);
            if (data.note) {
              toast.success(`Image generated! ${data.note}`);
            } else {
              toast.success('Image generated successfully!');
            }
          }
          else
          {
            toast.error(data.message);
          }
        }
        catch(error)
        {
          toast.error(error.message);
        }
        setLoading(false);
      }


  return (
    <div className='h-full overflow-y-scroll p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700'>

      {/* left col */}
      <form onSubmit={onSubmitHandler} action="" className="w-full lg:max-w-lg p-4 bg-white rounded-lg border border-gray-200">

        <div className="flex items-center gap-3">
          <Sparkle className="w-5 sm:w-6 text-[#00AD25]" />
          <h1 className='text-lg sm:text-xl font-semibold'> AI Image Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>
          Describe Your Image
        </p>

        <textarea onChange={(e)=>setInput(e.target.value)} value={input} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-green-400 focus:ring-1 focus:ring-green-400' placeholder='Describe your image here...' required/>

        <p className='mt-4 text-sm font-medium'>Styles</p>

        <div className='mt-3 flex gap-2 sm:gap-3 flex-wrap'>
          {
            ImageStyle.map((item)=> (
              <span onClick={()=>setSelectedStyle(item)} className={`text-xs px-3 sm:px-4 py-1 sm:py-2 border rounded-full cursor-pointer transition-all duration-200 ${selectedStyle === item ? 'bg-green-50 text-green-700 border-green-300' : 'text-gray-500 border-gray-300 hover:border-green-200'}`} key={item}>{item}</span>
            ))
          }
        </div>

        <div className='my-6 flex items-center gap-2'>
          <label className='relative cursor-pointer'>
            <input type="checkbox" onChange={(e)=>setPublished(e.target.checked)} checked={published} className='sr-only peer' />

            <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'>

            </div>

            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4' >

            </span>
          </label>

          <p className='text-sm'>Make this image Public</p>

        </div>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer' >
          {
             loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Image className='w-5' />
          }
          
          Generate Image
        </button>

      </form>


      {/* right col */}
      <div className='w-full lg:max-w-2xl lg:flex-1 p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
            <div className='flex items-center gap-3'>
              <Image className='w-5 h-5 text-[#00AD25]' />
              <h1 className='text-lg sm:text-xl font-semibold'>Generated Image</h1>
            </div>

            {
                !content ? (
                    <div className='flex-1 flex justify-center items-center h-[331px]'>
                      <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                        <Image className='w-9 h-9' />
                        <p>Enter a topic and click "Generate Image" to get started</p>
                      </div>
                    </div>
                ) : (
                    <div className="mt-3 h-full">
                      <img src={content} alt="Generated" className='mt-3 w-full h-auto rounded' />
                    </div>
                )
            }

            

      </div>


     
    </div>
  )
}

export default GenerateImages