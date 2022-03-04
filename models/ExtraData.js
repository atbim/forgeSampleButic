const mongoose = require('mongoose')

const Parameter = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  displayValue: {
    type: String,
    required: true,
  },
})

const ExtraDataSchema = new mongoose.Schema({
  keynote: {
    type: String,
    required: true,
    unique: true,
  },
  info: [
    {
      type: Parameter
    }
  ]
})

module.exports = ExtraData = mongoose.model('extradata', ExtraDataSchema)