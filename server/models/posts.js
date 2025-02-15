// Post Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    linkFlairID: {
        type: Schema.Types.ObjectId,
        ref: 'LinkFlair'
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postedDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    commentIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: [],
    }],
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    upvoteCount: {
        type: Number,
        default: 0,
    }
});

postSchema.virtual('url').get(function() {
    return `posts/${this._id}`;
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;