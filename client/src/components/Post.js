import React, { useState, useEffect } from 'react';
import '../stylesheets/Post.css';
import Comment from './Comment';
import { getTimestamp } from './timeUtils.js';
import axios from 'axios';

function Post({ navigate, post, user }) {
    const [numComments, setNumComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [upvoteCount, setUpvoteCount] = useState(post.upvoteCount); // Initialize with post's current upvote count
    const [userVote, setUserVote] = useState(0); // 0 = no vote, 1 = upvoted, -1 = downvoted
    
    useEffect(() => {
        const getComments = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/posts/${post._id}/comments`);
                setComments(response.data);
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

        getComments();
        getNumComments();
    }, []);

    if (post === null) return;

    const handleUpvote = async () => {
        try {
            await axios.post(`http://localhost:8000/votes`, {
                userID: user._id,
                postID: post._id,
                commentID: null,
                voteType: 'upvote'
            });
            setUpvoteCount(post.upvoteCount + 1);
            setUserVote(1); // Mark as upvoted
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDownvote = async () => {
        try {
            await axios.post(`http://localhost:8000/votes`, {
                userID: user._id,
                postID: post._id,
                commentID: null,
                voteType: 'downvote'
            });
            setUpvoteCount(post.upvoteCount - 1);
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
                    postID: post._id,
                    commentID: null,
                    voteType: 'downvote',
                }
            });
            setUpvoteCount(post.upvoteCount);
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
                    postID: post._id,
                    commentID: null,
                    voteType: 'downvote',
                }
            });
            setUpvoteCount(post.upvoteCount);
            setUserVote(0); // Reset vote
        } catch (error) {
            console.log("Failed to delete vote:", error.message);
        }
    };

    const generateComments = () => {
        return comments.map((comment) => (
            <Comment key={comment._id} navigate={navigate} comment={comment} user={user} />
        ));
    };

    return (
        <div id="post-page" className="PP_page-view">
            <div className="PP_post-header">
                <h3 className="PP_post-community-name">{post.communityName}</h3>
                <span className="PP_separator">|</span>
                <p className="PP_post-timestamp">{getTimestamp(new Date(post.postedDate))}</p>
            </div>
            <p className="PP_post-author">Posted by {post.userID.displayName}</p>
            <h2 className="PP_post-title">{post.title}</h2>
            {post.flair && (
                <div className="PP_post-flair">{post.flair}</div>
            )}
            <div className="PP_post-content">{post.content}</div>
            <div className="PP_post-view-info">
                <p>
                    <span className="PP_post-views">{post.views}</span> Views |
                    <span className="PP_post-comments-count">
                        {numComments || numComments === 0 ? (
                            <span>{numComments} </span>
                        ) : (
                            <span>Loading numComments...</span>
                        )}
                    </span>
                     Comments |
                     <span className="PP_post-upvotes">{upvoteCount}</span> Upvotes
                </p>
            </div>
            {!user.isGuest && (
                <div className="PP_vote-buttons">
                    {userVote === 1 ? (
                        <button onClick={handleRemoveUpvote} className="PP_vote-button-selected">▲ Upvoted</button>
                    ) : (
                        <button onClick={handleUpvote} className="PP_vote-button">▲ Upvote</button>
                    )}
                    {userVote === -1 ? (
                        <button onClick={handleRemoveDownvote} className="PP_vote-button-selected">▼ Downvoted</button>
                    ) : (
                        <button onClick={handleDownvote} className="PP_vote-button">▼ Downvote</button>
                    )}
                </div>
            )}
            {!user.isGuest && (
                <button className="PP_add-comment-button" onClick={() => navigate('create-comment', { ID: post._id, Type: 'post' } )}>
                    Add a comment
                </button>
            )}
            <div className="PP_delimiter"></div>
            <div className="PP_post-comments">
                {generateComments(post)}
            </div>
        </div>
    );

    // return (
    //     <div id="post-page" className="PP_page-view">
    //         <div className="PP_post-header">
    //             <h3 className="PP_post-community-name">{post.communityName}</h3>
    //             <span className="PP_separator">|</span>
    //             <p className="PP_post-timestamp">{getTimestamp(new Date(post.postedDate))}</p>
    //         </div>
    //         <p className="PP_post-author">Posted by {post.userID.displayName}</p>
    //         <h2 className="PP_post-title">{post.title}</h2>
    //         {post.flair && (
    //             <div className="PP_post-flair">{post.flair}</div>
    //         )}
    //         <div className="PP_post-content">{post.content}</div>
    //         <div className="PP_post-view-info">
    //             <p>
    //                 <span className="PP_post-views">{post.views}</span> Views |
    //                 <span className="PP_post-comments-count"> {numComments || numComments === 0 ? (
    //                     <span>{numComments} </span>  // Render linkFlair info if it exists
    //                 ) : (
    //                     <span>Loading numComments...</span>
    //                 )}</span>
    //                  Comments |
    //                  <span className="PP_post-views"> {post.upvoteCount}</span> Upvotes
    //             </p>
    //         </div>
    //         {!user.isGuest && (
    //             <button className="PP_add-comment-button" onClick={() => navigate('create-comment', { ID: post._id, Type: 'post' } )}>
    //                 Add a comment
    //             </button>
    //         )}
    //         <div className="PP_delimiter"></div>
    //         <div className="PP_post-comments">
    //             {generateComments(post)}
    //         </div>
    //     </div>
    // );
}

export default Post;