import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import BudgetTracker from './BudgetTracker';
import Confessions from './Confessions';
import Post from './Post';
import Forum from './Forum';
import Layout from './Layout';
import './App.css';
import image from './assets/logo.png';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <div className="home-page" style={{ textAlign: "center" }}>
                {/* Logo */}
                <img
                  src={image} // path to your logo file in public folder
                  alt="Finwise Logo"
                  height={250}
                />
              <h1>Welcome to Finwise</h1>
              <div className="feature-buttons">
                <Link to="/budget">
                  <button>Budget Tracker</button>
                </Link>
                <Link to="/confessions">
                  <button>Confessions</button>
                </Link>
              </div>
              <br/>
              <div>Please use light mode. Updates coming soon!</div>
            </div>
          } />
          <Route path="/budget" element={<BudgetTracker />} />
          <Route path="/confessions" element={<Confessions />} />
          <Route path="/post" element={<Post />} />
          <Route path="/forum" element={<Forum />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
