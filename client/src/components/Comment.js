import React, { useState, useEffect } from 'react';
import '../stylesheets/Comment.css';
import { getTimestamp } from './timeUtils.js';
import axios from 'axios';

function Comment({ navigate, comment, user }) {
    const [replies, setReplies] = useState([]);
    const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount); // Initialize with post's current upvote count
    const [userVote, setUserVote] = useState(0); // 0 = no vote, 1 = upvoted, -1 = downvoted

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/comments/${comment._id}/replies`);
                setReplies(response.data);
            } catch (error) {
                console.error('Error fetching replies:', error.message);
            }
        };

        fetchReplies();
    }, [comment._id]);

    const handleUpvote = async () => {
        try {
            await axios.post(`http://localhost:8000/votes`, {
                userID: user._id,
                postID: null,
                commentID: comment._id,
                voteType: 'upvote'
            });
            setUpvoteCount(comment.upvoteCount + 1);
            setUserVote(1); // Mark as upvoted
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDownvote = async () => {
        try {
            await axios.post(`http://localhost:8000/votes`, {
                userID: user._id,
                postID: null,
                commentID: comment._id,
                voteType: 'downvote'
            });
            setUpvoteCount(comment.upvoteCount - 1);
            setUserVote(-1); // Mark as upvoted
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleRemoveUpvote = async () => {
        try {
            await axios.delete(`http://localhost:8000/votes`, {
                data: {
                    userID: user._id,
                    postID: null,
                    commentID: comment._id,
                    voteType: 'downvote',
                }
            });
            setUpvoteCount(comment.upvoteCount);
            setUserVote(0); // Reset vote
        } catch (error) {
            console.log("Failed to delete vote:", error.message);
        }
    };

    const handleRemoveDownvote = async () => {
        try {
            await axios.delete(`http://localhost:8000/votes`, {
                data: {
                    userID: user._id,
                    postID: null,
                    commentID: comment._id,
                    voteType: 'downvote',
                }
            });
            setUpvoteCount(comment.upvoteCount);
            setUserVote(0); // Reset vote
        } catch (error) {
            console.log("Failed to delete vote:", error.message);
        }
    };

    return (
        <div className="comment-item">
            <div className="comment-meta">
                {comment.userID.displayName} | {getTimestamp(new Date(comment.commentedDate))} | {upvoteCount} Upvotes
            </div>
            <div className="comment-content">{comment.content}</div>
            {!user.isGuest && (
                <div className="PP_vote-buttons">
                    {userVote === 1 ? (
                        <button onClick={handleRemoveUpvote} className="vote-button-selected">▲ Upvoted</button>
                    ) : (
                        <button onClick={handleUpvote} className="vote-button">▲ Upvote</button>
                    )}
                    {userVote === -1 ? (
                        <button onClick={handleRemoveDownvote} className="vote-button-selected">▼ Downvoted</button>
                    ) : (
                        <button onClick={handleDownvote} className="vote-button">▼ Downvote</button>
                    )}
                </div>
            )}
            {!user.isGuest && (
                <div
                    className="reply-button"
                    onClick={() => navigate('create-comment', { ID: comment._id, Type: 'comment' })}
                >
                    Reply
                </div>
            )}
            
            <div className="replies">
                {replies.map((reply) => (
                    <Comment key={reply._id} navigate={navigate} comment={reply} user = {user} />
                ))}
            </div>
        </div>
    );
}

export default Comment;