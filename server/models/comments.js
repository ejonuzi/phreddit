// Comment Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentsSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    commentIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: [],
    }],
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    commentedDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    upvoteCount: {
        type: Number,
        default: 0,
    }
});

commentsSchema.virtual('url').get(function() {
    return `comments/${this._id}`;
});

const LinkFlair = mongoose.model('Comment', commentsSchema);
module.exports = LinkFlair;