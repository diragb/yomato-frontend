// Packages:
import { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'
import { cn } from './lib/utils'
import sleep from 'sleep-promise'

// Components:
import Search from './pages/search'
import Roll from './pages/roll'
import NoMatch from './pages/no-match'
import Splash from './components/secondary/Splash'

// Functions:
const App = () => {
  // State:
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const [removeSplashScreen, setRemoveSplashScreen] = useState(false)

  // Effects:
  useEffect(() => {
    (async () => {
      await sleep(3000)
      setShowSplashScreen(false)
    })()
  }, [])
  
  useEffect(() => {
    if (!showSplashScreen) {
      (async () => {
        await sleep(250)
        setRemoveSplashScreen(true)
      })()
    }
  }, [showSplashScreen])

  // Return:
  return (
    <>
      {
        !removeSplashScreen && (
          <div
            className={cn(
              'absolute top-0 left-0 z-50 transition-all',
              showSplashScreen ? 'opacity-1' : 'opacity-0',
            )}
          >
            <Splash />
          </div>
        )
      }
      <Router>
        <Routes>
          <Route index path='/' element={<Search />} />
          <Route path='/search' element={<Search />} />
          <Route index path='/roll' element={<Roll />} />
          <Route path='*' element={<NoMatch />} />
        </Routes>
      </Router>
    </>
  )
}

// Exports:
export default App
