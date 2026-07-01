import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Outlet } from 'react-router';

function Layout(): React.JSX.Element {
  return (
    <>
      <Navbar />
      {/* Outlet is where your nested pages (Home, FlightResults, etc.) will render */}
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;