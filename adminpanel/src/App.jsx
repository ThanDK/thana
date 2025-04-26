import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddFood from './pages/AddFood/AddFood'
import ListFood from './pages/ListFood/ListFood'
import Orders from './pages/Orders/Orders'
import Sidebar from './components/sidebar/Sidebar'
import Menubar from './components/Menubar/Menubar'

const App = () => {
  return (
    <div className="d-flex" id="wrapper">
            
            <Sidebar />
            

            <div id="page-content-wrapper">
                
                <Menubar />
               
                <div className="container-fluid">
                    <Routes>
                        <Route path='/add' element={<AddFood />} />
                        <Route path='/list' element={<ListFood />} />
                        <Route path='/Orders' element={<Orders />} />
                        <Route path='/' element={<ListFood />} />
                    </Routes>
                </div>
            </div>
        </div>
  )
}

export default App