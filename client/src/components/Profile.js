import React, { useState, useEffect } from 'react';
import '../stylesheets/Profile.css';
import { getTimestamp } from './timeUtils.js';
import axios from 'axios';

function Profile({ navigate, userChange, user }) {
    const adminMode = user.isAdmin

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [comments, setComments] = useState([]);
    const [currentView, setCurrentView] = useState(adminMode ? "users" : "posts");

    useEffect(() => {

        const fetchData = async () => {
            try {
                const userData = (await axios.get(`http://localhost:8000/users/${user._id}`)).data;

                const fetchUsers = async () => {
                    const response = await axios.get(`http://localhost:8000/users`);
                    return response.data;
                };

                const fetchPosts = userData.createdPostIDs.map(async (postID) => {
                    const response = await axios.get(`http://localhost:8000/posts/${postID}`);
                    return response.data;
                });

                const fetchCommunities = userData.createdCommunityIDs.map(async (communityID) => {
                    const response = await axios.get(`http://localhost:8000/communities/${communityID}`);
                    return response.data;
                });

                const fetchComments = userData.createdCommentIDs.map(async (commentID) => {
                    let response = await axios.get(`http://localhost:8000/comments/${commentID}`);
                    const posts = (await axios.get(`http://localhost:8000/posts`)).data;
                    const post = posts.find(post => post.commentIDs.includes(commentID));
                    const title = post ? post.title : "N/A";
                    return { content: response.data.content, title: title, _id: response.data._id };
                });

                const [postsData, communitiesData, commentsData, usersData] = await Promise.all([
                    Promise.all(fetchPosts),
                    Promise.all(fetchCommunities),
                    Promise.all(fetchComments),
                    fetchUsers()
                ]);

                console.log(postsData);
                console.log(communitiesData);
                console.log(commentsData);

                if (adminMode) {
                    setUsers(usersData);
                }
                setPosts(postsData);
                setCommunities(communitiesData);
                setComments(commentsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [user]);

    const renderListing = () => {
        if (currentView === "posts") {
            if (posts.length > 0) {
                return posts.map((post) => (
                    <div key={post._id} className="item" onClick={() => navigate("create-post", post)}>
                        <p>Post Title: {post.title}</p>
                    </div>
                ));
            } else {
                return <div><p>You have not created any posts.</p></div>
            }

        } else if (currentView === "communities") {
            if (communities.length > 0) {
                return communities.map((community) => (
                    <div key={community._id} className="item" onClick={() => navigate("create-community", community)}>
                        <p>Community: {community.name}</p>
                    </div>
                ));
            } else {
                return <div><p>You have not created any communities.</p></div>
            }
        } else if (currentView === "comments") {
            if (comments.length > 0) {
                return comments.map((comment) => (
                    <div key={comment._id} className="item" onClick={() => navigate("create-comment", { editMode: true, comment: comment })}>
                        <p>Post Title: {comment.title || ""}</p>
                        <p>Comment: {comment.content.slice(0, 20)}...</p>
                    </div>
                ));
            } else {
                return <div><p>You have not created any comments.</p></div>
            }
        } else if (currentView === "users") {
            if (users.length > 0) {
                return users.map((user) => (
                    <div key={user._id} className="item" onClick={() => { userChange(user); navigate("profile"); }}>
                        <p>Display name: {user.displayName}</p>
                        <p>Email address: {user.email}</p>
                        <p>Reputation: {user.reputation}</p>
                    </div>
                ));
            } else {
                return <div><p>No users found.</p></div>
            }
        }
    };

    return (
        <div className="profile-page">
            <header className="header-container">
                <h1 className="header-title">{user.displayName}</h1>
                <p className="description">
                    Email: {user.email} | Member since: {getTimestamp(new Date(user.joinedDate))} | Reputation: {user.reputation}
                </p>
                <div className="listing-buttons">
                    {adminMode && (
                        <button key='d' onClick={() => setCurrentView("users")}>Users</button>
                    )}
                    <button key='a' onClick={() => setCurrentView("posts")}>Posts</button>
                    <button key='b' onClick={() => setCurrentView("communities")}>Communities</button>
                    <button key='c' onClick={() => setCurrentView("comments")}>Comments</button>
                </div>
            </header>

            <div className="listing-container">{renderListing()}</div>
        </div>
    );
}

export default Profile;