const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    original_file : {
      type: String,
      required: true
    },
    watermarked_file: {
      type: String,
      required: true
    },
})

const Media = mongoose.model("Media",MediaSchema)

module.exports = Media