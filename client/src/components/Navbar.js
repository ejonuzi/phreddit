import React, { useState, useEffect } from 'react';
import '../stylesheets/Navbar.css';
import axios from 'axios';

function NavBar({ navigate, currentPage, user }) {
  const [globalCommunities, setGlobalCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  const handleHomeClick = () => {
    navigate('home'); // navigate to the home page
  };

  const handleCreateCommunityClick = () => {
    navigate('create-community'); // navigate to the new post page
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const allCommunities = (await axios.get(`http://localhost:8000/communities`)).data;
      
        if (!user.isGuest) {
          const joinedCommunityIDs = user.joinedCommunityIDs;

          // Split communities into joined and global
          const joinedCommunities = allCommunities.filter(community => 
            joinedCommunityIDs.includes(community._id)
          );
          const globalCommunities = allCommunities.filter(community => 
            !joinedCommunityIDs.includes(community._id)
          );

          setJoinedCommunities(joinedCommunities);
          setGlobalCommunities(globalCommunities);
        } else {
          setJoinedCommunities([]);
          setGlobalCommunities(allCommunities)
        }

      } catch (error) {
        console.log(error.message);
      }
    };
    fetchCommunities();
  }, [currentPage, user.joinedCommunityIDs]);
  
  return (
    <div className="nav-bar">
      {/* Home Button */}
      <a 
        className={currentPage.page === 'home' ?  'home-button-HOME' : 'home-button-ELSE'} 
        onClick={handleHomeClick}
      >
        🏠 Home
      </a>

      {/* Delimiter */}
      <div className="delimiter"></div>

      {/* Communities Section */}
      <h3 className="communities-header">Communities</h3>

      {/* Create Community Button */}
      {user.isGuest ? (
        <button
          className='create-community-button-disabled'
        >
          🌍 Create Community
        </button>
      ) : (
        <button
          className={currentPage.page === 'create-community' ?  'create-community-button-CC' : 'create-community-button-ELSE'} 
          onClick={handleCreateCommunityClick}
        >
          🌍 Create Community
        </button>
      )}

      {/* List of Communities */}
      <ul className="community-list">
        {/* Joined Communities */}
        {joinedCommunities.map((community) => (
          <li
            key={community._id}
            className={
              currentPage.page === 'community' && currentPage.data._id === community._id
                ? 'community-list-item-SELECTED'
                : 'community-list-item-UNSELECTED'
            }
            onClick={() => {
              navigate('community', community);
            }}
          >
            {community.name}
          </li>
        ))}

        {/* Delimiter */}
        <hr/>

        {/* Global Communities */}
        {globalCommunities.map((community) => (
          <li
            key={community._id}
            className={
              currentPage.page === 'community' && currentPage.data._id === community._id
                ? 'community-list-item-SELECTED'
                : 'community-list-item-UNSELECTED'
            }
            onClick={() => {
              navigate('community', community);
            }}
          >
            {community.name}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default NavBar;
