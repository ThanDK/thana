// App.jsx
import React, { useState } from 'react';     // ← เพิ่ม useState
import { Route, Routes } from 'react-router-dom';
import AddFood   from './pages/AddFood/AddFood';
import ListFood  from './pages/ListFood/ListFood';
import Orders    from './pages/Orders/Orders';
import Sidebar   from './components/sidebar/Sidebar';
import Menubar   from './components/Menubar/Menubar';

const App = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);  // ← เปลี่ยนชื่อให้ตรง

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  }

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar sidebarVisible={sidebarVisible} />      {/* ← ชื่อ prop ตรงกัน */}
      <div id="page-content-wrapper">
        <Menubar toggleSidebar={toggleSidebar} />
        <div className="container-fluid">
          <Routes>
            <Route path="/add"    element={<AddFood />} />
            <Route path="/list"   element={<ListFood />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/"       element={<ListFood />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
