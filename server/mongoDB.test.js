const mongoose = require('mongoose');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkFlairs');
const UserModel = require('./models/users');

const app = require('./server');
const axios = require('axios');
const bcrypt = require('bcrypt');

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit');
});

afterAll(async () => {
    await mongoose.connection.close();  // Close connection after tests
});

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentIDs: commentObj.commentIDs || [],
        userID: commentObj.userID,
        commentedDate: commentObj.commentedDate,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        userID: postObj.userID,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
    });
    return newPostDoc.save();
}

async function createUser(userObj) {
    const existingUser = await UserModel.findOne({ displayName: userObj.displayName });
    if (existingUser) {
        throw new Error(`User with displayName "${userObj.displayName}" already exists.`);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userObj.password, salt);
    let newUserDoc = new UserModel({
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        email: userObj.email,
        displayName: userObj.displayName,
        passwordHash: passwordHash,
        isAdmin: userObj.isAdmin || false,
        reputation: userObj.reputation,
        joinedDate: userObj.joinedDate,
        createdCommunityIDs: [],
        joinedCommunityIDs: [],
        createdPostIDs: [],
        createdCommentIDs: []
    });
    return newUserDoc.save();
}

test('should delete post and all comments', async () => {
    const user1 = {
        firstName: "Tester",
        lastName: "Tester",
        email: "Tester@Tester.com",
        displayName: "Testing",
        password: "test",
        isAdmin: false,
        reputation: 500,
        joinedDate: new Date("December 6, 2024 10:00:00"),
    };
    let userID1 = (await createUser(user1))._id;

    const comment1 = {
        content: 'Commento one',
        commentIDs: [],
        userID: userID1,
        commentedDate: new Date("November 18, 2024 5:00:00"),
    };
    let commentID1 = (await createComment(comment1))._id;

    const comment2 = {
        content: 'Commento two',
        commentIDs: [],
        userID: userID1,
        commentedDate: new Date("November 19, 2024 5:00:00"),
    };
    let commentID2 = (await createComment(comment1))._id;

    // Creating a post and associated comments
    const post1 = {
        title: 'Test post',
        content: 'contents',
        linkFlairID: null,
        userID: userID1,
        postedDate: new Date("December 6, 2024 4:30:00"),
        commentIDs: [commentID1, commentID2],
        views: 512,
    }
    let postID1 = (await createPost(post1))._id;

    const response = await axios.delete(`http://localhost:8000/posts/${postID1}`);

    expect(response.status).toBe(200);  // Expect successful deletion

    // Assert the post and comments are deleted
    const postInDb = await PostModel.findById(postID1);
    const comment1inDb = await CommentModel.findById(commentID1);
    const comment2inDb = await CommentModel.findById(commentID2);

    expect(postInDb).toBeNull();  // Post should be deleted
    expect(comment1inDb).toBeNull();  // Post should be deleted
    expect(comment2inDb).toBeNull();  // Post should be deleted
});
