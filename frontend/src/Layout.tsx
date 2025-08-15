import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaArrowLeft, FaHome } from 'react-icons/fa'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  return (
    <div>
        {/* Only show buttons if not on home page */}
        {!isHomePage && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} className="nav-button">
                    <FaArrowLeft /> Back
                </button>
                <Link to="/">
                    <button className="nav-button">
                        <FaHome /> Home
                    </button>
                </Link>
            </div>
        )}

        {/* Page content */}
        {children}
    </div>
  );
};

export default Layout;
