const express = require('express')
const Incidencia = require('../models/Incidencia')
let router = express.Router()

// Cogemos todas las incidencias
router.get('/', async (req, res) => {
  try {
    const incidencias = await Incidencia.find()
    res.status(200).json({
      status: 'success',
      length: incidencias.length,
      data: incidencias,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

// Coger las incidencias por status
router.get('/status', async (req, res) => {
    try {
        const status = req.query.status
        const incidencias = await Incidencia.find({ status })
        res.status(200).json({
            status: 'success',
            length: incidencias.length,
            data: incidencias
        })
    } catch (err) {
        res.status(500).json({
          status: 'failed',
          message: err,
        })
    }
})

// Cogemos la incidencia por Id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const incidencia = await Incidencia.findById(id)
        res.status(200).json({
            status: 'success',
            data: incidencia
        })
    } catch (err) {
        res.status(500).json({
          status: 'failed',
          message: err,
        })
    }
})

// Actualizamos la incidencia por Id
router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const incidencia = await Incidencia.findByIdAndUpdate(id, req.body, {
          new: true,
        })
        res.status(200).json({
            status: 'success',
            data: incidencia
        })
    } catch (err) {
        res.status(500).json({
          status: 'failed',
          message: err,
        })
    }
})

// Eliminamos la incidencia por Id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        await Incidencia.findByIdAndDelete(id)
        res.status(204).json({
          status: 'success',
          message: `Incidencia ${id} eliminada satisfactoriamente.`,
        })
    } catch (err) {
        res.status(500).json({
          status: 'failed',
          message: err,
        })
    }
})

// Insertamos una nueva incidencia
router.post('/', async (req, res) => {
  try {
    const {
      dbIds,
      user,
      createdAt,
      assignedTo,
      description,
      status,
      closedAt,
      files,
      title,
    } = req.body
    const incidencia = new Incidencia({
      dbIds,
      user,
      createdAt,
      assignedTo,
      description,
      status,
      closedAt,
      files,
      title,
    })
    await incidencia.save()
    res.status(200).json({
      status: 'success',
      data: incidencia,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

module.exports = router
