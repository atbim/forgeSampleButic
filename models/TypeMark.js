const mongoose = require('mongoose')

const TypeMarkSchema = new mongoose.Schema({
  typemark: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  }
})

module.exports = TypeMark = mongoose.model('typemark', TypeMarkSchema)