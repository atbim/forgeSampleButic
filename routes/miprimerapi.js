const fs = require('fs')
const express = require('express')
let router = express.Router()

router.get('/test', (req, res) => {
    res.send('test funciona!!!')
})

router.post('/test', (req, res) => {
    var email = req.body.email
    if (email === undefined) {
        return res.status(500).json({
            status: 'failed',
            message: 'Es necesario indicar el email'
        })
    }
    res.json({
        status: 'success',
        data: req.body
    })
})

router.post('/escribir', (req, res) => {
    const texto = req.body.texto
    const fichero = req.body.fichero
    fs.writeFileSync(`./${fichero}.txt`, texto)

    res.json({
        status: 'success',
        data: {
            fichero: `${fichero}.txt`,
            texto
        }
    })
})

router.get('/leer', (req, res) => {
    const fichero = req.query.fichero
    const texto = fs.readFileSync(`./${fichero}.txt`, 'utf-8')
    res.send(texto)
})

router.get('/seleccion', (req, res) => {
    const texto = fs.readFileSync('./seleccion.txt', 'utf-8')
    const seleccion = texto.split(',').map((dbId) => { return parseInt(dbId)})
    res.json({
        status: 'success',
        data: seleccion
    })
})

router.post('/seleccion', (req, res) => {
  const seleccion = `${req.body}` // const seleccion = req.body.seleccion
  fs.writeFileSync('./seleccion.txt', seleccion)

  res.json({
    status: 'success',
    message: 'Selección guardada correctamente.',
  })
})

router.post('/check', (req, res) => {
    const array = Object.values(req.body)
    array.push('\n')
    data = array.join(';')
    console.log(data)
    
    fs.appendFileSync('./checks.csv', data)
    res.json({
        status: 'success',
        message: 'Comprobación guardada correctamente'
    })
})

module.exports = router