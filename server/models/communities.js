// Community Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    postIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    startDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    members: [{
        type: String,
        validate: {
           validator: function(value) {
            return value.length > 0;
           },
           message: 'Community requires at least one member.'
        }
    }],
});

communitySchema.virtual('url').get(function() {
    return `communities/${this._id}`;
});

const Community = mongoose.model('Community', communitySchema);
module.exports = Community;