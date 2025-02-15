import React, { useState, useEffect } from 'react';
import { sortPostsByActive } from './sortUtils.js';
import '../stylesheets/Search.css';
import '../stylesheets/SortButtons.css';
import PostItem from './PostItem.js';
import axios from 'axios';

function Search({ navigate, query, user }) {
  const [globalPosts, setGlobalPosts] = useState([]);
  const [communitiesPosts, setCommunitiesPosts] = useState([]);

  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const getPosts = async () => {
      try {
        const allPosts = (await axios.get(`http://localhost:8000/search`, {
          params: { query: query }  // Pass the query as a URL parameter
        })).data;
        
        if (!user.isGuest) {
          const allCommunities = (await axios.get(`http://localhost:8000/communities`)).data;
          const joinedCommunityIDs = user.joinedCommunityIDs;
          const joinedCommunities = allCommunities.filter(community => 
            joinedCommunityIDs.includes(community._id)
          );

          // Split posts coming from those 
          const communitiesPosts = allPosts.filter(post => 
            joinedCommunities.some(community => 
              community.postIDs.includes(post._id)
            )
          );
          const globalPosts = allPosts.filter(post => 
            !joinedCommunities.some(community => 
              community.postIDs.includes(post._id)
            )
          );

          setCommunitiesPosts(communitiesPosts);
          setGlobalPosts(globalPosts);
        } else {
          setCommunitiesPosts([]);
          setGlobalPosts(allPosts)
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (query) {  // Only search if the query exists
      getPosts();
    }
  }, [query, user.isGuest, user.joinedCommunityIDs]);

  useEffect(() => {
    const sortPosts = async (posts, order) => {
      switch (order) {
        case 'newest':
          return [...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)); 
        case 'oldest':
          return [...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
        case 'active':
          return await sortPostsByActive(posts);  // Async function for active sorting
        default:
          return posts;
      }
    };

    if (communitiesPosts.length > 0 || globalPosts.length > 0)  {
      const sortPostsAndUpdate = async () => {
        // Only update if posts have changed
        const sortedCommunities = await sortPosts(communitiesPosts, sortOrder);
        const sortedGlobal = await sortPosts(globalPosts, sortOrder);
    
        // Check if the sorted posts are different before updating state
        if (JSON.stringify(sortedCommunities) !== JSON.stringify(communitiesPosts)) {
          setCommunitiesPosts(sortedCommunities);
        }
        if (JSON.stringify(sortedGlobal) !== JSON.stringify(globalPosts)) {
          setGlobalPosts(sortedGlobal);
        }
      };
      sortPostsAndUpdate();
    }
  }, [communitiesPosts, globalPosts, sortOrder]);

  const handleSortButtonClick = (order) => {
    setSortOrder(order)
  };

  return (
    <div className="search-page">
      <div className="header-container">
      {communitiesPosts.length + globalPosts.length > 0 ? (
          <>
            <h1 className="header-title">Results for: {query}</h1>
            <div className="sort-buttons">
              <button onClick={() => handleSortButtonClick('newest')} className="sort-button">Newest</button>
              <button onClick={() => handleSortButtonClick('oldest')} className="sort-button">Oldest</button>
              <button onClick={() => handleSortButtonClick('active')} className="sort-button">Active</button>
            </div>
          </>
        ) : (
          <h1 className="header-title">No results found for: {query}</h1>
        )}
      </div>
      <h2 className="post-count">{communitiesPosts || globalPosts ? communitiesPosts.length + globalPosts.length : 0} posts</h2>
      <div className="delimiter"></div>
      <div className="posts-list">
        { communitiesPosts.map((post) => (
          <PostItem key={post._id} navigate={navigate} post={post} view={'search'} user={user}/>
        ))}

        <hr/>

        { globalPosts.map((post) => (
          <PostItem key={post._id} navigate={navigate} post={post} view={'search'} user={user}/>
        ))}

      </div>
    </div>
  );

}

export default Search;