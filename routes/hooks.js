const express = require('express')
const {
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  JobSvfOutputPayload,
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

// SI SI O SI EL ENDPOINT TIENE QUE SER POST !!!!IMPORTANTÍSIMO
router.post('/callback', async (req, res, next) => {
  try {
    const urn = req.body.resourceUrn
    const metadata = await new DerivativesApi().getMetadata(
      urn,
      {},
      req.oauth_client,
      req.oauth_token
    )
    const guid = metadata.body.data.metadata[0].guid
    var properties = await new DerivativesApi().getModelviewProperties(
      urn,
      guid,
      { forceget: true },
      req.oauth_client,
      req.oauth_token
    )
    if (properties.statusCode === 202) {
      // Esperamos 30 segundos a volver a llamar.
      await sleep(30000)
      properties = await new DerivativesApi().getModelviewProperties(
        urn,
        guid,
        { forceget: true },
        req.oauth_client,
        req.oauth_token
      )
    }
    // Ahora hacemos un console log, pero podría enviar la informaicón por email, genera un PDF y adjuntarlo
    console.log(properties)
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

const sleep = (millisecond) => {
  return new Promise(resolve => {
    setTimeout(resolve, millisecond)
  })
}

module.exports = router
