import React, { useState, useEffect } from 'react';
import '../stylesheets/CreateComment.css';
import axios from 'axios';

function CreateComment({ navigate, parentData, user }) {
  console.log(parentData);
  const editMode = parentData.editMode;

  const [commentContent, setCommentContent] = useState(editMode ? parentData.comment.content : '');
  const [commentFailureMessage, setCommentFailureMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Validate inputs
    if (commentContent.length > 500) {
      setCommentFailureMessage("Error!: Content should not have more than 500 characters.");
      return;
    }

    let createdComment = null;
    if (!editMode) {
      // Create a new comment
      try {
        const newCommentData = {
          content: commentContent,
          userID: user._id,
          parentData: parentData // Used just to properly append to
        };
        console.log('Attemping to create Comment: ', newCommentData);
        const response = await axios.post('http://localhost:8000/comments', newCommentData);
        createdComment = response.data;
        console.log('Created Comment: ', response.data.content);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      try {
        const updatedCommentData = {
          content: commentContent,
        };
        const response = await axios.put(
          `http://localhost:8000/comments/${parentData.comment._id}`,
          updatedCommentData
        );
        console.log('Successfully updated comment:', response.data.content);
      } catch (error) {
        console.log(error.message);
      }
      navigate('profile');
    }
    

    const findPostWithComment = async () => {
      const response = await axios.get('http://localhost:8000/posts');
      const posts = response.data;
      for (const post of posts) {
        try {
          console.log("trying: ", post._id);
          const response = await axios.get(`http://localhost:8000/posts/${post._id}/most-recent-comment`);
          if (response.data._id === createdComment._id) {
            return post;
          }
        } catch (error) {
          console.log(`Error fetching comment for post ${post._id}:`, error.message);
        }
      }
      return null;
    };

    const post = await findPostWithComment ();

    if (post) {
      navigate('post', post); // Navigate to the post page
    } else {
      navigate('home');
    }

    // Reset form fields
    setCommentContent('');
    setCommentFailureMessage('');
  };

  return (
    <div id="new-comment-page" className="new-comment-page">
      <h1 className="new-comment-title">Add a New Comment</h1>
      <form id="new-comment-form" className="new-comment-form" onSubmit={handleSubmit}>

        <label className="label required" htmlFor="comment-content-input">Comment Content (required):</label>
        <textarea
          id="comment-content-input"
          className="input-textarea"
          name="comment-content"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          required
        />

        <button type="submit" className="submit-button">Submit Comment</button>
      </form>

      {editMode && (
        <button onClick={handleDelete}>Delete Comment</button>
      )}

      {/* Message displayed after failed creation */}
      {commentFailureMessage && (
        <p className="comment-failure-message">
          {commentFailureMessage}
        </p>
      )}
    </div>
  );

  async function handleDelete() {
    const userConfirmed = window.confirm("Are you sure you want to delete this comment?");
    if (userConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:8000/comments/${parentData.comment._id}`);
        console.log('Success:', response.data);
      } catch (error) {
        console.error(error.message)
      }
    }
    navigate('profile');
  }
}

export default CreateComment;