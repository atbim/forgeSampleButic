const express = require('express')
const TypeMark = require('../models/TypeMark')
let router = express.Router()

// Cogemos todos las typemarks
router.get('/', async (req, res) => {
  try {
    const typemarks = await TypeMark.find()
    res.status(200).json({
      status: 'success',
      length: typemarks.length,
      data: typemarks,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

// Cogemos typemarks por Proyecto
router.get('/:project', async (req, res) => {
  try {
    const project = req.params.project
    const typemarks = await TypeMark.find({ project })
    res.status(200).json({
      status: 'success',
      length: typemarks.length,
      data: typemarks,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

// Insertamos un nuev typemark
router.post('/', async (req, res) => {
  try {
    const {
      typemark,
      project,
    } = req.body
    const newTypemark = new TypeMark({
      typemark,
      project,
    })
    await newTypemark.save()
    res.status(200).json({
      status: 'success',
      data: newTypemark,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

module.exports = router
