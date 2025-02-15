import React, { useState, useEffect } from 'react';
import '../stylesheets/PostItem.css';
import { getTimestamp } from './timeUtils.js';
import axios from 'axios';

function PostItem ({ navigate, post, view }) {
  const [community, setCommunity] = useState(null);
  const [linkFlair, setLinkFlair] = useState(null);
  const [numComments, setNumComments] = useState(null);
  useEffect(() => {
    const getCommunity = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/community-by-post/${post._id}`);
        setCommunity(response.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    
    const getLinkFlair = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/linkFlairs/${post.linkFlairID}`);
        setLinkFlair(response.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    const getNumComments = async () => {
      try { 
        const response = await axios.get(`http://localhost:8000/posts/${post._id}/num-comments`);
        setNumComments(response.data.numComments);
      } catch (error) {
        console.log(error.message);
      }
    };

    getCommunity();
    getLinkFlair();
    getNumComments();
  }, [post._id, post.linkFlairID]);

  const handleClick = async () => {
    try {
      await axios.patch(`http://localhost:8000/posts/${post._id}/increment-views`);
      post.views = post.views + 1; // update views locally
    } catch (error) {
      console.error('Error updating views:', error);
    }
    navigate('post', post); // Navigate to the post page
  };

  // view can be  'home' 'search' community'
  return (
    <div className="post-item-container">
      <div className="post-item" onClick={handleClick}>
      <div className="post-meta">
        {view !== 'community' && (
          <>
            <span className="post-community">
              {/* { community.name } */}
              {community ? (
                <div>{community.name}</div>  // Render community info if it exists
              ) : (
                <div>Loading community...</div>
              )}
            </span>
            <span className="separator">|</span>
          </>
        )}
        <span className="post-author">{post.userID.displayName}</span>
        <span className="separator">|</span>
        <span className="post-timestamp">{getTimestamp(new Date(post.postedDate))}</span>
      </div>
      <div className="post-title">{post.title}</div>
      {post.linkFlairID && (
        <div className="post-flair">
          {linkFlair ? (
            <div>{linkFlair.content}</div>  // Render linkFlair info if it exists
          ) : (
            <div>Loading linkFlair...</div>
          )}
        </div>
      )}
      <div className="post-content-preview">
        {post.content.substring(0, 80)}...
      </div>
      <div className="post-info">
        <span className="post-views">Views: {post.views}</span>
        <span className="separator">|</span>
        <span className="post-comments">Comments: 
        { numComments || numComments === 0 ? (
            <span>{numComments}</span>  // Render linkFlair info if it exists
          ) : (
            <span>Loading numComments...</span>
          )}
        </span>
        <span className="separator">|</span>
        <span className="post-views">Upvotes: {post.upvoteCount}</span>
      </div>
      </div>
      <div className="dotted-delimiter"></div>
    </div>
  );
}

export default PostItem;