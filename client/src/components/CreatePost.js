import React,  { useState, useEffect } from 'react';
import '../stylesheets/CreatePost.css';
import axios from 'axios';

function CreatePost({ navigate, data, user }) {
  const editMode = data !== null;

  const [communityID, setCommunityID] = useState('');
  const [postTitle, setPostTitle] = useState(editMode ? data.title : '');
  const [selectedFlairID, setSelectedFlairID] = useState(editMode ? data.linkFlairID : '');
  const [newFlair, setNewFlair] = useState('');
  const [postContent, setPostContent] = useState(editMode ? data.content : '');
  const [postFailureMessage, setPostFailureMessage] = useState('');

  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [globalCommunities, setGlobalCommunities] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  useEffect(() => {
    const getCommunities = async () => {
      try {
        const allCommunities = (await axios.get(`http://localhost:8000/communities`)).data;
        const joinedCommunityIDs = user.joinedCommunityIDs;
        const joinedCommunities = allCommunities.filter(community => 
          joinedCommunityIDs.includes(community._id)
        );
        const globalCommunities = allCommunities.filter(community => 
          !joinedCommunityIDs.includes(community._id)
        );

        setJoinedCommunities(joinedCommunities);
        setGlobalCommunities(globalCommunities);
      } catch (error) {
        console.log(error.message);
      }
    };
    const getLinkFlairs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/linkFlairs');
        setLinkFlairs(response.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    getCommunities();
    getLinkFlairs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Validate inputs
    if (communityID === '') {
      setPostFailureMessage("Error!: Community is required.");
      return;
    }
    if (postTitle.length > 100) {
      setPostFailureMessage("Error!: Post title should not be more than 100 characters.");
      return;
    }
    if (selectedFlairID !== '' && newFlair.length > 0) {
      setPostFailureMessage("Error!: At most one link flair can be applied to a post.");
      return;
    }
    if (newFlair.length > 30) {
      setPostFailureMessage("Error!: New link flairs should not be more than 30 characters.");
      return;
    }

    let flairIDFINAL = selectedFlairID;
    
    // Create new link flair if we need to
    if (newFlair.length > 0) {
      const newFlairData = { content: newFlair };
      try {
        const response = await axios.post('http://localhost:8000/linkFlairs', newFlairData);
        console.log(response.data);
        flairIDFINAL = response.data._id;
      } catch (error) {
        console.log(error.message);
      }
    }

    // Create new post
    if (!editMode) {
      try {
        const newPostData = {
          title: postTitle,
          content: postContent,
          linkFlairID: flairIDFINAL,
          userID: user._id,
          communityID: communityID // community ID is simply used by the server to update the correct community, it is not stored in the actual saved post on the server
        };
        const response = await axios.post('http://localhost:8000/posts', newPostData);
        navigate('home');
      } catch (error) {
        console.log(error.message);
      }
    } else {
      try {
        const updatedPostData = {
          title: postTitle,
          content: postContent,
          linkFlairID: flairIDFINAL,
        };
        const response = await axios.put(`http://localhost:8000/posts/${data._id}`, updatedPostData);
        console.log("Successfully updated post", response.data);
        navigate('profile');
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <div id="new-post-page" className="new-post-page">
      <h1 className="new-post-title">Create a New Post</h1>
      <form id="new-post-form" className="new-post-form" onSubmit={handleSubmit}>
        
        <label className="label required" htmlFor="community-select">Community (required):</label>
        <select
          id="community-select"
          className="input-select"
          value={communityID}
          onChange={(e) => setCommunityID(e.target.value)}
          required
        >
          <option value="">Select a community</option>
          {joinedCommunities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
          {globalCommunities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>
  
        <label className="label required" htmlFor="post-title-input">Post Title (required):</label>
        <input
          type="text"
          id="post-title-input"
          className="input-text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          required
        />
  
        <label className="label" htmlFor="flair-select">Link Flair (optional):</label>
        <select
          id="flair-select"
          className="input-select"
          value={selectedFlairID}
          onChange={(e) => setSelectedFlairID(e.target.value)}
        >
          <option value="">Select a flair</option>
          {linkFlairs.map((flair) => (
            <option key={flair._id} value={flair._id}>
              {flair.content}
            </option>
          ))}
        </select>
  
        <label className="label" htmlFor="new-flair-input">New Link Flair (optional):</label>
        <input
          type="text"
          id="new-flair-input"
          className="input-text"
          value={newFlair}
          onChange={(e) => setNewFlair(e.target.value)}
        />
  
        <label className="label required" htmlFor="post-content-input">Post Content (required):</label>
        <textarea
          id="post-content-input"
          className="input-textarea"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          required
        />
  
        <button type="submit" className="submit-button">Submit Post</button>
      </form>

      {editMode && (
        <button onClick={handleDelete}>Delete Post</button>
      )}
  
      {/* Message displayed after failed creation */}
      {postFailureMessage && (
        <p className="post-failure-message">
          {postFailureMessage}
        </p>
      )}
    </div>
  );

  async function handleDelete() {
    const userConfirmed = window.confirm("Are you sure you want to delete this post?");
    if (userConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:8000/posts/${data._id}`);
        console.log('Success:', response.data);
      } catch (error) {
        console.error(error.message)
      }
    }
    navigate('profile');
  }
  
}

export default CreatePost;
