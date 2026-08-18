import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { EntityProvider } from './contexts/EntityContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EntityProvider>
          <App />
        </EntityProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
