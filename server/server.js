// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const axios = require('axios');
app.use(cors());
app.use(express.json());

const Community = require('./models/communities');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkFlairs');
const Post = require('./models/posts');
const Vote = require('./models/votes');
const User = require('./models/users');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/phreddit')
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
});

app.get("/", function (req, res) {
    res.send("Hello Phreddit!");
});

const server = app.listen(8000, () => {
    console.log("Server listening on port 8000...");
});

// handle server termination gracefully
process.on('SIGINT', async () => {
    console.log("\nShutting down...");
    await mongoose.connection.close(); // Disconnect from db
    console.log("Server closed. Database instance disconnected.");
    process.exit(0); // Exit
});

// ================================================================
//                     EXPRESS ROUTES
// ================================================================

// COMMUNITIES

// Get all communities
app.get('/communities', async (req, res) => {
    try {
        const communities = await Community.find();
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a community by ID
app.get('/communities/:id', async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        // const community = await Community.findById(req.params.id).populate('postIDs');
        if (!community) {
            res.status(404)
        }
        res.json(community);
    } catch (error) {
        res.status(500)
    }
});

// Delete a community by ID
app.delete('/communities/:id', async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        // Find the user by their ID and update the array
        const userID = community.members[0];
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.createdCommunityIDs = user.createdCommunityIDs.filter(id => id !== createdCommunityIDs);
        await user.save();

        const postIDs = community.postIDs;
        await Post.deleteMany({ _id: { $in: postIDs } });
        await community.deleteOne();
        res.json({ message: 'Community and associated posts deleted successfully' });
    } catch (error) {
        console.error('Error deleting community:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new community
app.post('/communities', async (req, res) => {

    const { name, description, members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: "Members array must not be empty." });
    }

    const matchingNameCommunity = await Community.findOne({ postIDs: req.params.name });
    if (matchingNameCommunity) {
        return res.status(404).json({ message: 'Community name must be unique!' });
    }
    
    const newCommunity = new Community({
        name,
        description,
        members,
        memberCount: members.length // should be >= 1
    });

    try {
        const savedCommunity = await newCommunity.save();

        const userID = members[0]; // assume first one is owner, update their data
        await User.findByIdAndUpdate(userID, {
            $addToSet: {
                createdCommunityIDs: savedCommunity._id,
                joinedCommunityIDs: savedCommunity._id,
            }
        });

        res.status(201).json(savedCommunity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update Community by ID
app.put('/communities/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const updatedCommunity = await Community.findByIdAndUpdate(
        id, 
        updates, 
        { new: true } // Return the updated document
      );
  
      if (!updatedCommunity) {
        return res.status(404).json({ error: "Community not found" });
      }
  
      res.status(200).json(updatedCommunity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error while updating community" });
    }
});

// Get community by post ID
app.get('/community-by-post/:postID', async (req, res) => {
    try {
        const community = await Community.findOne({ postIDs: req.params.postID });
        if (!community) {
            return res.status(404).json({ message: 'Community not found for the given post ID' });
        }
        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// handler for joining or leaving a community
app.patch('/community/join-leave', async (req, res) => {
    const { userId, communityId, action } = req.body;
  
    try {
      const user = await User.findById(userId);
      const community = await Community.findById(communityId);
  
      if (!user || !community) {
        return res.status(404).json({ message: 'User or Community not found' });
      }
  
      if (action === 'join') {
        community.members.push(userId);
        user.joinedCommunityIDs.push(communityId);
      } else if (action === 'leave') {
        community.members = community.members.filter(id => id !== userId);
        user.joinedCommunityIDs = user.joinedCommunityIDs.filter(id => id !== communityId);
      } else {
        return res.status(400).json({ message: 'Invalid action' });
      }

      await user.save();
      await community.save();
  
      res.status(200).json({ message: `User ${action}ed the community successfully` });
    } catch (error) {
      console.error('Error updating community:', error);
      res.status(500).json({ message: 'Server error' });
    }
});
  

// POSTS
// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userID', 'displayName')
            .exec();
        
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a post by ID
app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('userID', 'displayName')
            .exec();
        // const post = await Post.findById(req.params.id).populate('community comments').exec();
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// update posts
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedPost) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update the post" });
    }
});

// Server-side function to get the most recent comment on a post, including replies
async function getMostRecentPostComment(post) {
    if (!post.commentIDs || post.commentIDs.length === 0) {
        return null;
    }

    let mostRecentComment = await Comment.findById(post.commentIDs[0]).exec(); // Initial most recent comment

    // Recursive function to process comments and find the most recent
    const processComment = async (commentID) => {
        const comment = await Comment.findById(commentID).exec();
        if (!comment) return; // Handle case where the comment is not found

        // Compare and update the most recent comment
        if (new Date(comment.commentedDate) > new Date(mostRecentComment.commentedDate)) {
            mostRecentComment = comment;
        }

        // Process replies recursively
        for (const replyCommentID of comment.commentIDs || []) {
            await processComment(replyCommentID);
        }
    };

    // Process each top-level comment of the post
    for (const commentID of post.commentIDs) {
        await processComment(commentID);
    }

    return mostRecentComment;
}

// Get most recent comment
app.get('/posts/:postId/most-recent-comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('commentIDs').exec();
        if (!post || !post.commentIDs || post.commentIDs.length === 0) {
            return res.status(404).json({ message: 'No comments found for this post' });
        }

        const mostRecentComment = await getMostRecentPostComment(post);
        res.json(mostRecentComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new post
app.post('/posts', async (req, res) => {
    const { title, content, linkFlairID, userID, communityID } = req.body;
    const newPost = new Post({
        title,
        content,
        linkFlairID,
        userID,
        // date defaults to current date
        // commentIDs initially empty
        // views initially 0
    });

    try {
        const savedPost = await newPost.save();

        // Update community to add the post's ID 
        console.log("updating community id ", communityID);
        const updatedCommunity = await Community.findByIdAndUpdate(
            communityID,
            { $push: { postIDs: savedPost._id } },
            { new: true }
        );
        console.log("successfully updated community!!!!!");

        // Update user to add the post's ID 
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { $push: { createdPostIDs: savedPost._id } },
            { new: true }
        );
        console.log("successfully updated community!!!!!");

        if (!updatedCommunity) {
            return res.status(404).json({ message: 'Community not found' });
        }

        res.status(201).json({ savedPost, updatedCommunity });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get number of comments on postID
app.get('/posts/:postID/num-comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postID);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const countComments = async (commentIDs) => {
            let count = 0;
            for (const commentID of commentIDs) {
                const comment = await Comment.findById(commentID);
                if (comment) {
                    count++; // Count the current comment
                    if (comment.commentIDs && comment.commentIDs.length > 0) {
                        count += await countComments(comment.commentIDs); // Recursively count replies
                    }
                }
            }
            return count;
        };

        const numComments = await countComments(post.commentIDs || []);
        res.json({ numComments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Increment views for a post
app.patch('/posts/:id/increment-views', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating views:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a post by ID
app.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the user by their ID and update the array
        const userID = post.userID;
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.createdPostIDs = user.createdPostIDs.filter(id => id !== createdPostIDs);
        await user.save();

        const commentIDs = post.commentIDs;
        await Comment.deleteMany({ _id: { $in: commentIDs } });
        await post.deleteOne();
        res.json({ message: 'Post and associated commentes deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// LINK FLAIRS

// Get all link flairs
app.get('/linkFlairs', async (req, res) => {
    try {
        const linkflairs = await LinkFlair.find();
        res.json(linkflairs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a linkflair by ID
app.get('/linkFlairs/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'ID is required' });
        }
        const linkFlair = await LinkFlair.findById(req.params.id);
        if (!linkFlair) {
            return res.status(404).json({ message: 'linkFlair not found' });
        }
        res.json(linkFlair);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new link flair
app.post('/linkFlairs', async (req, res) => {
    const { content } = req.body;
    const newLinkFlair = new LinkFlair({
        content
    });

    try {
        const savedLinkFlair = await newLinkFlair.save();
        res.status(201).json(savedLinkFlair);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// COMMENTS

// Get all comments
app.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('userID', 'displayName')
            .exec();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a comment by ID
app.get('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('userID', 'displayName')
            .exec();
        if (!comment) {
            return res.status(404).json({ message: 'comment not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new comment
app.post('/comments', async (req, res) => {
    const { content, userID, parentData } = req.body;
    const newComment = new Comment({
        content,
        userID
    });

    try {
        const savedComment = await newComment.save();

        if (!parentData || !parentData.ID || !parentData.Type) {
            return res.status(400).json({ message: "Parent data is missing or invalid" });
        }
        parentID = parentData.ID;
        parentType = parentData.Type;
        if (parentType === 'post') {
            const parentPost = await Post.findById(parentID);
            parentPost.commentIDs.push(savedComment._id);
            await parentPost.save();
        } else if (parentType === 'comment') {
            const parentComment = await Comment.findById(parentID);
            parentComment.commentIDs.push(savedComment._id);
            await parentComment.save();
        } else {
            console.log("commenting on something invalid");
        }

        // Update user to add the comment's ID 
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { $push: { createdCommentIDs: savedComment._id } },
            { new: true }
        );

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get comments for a specific post by postID
app.get('/posts/:postID/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postID);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({
            '_id': { $in: post.commentIDs } // Query 
        })
            .sort({ commentedDate: -1 }) // Sort by commentedDate descending (most recent first)
            .populate('userID', 'displayName')
            .exec(); 

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get replies to a specific comment by commentID
app.get('/comments/:commentID/replies', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentID);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const comments = await Comment.find({
            '_id': { $in: comment.commentIDs } // Query 
        })
            .sort({ commentedDate: -1 }) // Sort by commentedDate descending (most recent first)
            .populate('userID', 'displayName')
            .exec(); 

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a comment by ID
app.delete('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Find the user by their ID and update the createdCommentIDs array
        const userID = comment.userID;
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.createdCommentIDs = user.createdCommentIDs.filter(id => !comment.commentIDs.includes(id) && id !== commentID);
        await user.save();

        const commentIDs = comment.commentIDs;
        await Comment.deleteMany({ _id: { $in: commentIDs } });
        await comment.deleteOne();
        res.json({ message: 'Comment and associated replies deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/comments/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const updatedComment = await Comment.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedComment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      res.status(200).json(updatedComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update the comment' });
    }
  });


// SEARCHING

app.get('/search', async (req, res) => {
    try {
        const query = req.query.query;  
        let results = await getSearchResults(query);

        // Populate userID's displayName in each post document
        results = await Post.populate(results, { path: 'userID', select: 'displayName' });
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error processing search' });
    }
});

// Search function: Get posts that have the query in the title or content, OR one of their comments has the query
async function getSearchResults(query) {
    const queryTerms = query.split(' ').map(word => word.toLowerCase());
    let posts = await Post.find();
    async function commentChainContainsQueryTerm(commentID, queryTerms) {
        const comment = await Comment.findById(commentID);
        if (!comment) return false;
        const cleanedContent = cleanString(comment.content);
        for (const term of queryTerms) {
            if (cleanedContent.includes(term)) return true;
        }
        // Check replies recursively
        for (let replyCommentID of comment.commentIDs) {
            if (await commentChainContainsQueryTerm(replyCommentID, queryTerms)) return true;
        }
        return false;
    }
    const filteredPosts = [];
    for (let post of posts) {
        for (const queryTerm of queryTerms) {
            const title = cleanString(post.title);
            const content = cleanString(post.content);
            if (title.includes(queryTerm) || content.includes(queryTerm)) {
                filteredPosts.push(post);
                break;
            }
            for (let commentID of post.commentIDs) {
                if (await commentChainContainsQueryTerm(commentID, queryTerms)) {
                    filteredPosts.push(post);
                    break;
                }
            }
        }
    }
    return filteredPosts;
}

// VOTES

// Get a user's vote on a comment or post
app.get('/votes/:targetID/:userID', async (req, res) => {
    try {
        const { targetID, userID } = req.params;
        const vote = await Vote.findOne({
            userID,
            $or: [{ postID: targetID }, { commentID: targetID }] // Check if it's either postID or commentID
        });

        // Return the vote even if its null (neither vote arrow will be highlighted)
        res.json(vote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new vote
app.post('/votes', async (req, res) => {
    const { userID, postID, commentID, voteType } = req.body;
    
    const newVote = new Vote({
        userID, 
        postID, 
        commentID, 
        voteType
    });

    try {
        let savedVote

        // Check if we are voting on a post
        if (postID) { 
            // Delete the user's current vote on this post in preparation of a new one.
            if (await Vote.findOne({userID: userID, postID: postID})) {
                await deleteVote(userID, postID, null, voteType);
            }

            savedVote = await newVote.save();

            const post = await Post.findById(postID);

            // Throw an error in case post is not valid.
            if (!post) {
                return res.status(404).json({ error: 'Post not found.' });
            }

            const posterID = post.userID;  // Get the poster's ID

            // If it's an upvote, the post should increase upvote count by 1, and reputation of poster should increase by 5
            // If it's a downvote, the post should decrease upvote count by 1, and reputation of poster should decrease by 10
            if (voteType === 'upvote') {
                await Post.findByIdAndUpdate(posterID, { $inc: { upvoteCount: 1 } });
                await User.findByIdAndUpdate(userID, { $inc: { reputation: 5 } });
            } else if (voteType === 'downvote') {
                await Post.findByIdAndUpdate(posterID, { $inc: { upvoteCount: -1 } });
                await User.findByIdAndUpdate(userID, { $inc: { reputation: -10 } });
            }

        // Check if we are voting on a comment
        } else if (commentID) {
            // Delete the user's current vote on this comment in preparation of a new one.
            if (await Vote.findOne({userID: userID, commentID: commentID})) {
                await deleteVote(userID, null, commentID, voteType);
            }

            savedVote = await newVote.save();
            const comment = await Comment.findById(commentID);

            // Throw an error in case comment is not valid.
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found.' });
            }

            const commenterID = comment.userID;  // Get the commenter's ID

            // If it's an upvote, the comment should increase upvote count by 1, and reputation of commenter should increase by 5
            // If it's a downvote, the comment should decrease upvote count by 1, and reputation of commenter should decrease by 10
            if (voteType === 'upvote') {
                await Comment.findByIdAndUpdate(commentID, { $inc: { upvoteCount: 1 } });
                await User.findByIdAndUpdate(commenterID, { $inc: { reputation: 5 } });
            } else if (voteType === 'downvote') {
                await Comment.findByIdAndUpdate(commentID, { $inc: { upvoteCount: -1 } });
                await User.findByIdAndUpdate(commenterID, { $inc: { reputation: -10 } });
            }
        }

        res.status(201).json(savedVote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/votes', async (req, res) => {
    const { userID, postID, commentID, voteType } = req.body;
    try {
        const result = await deleteVote(userID, postID, commentID, voteType);
        res.status(200).json({ success: result });
    } catch (error) {
        console.error("Error deleting vote:", error.message);
        res.status(400).json({ message: error.message });
    }
});

async function deleteVote (userID, postID, commentID, voteType) {
    try {
        // Find the existing vote (based on whether it's for a post or comment)        
        let vote;
        if (postID) {
            vote = await Vote.findOne({userID: userID, postID: postID});
        } else if (commentID) {
            vote = await Vote.findOne({userID: userID, commentID: commentID});
        }

        if (!vote) {
            throw new Error('Vote not found.');
        }

        // Remove the vote
        await vote.deleteOne();

        // Update karma and post upvote count if it's a post vote
        if (postID) {
            if (voteType === 'upvote') {
                // Decrease upvote count for post and user karma
                await Post.findByIdAndUpdate(postID, { $inc: { upvoteCount: -1 } });
                await User.findByIdAndUpdate(userID, { $inc: { karma: -5 } });
            } else if (voteType === 'downvote') {
                // Increase upvote count for post and user karma
                await Post.findByIdAndUpdate(postID, { $inc: { upvoteCount: 1 } });
                await User.findByIdAndUpdate(userID, { $inc: { karma: 10 } });
            }
        }

        // Update karma and comment upvote count if it's a comment vote
        if (commentID) {
            if (voteType === 'upvote') {
                // Decrease upvote count for comment and user karma
                await Comment.findByIdAndUpdate(commentID, { $inc: { upvoteCount: -1 } });
                await User.findByIdAndUpdate(userID, { $inc: { karma: -5 } });
            } else if (voteType === 'downvote') {
                // Increase upvote count for comment and user karma
                await Comment.findByIdAndUpdate(commentID, { $inc: { upvoteCount: 1 } });
                await User.findByIdAndUpdate(userID, { $inc: { karma: 10 } });
            }
        }
    } catch (error) {
        throw new Error(`Failed to delete vote: ${error.message}`);
        return false;
    }

    return true;
}

// USERS

// Get all users data
app.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new user
app.post('/users', async (req, res) => {
    const {firstName, lastName, email, displayName, password, isAdmin} = req.body;
    
    // Handle password
    if (password.includes(firstName) || password.includes(lastName) || password.includes(email)) {
        return res.status(400).json({ message: "Password cannot contain first or last name or email." });
    }

    const sameEmailUser = await User.findOne({ email: email });
    if (sameEmailUser) {
        return res.status(400).json({ message: "Email already taken." });
    }

    const sameDisplayNameUser = await User.findOne({ displayName: displayName });
    if (sameDisplayNameUser) {
        return res.status(400).json({ message: "Display Name already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const reputation = isAdmin ? 1000 : 100; 

    const newUser = new User({
        firstName,
        lastName,
        email,
        displayName,
        passwordHash,
        isAdmin: isAdmin || false,
        joinedDate,
        reputation
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json({ savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if successful login using email and password
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const secretKey = 'skibidi';

        // Generate a JWT token if success
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin }, // Payload: User ID and Admin status
            secretKey, // Secret key for signing the token
            { expiresIn: '1h' } // Token expiration time
        );

        // Send the response with the token and user information
        res.status(200).json({
            message: "Login successful",
            token, // The token will be used for further authenticated requests
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                displayName: user.displayName,
                isAdmin: user.isAdmin,
                joinedDate: user.joinedDate,
                reputation: user.reputation,
                createdCommunityIDs: user.createdCommunityIDs,
                joinedCommunityIDs: user.joinedCommunityIDs,
                createdPostIDs: user.createdPostIDs,
                createdCommentIDs: user.createdCommentIDs,
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
    try {
      const userID = req.params.id;
      const user = await User.findById(userID).select('-passwordHash'); // dont send password just in case
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Helper function to clean strings
function cleanString(str) {
    return str.replace(/\s+/g, '').toLowerCase();
}