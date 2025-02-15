// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';

import React, { useState } from 'react';

import Banner from './components/Banner.js';
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import CreatePost from './components/CreatePost.js';
import CreateCommunity from './components/CreateCommunity.js'; 
import CreateComment from './components/CreateComment.js'; 
import Community from './components/Community.js';
import Post from './components/Post.js'; 
import Search from './components/Search.js'; 
import Welcome from './components/Welcome.js'; 
import Profile from './components/Profile.js'; 

import './stylesheets/main-layout.css'; 

function App() {
  const [currentPage, setCurrentPage] = useState({page: 'welcome', data: null});
  const [currentUser, setCurrentUser] = useState(null)

  const handleNavigate = (page, data = null) => {
    setCurrentPage({ page, data });
  };

  const handleUserChange = (user) => {
    setCurrentUser(user);
  }
 
  const getContentComponent = () => {
    const { page , data } = currentPage;
    switch (page) {
      case 'home': return <Home navigate={handleNavigate} user={currentUser}/>;
      case 'create-post': return <CreatePost navigate={handleNavigate} data={data} user={currentUser}/>;
      case 'create-community': return <CreateCommunity navigate={handleNavigate} data={data} user={currentUser}/>;
      case 'create-comment': return <CreateComment navigate={handleNavigate} parentData={data} user={currentUser}/>;
      case 'community': return <Community navigate={handleNavigate} community={data} user={currentUser}/>;
      case 'search': return <Search navigate={handleNavigate} query={data} user={currentUser}/>;
      case 'post': return <Post navigate={handleNavigate} post={data} user={currentUser}/>;
      case 'profile': return <Profile navigate={handleNavigate} userChange={handleUserChange} user={currentUser}/>;
      default: return null;
    }
  };

  return (
    <div className="App">
      {currentPage.page === 'welcome' ? (
        <Welcome navigate={handleNavigate} userChange = {handleUserChange}/>
      ) : (
        // Don't render navbar or banner when on welcome page
        <div>
          <Banner navigate={handleNavigate} userChange = {handleUserChange} currentPage={currentPage} user={currentUser}/>
          <div className="main-layout">
            <Navbar navigate={handleNavigate} currentPage={currentPage} user={currentUser}/>
            {getContentComponent(currentPage)}
          </div>
        </div>
      )}
    </div>
  );
  
}

export default App;
