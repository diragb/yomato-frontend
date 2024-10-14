// Packages:
import { useState } from 'react'
import { sample } from 'lodash'
import { LoaderIcon } from 'lucide-react'

// Functions:
const Splash = () => {
  // Constants:
  const TAGLINES = [
    'feeling very hungry yaar',
    '₹100 mein kuch milega?',
    'party dedo 👀',
    'aaj tera bhai treat dega',
    'chal treat dede',
    '₹250 mein kuch bhi dedo maalik',
    'month end chal rha hai?',
    'ghar ka khaana kha le',
    'fyi each pani puri contains 30gm protein',
    'swaad aukaat anusaar',
    'tere fridge mein vegetables sar rahe hai',
    'maggi bana le',
    '₹150 mein kya milega?',
    'merepe bas ₹200 hai',
    'tu toh diet kar raha tha na?',
    'fasting has many benefits btw',
    'ghar ka khaana kha le',
    'bhindi ki sabji >>>',
    'wallet mein kitne hai?',
    'langar mein jaake khaale',
    'use bhandara.app instead',
    'kya chahiye?',
    'winter arc ka kya hua?',
    'your bmi > bank balance',
    'kela kha lo',
    'have you considered touching grass?',
    'days without healthy food: Ø 0',
  ]

  // State:
  const [tagline] = useState(sample(TAGLINES))

  // Return:
  return (
    <div className='flex justify-center items-center flex-col w-screen h-screen bg-pink-600 select-none cursor-progress'>
      <h1 className='mb-3 pt-sans-bold-italic text-7xl text-white'>yomato</h1>
      <div className='flex items-center justify-center font-medium text-xs text-white'>
        <LoaderIcon className='animate-spin h-4 w-4 mr-2' />
        {tagline}
      </div>
    </div>
  )
}

// Exports:
export default Splash
