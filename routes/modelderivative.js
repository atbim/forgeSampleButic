const express = require('express')
const {
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  JobSvfOutputPayload,
  JobPayloadMisc,
} = require('forge-apis')

const { getClient, getInternalToken } = require('./common/oauth')

let router = express.Router()

// Middleware for obtaining a token for each request.
router.use(async (req, res, next) => {
  const token = await getInternalToken()
  req.oauth_token = token
  req.oauth_client = getClient()
  next()
})

// POST /api/forge/modelderivative/jobs - submits a new translation job for given object URN.
// Request body must be a valid JSON in the form of { "objectName": "<translated-object-urn>" }.
router.post('/jobs', async (req, res, next) => {
  let job = new JobPayload()
  job.input = new JobPayloadInput()
  job.input.urn = req.body.objectName
  job.output = new JobPayloadOutput([new JobSvfOutputPayload()])
  job.output.formats[0].type = 'svf'
  job.output.formats[0].views = ['2d', '3d']
  // Esta línea es para que funcione el webhook
  job.misc = new JobPayloadMisc('my-workflow-id')
  console.log(job)
  try {
    // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
    await new DerivativesApi().translate(
      job,
      {},
      req.oauth_client,
      req.oauth_token
    )
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

// GET /api/forge/modelderivative/properties/:urn - get all properties from URN.
router.get('/properties/:urn', async (req, res, next) => {
  try {
    const urn = req.params.urn
    const metadata = await new DerivativesApi().getMetadata(
      urn,
      {},
      req.oauth_client,
      req.oauth_token
    )
    const guid = metadata.body.data.metadata[0].guid // Cojo la primera vista, se podría elegir de cual quiero las propiedades
    const properties = await new DerivativesApi().getModelviewProperties(
      urn,
      guid,
      { forceget: true },
      req.oauth_client,
      req.oauth_token
    )
    res.status(200).json(properties.body.data.collection)
  } catch (err) {
    next(err)
  }
})

// GET /api/forge/modelderivative/properties/:urn/all - get all properties from all Views from URN.
router.get('/properties/:urn/all', async (req, res, next) => {
  try {
    const urn = req.params.urn
    const metadata = await new DerivativesApi().getMetadata(
      urn,
      {},
      req.oauth_client,
      req.oauth_token
    )
    const views = metadata.body.data.metadata
    var respuesta = {}
    for (var i = 0; i < views.length; i++) {
      const properties = await new DerivativesApi().getModelviewProperties(
        urn,
        views[i].guid,
        { forceget: true },
        req.oauth_client,
        req.oauth_token
      )
      if (properties.statusCode === 200) {
        respuesta[views[i].name] = { role: '', data: [] }
        respuesta[views[i].name]['role'] = views[i].role
        respuesta[views[i].name]['data'] = properties.body.data.collection
      } else {
        respuesta[views[i].name] = 'Esperando información, prueba más tarde'
      }
    }

    res.status(200).json(respuesta)
  } catch (err) {
    next(err)
  }
})

module.exports = router
