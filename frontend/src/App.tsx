import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import BudgetTracker from './BudgetTracker'
import Chatbot from './Chatbot';
import Post from './Post';
import Forum from './Forum';
import Layout from './Layout';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <div className="home-page">
              <h1>Welcome to Finwise</h1>
              <div className="feature-buttons">
                <Link to="/budget">
                  <button>Budget Tracker</button>
                </Link>
                <Link to="/chatbot">
                  <button>Chatbot</button>
                </Link>
              </div>
            </div>
          } />
          <Route path="/budget" element={<BudgetTracker />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/post" element={<Post />} />
          <Route path="/forum" element={<Forum />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
