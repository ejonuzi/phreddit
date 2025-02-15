/* server/init.JSON
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script as inspiration, 
** but you cannot just copy and paste it--you script has to do more to handle
** users.
*/
const mongoose = require('mongoose');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkFlairs');
const UserModel = require('./models/users');

const bcrypt = require('bcrypt');

let userArgs = process.argv.slice(2);

// Example usage:
// mongodb://127.0.0.1:27017/phreddit elton jonuzi elton@email.com ejon pass123

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

if (userArgs.length !== 6) {
    console.log('ERROR: Expected 6 arguments, but received ' + userArgs.length);
    console.log('Usage: node init.js <mongoDB_URL> <firstName> <lastName> <email> <displayName> <password>');
    return
}

let mongoDB = userArgs[0];
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

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

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
    });
    return newCommunityDoc.save();
}

async function initialize () {
    // user objects
    // Admin is created with the user arguments
    const admin = {
        firstName: userArgs[1],
        lastName: userArgs[2],
        email: userArgs[3],
        displayName: userArgs[4],
        password: userArgs[5],
        isAdmin: true,
        reputation: 1000
    }
    try {
        let adminRef = await createUser(admin);
    } catch(error) {
        console.log(error.message);
        console.log('ERROR: Could not create admin user with given parameters.');
        console.log('Usage: node init.js <mongoDB_URL> <firstName> <lastName> <email> <displayName> <password>');
        return
    }

    const user1 = {
        firstName: "Jack",
        lastName: "Weinersmith",
        email: "Jack@gmail.com",
        displayName: "JackAttack123",
        password: "socks412",
        isAdmin: false,
        reputation: 500,
        joinedDate: new Date("December 6, 2024 10:00:00"),
    };
    let userID1 = (await createUser(user1))._id;

    const user2 = {
        firstName: "Matt",
        lastName: "Van Flackerschnitzeltonberg",
        email: "email@email.email",
        displayName: "vantheman",
        password: "drivercity",
        isAdmin: false,
        reputation: 1000,
        joinedDate: new Date("July 12, 2024 5:00:00"),
    };
    let userID2 = (await createUser(user2))._id;

    const user3 = {
        firstName: "Wolfie",
        lastName: "McWolfface",
        email: "wolfie@stonybrook.edu",
        displayName: "Wolfie",
        password: "iphone3",
        isAdmin: false,
        reputation: 1000,
        joinedDate: new Date("November 28, 2024 5:00:00"),
    };
    let userID3 = (await createUser(user3))._id;

    // link flair objects
    const linkFlair1 = {
        content: 'WW3 Starting Soon' 
    };
    let linkFlairID1 = (await createLinkFlair(linkFlair1))._id;

    const linkFlair2 = {
        content: 'Science is Never Wrong',
    };
    let linkFlairID2 = (await createLinkFlair(linkFlair2))._id;

    const linkFlair3 = {
        content: 'Booooring',
    };
    let linkFlairID3 = (await createLinkFlair(linkFlair3))._id;

    // comment objects
    const comment1 = {
        content: 'What business is it of yours where I\'m from, friendo?',
        commentIDs: [],
        userID: userID1,
        commentedDate: new Date("November 18, 2024 5:00:00"),
    };
    let commentID1 = (await createComment(comment1))._id;

    const comment2 = {
        content: 'How dare you slander the birthplace of anime? You\'re just jealous you\'re not from there',
        commentIDs: [commentID1],
        userID: userID2,
        commentedDate: new Date("November 16, 2024 7:30:00"),
    };
    let commentID2 = (await createComment(comment2))._id;

    const comment3 = {
        content: 'You\'re breathtaking!',
        commentIDs: [],
        userID: userID3,
        commentedDate: new Date("December 8, 2024 5:30:00"),
    };
    let commentID3 = (await createComment(comment3))._id;

    const comment4 = {
        content: 'OMG Wolfie!? You\'re breathtaking!',
        commentIDs: [commentID3],
        userID: userID2,
        commentedDate: new Date("December 6, 2024 8:30:00"),
    };
    let commentID4 = (await createComment(comment4))._id;

    const comment5 = {
        content: 'Incredible. I have been deeply moved.',
        commentIDs: [commentID4],
        userID: userID3,
        commentedDate: new Date("December 6, 2024 6:30:00"),
    };
    let commentID5 = (await createComment(comment5))._id;

    const post1 = {
        title: 'Harvard Researchers: \"Watching Rick and Morty strongly linked to high IQ\"',
        content: 'In a follow-up statement, the lead researcher clarified, \"Wubba lubba dub dub I turned myself into a pickle morty\"',
        linkFlairID: linkFlairID2,
        userID: userID2,
        postedDate: new Date("December 6, 2024 4:30:00"),
        commentIDs: [commentID5],
        views: 512,
    }
    let postID1 = (await createPost(post1))._id;

    const post2 = {
        title: 'Japan is overrated',
        content: 'Just came back from my trip to Japan. It\'s alright I guess, nothing too fancy.',
        linkFlairID: linkFlairID1,
        userID: userID1,
        postedDate: new Date("November 13, 2024 7:30:00"),
        commentIDs: [commentID2],
        views: 42268,
    }
    let postID2 = (await createPost(post2))._id;

    const post3 = {
        title: 'Good luck on finals, my children',
        content: 'Hi all, Wolfie here. It is finals season: good luck on your exams and remember to pace yourself. We will prevail in the end. Glory to the SBU! Love, Wolfie.',
        linkFlairID: linkFlairID3,
        userID: userID3,
        postedDate: new Date("December 9, 2024 7:30:00"),
        commentIDs: [],
        views: 85,
    }
    let postID3 = (await createPost(post3))._id;

    const community1 = {
        name: 'The Gamers',
        description: 'A special community for all women-respecting gamers.',
        postIDs: [postID2, postID3],
        startDate: new Date("November 1, 2024 7:30:00"),
        members: [userID1.toString(), userID2.toString(), userID3.toString()]
    }
    let communityID1 = (await createCommunity(community1))._id;

    const community2 = {
        name: 'Real News',
        description: 'We seek the truth. Only the most unbiased real news, NO PSYOPS ALLOWED.',
        postIDs: [postID1],
        startDate: new Date("December 5, 2024 7:30:00"),
        members: [userID2.toString(), userID3.toString()]
    }
    let communityID2 = (await createCommunity(community2))._id;

    // Initialize user properties

    let user = await UserModel.findById(userID1);
    await UserModel.findByIdAndUpdate(userID1, {
        $addToSet: {
            createdCommunityIDs: communityID1,
            joinedCommunityIDs: communityID1,
            createdPostIDs: postID2,
            createdCommentIDs: commentID1
        }
    });
    user = await UserModel.findById(userID1);

    await UserModel.findByIdAndUpdate(userID2, {
        $addToSet: {
            createdCommunityIDs: communityID2,
            joinedCommunityIDs: { $each: [communityID1, communityID2] },
            createdPostIDs: postID1,
            createdCommentIDs: { $each: [commentID2, commentID4] },
        }
    });

    await UserModel.findByIdAndUpdate(userID3, {
        $addToSet: {
            joinedCommunityIDs: { $each: [communityID1, communityID2] },
            createdPostIDs: postID3,
            createdCommentIDs: { $each: [commentID3, commentID5] },
        }
    });

    if (db) {
        db.close();
    }
    console.log("done");
}

initialize()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('processing...');
