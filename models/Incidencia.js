const mongoose = require('mongoose')

const IncidenciasSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  assignedTo: String,
  description: String,
  status: {
    type: String,
    required: true,
  },
  closedAt: Date,
  title: {
    type: String,
    required: true,
  },
    dbIds: [{
      type: Number
  }],
    files: [{
      type: String
  }],
})

module.exports = Incidencia = mongoose.model('incidencia', IncidenciasSchema)