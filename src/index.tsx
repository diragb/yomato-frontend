// Packages:
import ReactDOM from 'react-dom/client'

// Imports:
import './index.css'

// Components:
import App from './App'
import { Toaster } from './components/ui/toaster'

// Functions:
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <>
    <App />
    <Toaster />
  </>
)
