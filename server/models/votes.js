// Vote Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const votesSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postID: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    commentID: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    voteType: { 
        type: String, 
        enum: ['upvote', 'downvote'], 
        required: true 
    }
}, {
    validate: {
        validator: function(value) {
            // Ensure either postID or commentID is provided (but not both or neither)
            return (this.postID && !this.commentID) || (!this.postID && this.commentID);
        },
        message: 'Either postID or commentID must be provided, but not both.'
    }
});

votesSchema.virtual('url').get(function() {
    return `votes/${this._id}`;
});

const Vote = mongoose.model('Vote', votesSchema);
module.exports = Vote;