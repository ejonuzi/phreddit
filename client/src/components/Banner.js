import React from 'react';
import '../stylesheets/Banner.css';

// 1. The Banner 
function Banner({ navigate, userChange, currentPage, user }) {
  const handleHomeClick = () => {
    navigate('welcome');
  };

  const handleCreatePostClick = () => {
    navigate('create-post'); // navigate to the new post page
  };

  const handleProfileClick = () => {
    navigate('profile');
  };

  const handleLogOutClick = () => {
    user.token = null
    userChange(null)
    navigate('welcome');
  };

  return (
    <div className="banner">
      {/* Logo and App Name */}
      <a onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        <img src={require('../PhredditLogo.png')} alt="Phreddit Logo" className="app-logo" />
        <span className="app-name">phreddit</span>
      </a>

      {/* Centered Elements */}
      <div className="center">
        {/* Search Box */}
        <input
          type="text"
          id="search-bar"
          className="search-box"
          placeholder="🔍 | Search phreddit..."
          onFocus={(e) => (e.target.placeholder = '')}
          onBlur={(e) => (e.target.placeholder = '🔍 | Search phreddit...')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const query = e.target.value.trim();
              if (query) {
                navigate('search', query); // Call navigate with 'search' page and query
              }
            }
          }}
        />

        {/* Create Post Button */}
        {user.isGuest ? (
          <button className={'create-post-button-disabled'}>
            📝 Create Post
          </button>
        ) : (
          <button className={currentPage.page === 'create-post' ?  'create-post-button-CP' : 'create-post-button'} onClick={handleCreatePostClick}>
            📝 Create Post
          </button>
        )}

      </div>

      {user.isGuest ? (
          <button className='profile-button-disabled'>
            🙇 Guest
          </button>
        ) : (
          <div>
            <button className='profile-button' onClick={handleProfileClick}>
            🧑‍💻 {user.displayName}
          </button>
          <button className='logout-button' onClick={handleLogOutClick}>
            🏃 Log out
          </button>
          </div>
      
      )}
      
    </div>
  );
}

export default Banner;
