import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BabyProvider } from './context/BabyContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CaregiversPage from './pages/CaregiversPage'
import RoutinesPage from './pages/RoutinesPage'
import MyBabyPage from './pages/MyBabyPage'

function App() {
  return (
    <BabyProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cuidadores" element={<CaregiversPage />} />
            <Route path="/rotinas" element={<RoutinesPage />} />
            <Route path="/meu-bebe" element={<MyBabyPage />} />
          </Route>
        </Routes>
      </Router>
    </BabyProvider>
  )
}

export default App
