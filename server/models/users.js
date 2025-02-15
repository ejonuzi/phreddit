// User Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // Email validation
    },
    displayName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    reputation: {
        type: Number,
        default: 100, // if the user is an admin this will be 1000
    },
    joinedDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    createdCommunityIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Community',
        default: [],
    }],
    joinedCommunityIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Community',
        default: [],
    }],
    createdPostIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: [],
    }],
    createdCommentIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: [],
    }],
    
});

usersSchema.virtual('url').get(function() {
    return `users/${this._id}`;
});

const User = mongoose.model('User', usersSchema);
module.exports = User;