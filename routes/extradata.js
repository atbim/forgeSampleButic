const express = require('express')
const ExtraData = require('../models/ExtraData')
let router = express.Router()

// Cogemos todas los extradata
router.get('/', async (req, res) => {
  try {
    const extradata = await ExtraData.find()
    res.status(200).json({
      status: 'success',
      length: extradata.length,
      data: extradata,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

// Coger lss extradata por keynote
router.get('/:keynote', async (req, res) => {
  try {
    const keynote = req.params.keynote
    const extradata = await ExtraData.findOne({ keynote })
    res.status(200).json({
      status: 'success',
      data: extradata,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

// Insertamos un nuevo extradata
router.post('/', async (req, res) => {
  try {
    const { keynote, info } = req.body
    const extradata = new ExtraData({
      keynote,
      info,
    })
    await extradata.save()
    res.status(200).json({
      status: 'success',
      data: extradata,
    })
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err,
    })
  }
})

module.exports = router
