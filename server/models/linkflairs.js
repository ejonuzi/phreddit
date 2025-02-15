// LinkFlair Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linkFlairsSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    }
});

linkFlairsSchema.virtual('url').get(function() {
    return `linkFlairs/${this._id}`;
});

const LinkFlair = mongoose.model('LinkFlair', linkFlairsSchema);
module.exports = LinkFlair;