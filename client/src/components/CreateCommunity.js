import React, { useState } from 'react';
import '../stylesheets/CreateCommunity.css';
import axios from 'axios';

function CreateCommunity({ navigate, data, user }) {
  const editMode = data !== null;

  const [communityName, setCommunityName] = useState(editMode ? data.name : '');
  const [communityDescription, setCommunityDescription] = useState(editMode ? data.description : '');

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedCommunityName = communityName.trim();
    const trimmedCommunityDescription = communityDescription.trim();

    // Handle bad input
    if (trimmedCommunityName.length === 0 || trimmedCommunityName.length > 100) {
      setErrorMessage("Error!: Community Name should not be more than 100 characters and should not be empty.");
      return;
    }
    if (trimmedCommunityDescription.length === 0 || trimmedCommunityDescription.length > 500) {
      setErrorMessage("Error!: Community Description should not be more than 500 characters and should not be empty.");
      return;
    }

    if (!editMode) {
      const newCommunity = {
        name: trimmedCommunityName,
        description: trimmedCommunityDescription,
        members: [user._id]
      };
      try {
        const response = await axios.post('http://localhost:8000/communities', newCommunity);
        console.log("Successffully created new community ", response.data.name);
        navigate('community', response.data); // navigate to new community page
      } catch (error) {
        console.log(error.message);
        setErrorMessage(error.message);
      }
    } else {
      const updatedCommunity = {
        name: trimmedCommunityName,
        description: trimmedCommunityDescription,
      };
      try {
        const response = await axios.put(`http://localhost:8000/communities/${data._id}`, updatedCommunity);
        console.log("Successfully updated community", response.data.name);
        navigate('profile');
      } catch (error) {
        console.log(error.message);
        setErrorMessage(error.message);
      }
    }

    // Reset form after submission
    setCommunityName('');
    setCommunityDescription('');
    setErrorMessage('');
  };

  return (
    <div id="new-community-page" className="page-view">
      <h1>Create a New Community</h1>
      <form id="new-community-form" onSubmit={handleSubmit}>
        <label htmlFor="community-name-input">Community Name (required):</label>
        <input
          type="text"
          id="community-name-input"
          name="community-name"
          required
          value={communityName}
          onChange={(e) => setCommunityName(e.target.value)}
        />

        <label htmlFor="community-description-input">Community Description (required):</label>
        <textarea
          id="community-description-input"
          name="community-description"
          required
          value={communityDescription}
          onChange={(e) => setCommunityDescription(e.target.value)}
        />

        <button type="submit">Engender Community</button>
      </form>

      {editMode && (
        <button onClick={handleDelete}>Delete Community</button>
      )}

      {errorMessage && (
        <p id="community-failure-message" className="community-creation-failure">
          {errorMessage}
        </p>
      )}
    </div>
  );

  async function handleDelete() {
    const userConfirmed = window.confirm("Are you sure you want to delete this community?");
    if (userConfirmed) {
      // Call the function to delete the community
      try {
        const response = await axios.delete(`http://localhost:8000/communities/${data._id}`);
        console.log('Success:', response.data);
      } catch (error) {
        console.error(error.message)
      }
    }
    navigate('profile');
  }
}

export default CreateCommunity;
