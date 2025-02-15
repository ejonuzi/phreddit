import React, { useState, useEffect } from 'react';
import '../stylesheets/Community.css';
import '../stylesheets/SortButtons.css';
import PostItem from './PostItem.js';
import { getTimestamp } from './timeUtils.js';
import { sortPostsByActive } from './sortUtils.js';
import axios from 'axios';

function Community({ navigate, community, user }) {
  const [posts, setPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [sortedPosts, setSortedPosts] = useState([]);
  const [creatorName, setCreatorName] = useState("");
  useEffect(() => {
    const getPosts = async () => {
      try {
        const getPromises = community.postIDs.map(async (postID) => {
          const response = await axios.get(`http://localhost:8000/posts/${postID}`);
          return response.data;
        });
        const postsData = await Promise.all(getPromises); // Wait for all get reqs to complete
        setPosts(postsData);
      } catch (error) {
        console.log(error.message);
      }
    };
    getPosts();
  }, [community]);

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

    const sort = async () => {
      const sorted = await sortPosts(posts, sortOrder);
      setSortedPosts(sorted);
    };

    sort();
  }, [posts, sortOrder]);

  useEffect(() => {
    getCreatorName();
  }, [community.members, community._id]);

  const getCreatorName = async () => {
    try {
      console.log("creatorID, ", community.members[0])
      const displayName = (await axios.get(`http://localhost:8000/users/${community.members[0]}`)).data.displayName;
      setCreatorName(displayName)
    } catch (error) {
      console.error('Error fetching creator name:', error);
    }
  };

  const handleJoinLeave = async () => {
    const action = community.members.includes(user._id) ? 'leave' : 'join'
    const requestData = {
      userId: user._id,
      communityId: community._id,
      action: action
    };
    const response = await axios.patch('http://localhost:8000/community/join-leave', requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 200) {
      if (action === 'leave') {
        community.members = community.members.filter(id => id !== user._id);
        user.joinedCommunityIDs = user.joinedCommunityIDs.filter(id => id !== community._id);

        console.log('User left the community');
      } else {
        community.members.push(user._id);
        user.joinedCommunityIDs.push(community._id);

        console.log('User joined the community');
      }
    } else {
      console.error('Failed to update community:', response.data.message || 'Unknown error');
    }
    navigate('home');
  };

  return (
    <div className="community-page">
      <div className="header-container">
        <h1 className="header-title">{community.name}</h1>
        <div className="sort-buttons">
          <button onClick={() => setSortOrder('newest')} className="sort-button">Newest</button>
          <button onClick={() => setSortOrder('oldest')} className="sort-button">Oldest</button>
          <button onClick={() => setSortOrder('active')} className="sort-button">Active</button>
        </div>
      </div>
      <p className="community-description">{community.description}</p>
      <p className="community-created">Created {getTimestamp(new Date(community.startDate))} by {creatorName || "Loading..."}</p>
      <div className="community-stats">
        <p className="stat posts-count">Posts: {posts.length}</p>
        <p className="stat members-count">Members: {community.members.length}</p>
        {!user.isGuest && (
          community.members.includes(user._id) ? (
            <button onClick={handleJoinLeave} className="join-button">
              Leave Community
            </button>
          ) : (
            <button onClick={handleJoinLeave} className="join-button">
              Join Community
            </button>
          )
        )}
        
      </div>
      <div className="posts-delimiter"></div>
      <div className="posts-list">
        {sortedPosts.map((post) => (
          <PostItem key={post._id} navigate={navigate} post={post} view={'community'} />
        ))}
      </div>
    </div>
  );
}

export default Community;
