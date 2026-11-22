import { useCallback, useEffect, useRef, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import { Protect, useAuth, useUser } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const Dashboard = () => {
  const [creation, setCreation] = useState([])
  const [loading, setLoading] = useState(true)
  const [rateLimited, setRateLimited] = useState(false)

  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const hasFetched = useRef(false)

  const getDashboardData = useCallback(async () => {
    if (hasFetched.current || !isLoaded || !user || rateLimited) {
      setLoading(false)
      return
    }

    hasFetched.current = true

    try {
      const token = await getToken()
      if (!token) {
        setCreation([])
        return
      }

      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCreation(data.success ? data.creations : [])
    } catch (error) {
      if (error.response?.status === 429) {
        setRateLimited(true)
        toast.error('Rate limited. Please try again later.')
      }
      setCreation([])
    } finally {
      setLoading(false)
    }
  }, [getToken, isLoaded, rateLimited, user])

  useEffect(() => {
    if (isLoaded && user) {
      getDashboardData()
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [getDashboardData, isLoaded, user])

  return (
    <div className='h-full overflow-y-scroll p-3 sm:p-4 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6'>
        <div className='flex justify-between items-center w-full p-4 px-4 sm:px-6 bg-white rounded-xl border border-gray-200 min-w-0'>
          <div className='text-slate-600 min-w-0 flex-1'>
            <p className='text-xs sm:text-sm'>Total Creations</p>
            <h2 className='text-lg sm:text-xl font-semibold'>{creation.length}</h2>
          </div>
          <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center flex-shrink-0'>
            <Sparkles className='w-4 sm:w-5 text-white'/>
          </div>
        </div>

        <div className='flex justify-between items-center w-full p-4 px-4 sm:px-6 bg-white rounded-xl border border-gray-200 min-w-0'>
          <div className='text-slate-600 min-w-0 flex-1'>
            <p className='text-xs sm:text-sm'>Active Plan</p>
            <h2 className='text-lg sm:text-xl font-semibold'>
              <Protect plan='premium' fallback='Free'>Premium</Protect>
            </h2>
          </div>
          <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center flex-shrink-0'>
            <Gem className='w-4 sm:w-5 text-white'/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-3/4'>
          <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='mt-6 mb-4'>Recent Creation</p>
          {creation.map((item) => <CreationItem key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

export default Dashboard
