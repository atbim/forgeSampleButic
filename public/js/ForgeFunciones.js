const miSegundaFuncion = () => {
  viewer.isolate(viewer.getSelection())
}

const search = (texto) => {
  viewer.search(
    texto,
    (dbIds) => {
      viewer.select(dbIds)
    },
    (error) => {
      console.error(error)
    }
  )
}

const sumarCosas = (dbIds, parametro) => {
  viewer.model.getBulkProperties(dbIds, [parametro], (res) => {
    var total = 0.0
    var texto = res[0].properties[0].displayName
    res.forEach((item) => {
      total += item.properties[0].displayValue
    })
    console.log('El ' + texto + ' del modelo es: ' + total.toFixed(2))
  })
}

const datosSeleccion = (dbIds) => {
  viewer.model.getBulkProperties(dbIds, ['Length', 'Volume', 'Area'], (res) => {
    //['Longitud', 'Volumen', 'Área']
    var longitud = 0.0
    var area = 0.0
    var volumen = 0.0
    // Nos recorremos cada objeto de la selección
    res.forEach((item) => {
      // Cogemos la propiedad Length del item
      var hasLength = item.properties.find((x) => x.displayName === 'Length')
      // Si tiene longitud sumamos su valor a la variable longitud
      if (hasLength !== undefined) {
        longitud += hasLength.displayValue
      }

      var hasArea = item.properties.find((x) => x.displayName === 'Area')
      if (hasArea !== undefined) {
        area += hasArea.displayValue
      }
      var hasVolume = item.properties.find((x) => x.displayName === 'Volume')
      if (hasVolume !== undefined) {
        volumen += hasVolume.displayValue
      }
    })
    $('#sumLongitud').text(`${longitud.toFixed(2)} mm`)
    $('#sumArea').text(`${area.toFixed(2)} m2`)
    $('#sumVolumen').text(`${volumen.toFixed(2)} m3`)
  })
}

const pintarSeleccion = () => {
  var isChecked = $('#addPintura').is(':checked')
  if (!isChecked) {
    viewer.clearThemingColors()
  }
  var dbIds = viewer.getSelection()
  if (dbIds.length > 0) {
    dbIds.forEach((dbId) => {
      viewer.setThemingColor(
        dbId,
        new THREE.Vector4(180 / 255, 190 / 255, 100 / 255, 1)
      )
    })
    viewer.clearSelection()
  }
}

const guadarSeleccion = () => {
  const seleccion = viewer.getSelection()
  $.ajax({
    url: '/api/forge/miprimerapi/seleccion',
    data: JSON.stringify(seleccion), // seleccion
    processData: false,
    contentType: 'application/json',
    type: 'POST',
    success: function (res) {
      console.log(res)
    },
  })
}

const recuperarSeleccion = () => {
  $.ajax({
    url: '/api/forge/miprimerapi/seleccion',
    processData: false,
    contentType: 'application/json',
    type: 'GET',
    success: function (res) {
      console.log(res.data)
      viewer.select(res.data)
    },
  })
}

////////// COLORES //////////
const rojo = new THREE.Vector4(1, 0, 0, 1)
const verde = new THREE.Vector4(0, 1, 0, 1)
const azul = new THREE.Vector4(0, 0, 1, 1)
const blanco = new THREE.Vector4(1, 1, 1, 1)
const amarillo = new THREE.Vector4(1, 1, 0, 1)

const comprobarPropiedad = (propiedad) => {
  viewer.clearThemingColors()
  getAllLeafComponents(viewer, (dbIds) => {
    dbIds.forEach((dbId) => {
      viewer.getProperties(dbId, (res) => {
        var keynote = res.properties.find(
          (property) => property.displayName === propiedad
        )
        var data = {
          dbId: dbId,
          date: Date.now(),
          checkedBy: 'Adrian',
          model: 'modelo test',
          parameter: propiedad,
        }
        if (keynote === undefined) {
          // Pintar de amarillo
          viewer.setThemingColor(dbId, amarillo)
          data['check'] = 'Sin parametro'
        } else {
          if (keynote.displayValue === '') {
            // Pintar de color rojo
            viewer.setThemingColor(dbId, rojo)
            data['check'] = 'Sin rellenar'
          } else {
            // Pintar de color verde
            viewer.setThemingColor(dbId, verde)
            data['check'] = 'Ok'
          }
        }
        $.ajax({
          url: '/api/forge/miprimerapi/check',
          data: JSON.stringify(data),
          processData: false,
          contentType: 'application/json',
          type: 'POST',
          success: function (res) {
            console.log(res)
          },
        })
      })
    })
  })
}

const pintarCategorias = () => {
  getAllLeafComponents(viewer, (dbIds) => {
    //var categorias = []
    dbIds.forEach((dbId) => {
      viewer.getProperties(dbId, (res) => {
        var category = res.properties.find(
          (property) => property.displayName === 'Category'
        )
        if (category.displayValue === 'Revit Walls') {
          // pintar los muros de rojo
          viewer.setThemingColor(dbId, rojo)
        } else if (category.displayValue === 'Revit Floors') {
          // pintar los suelos de verde
          viewer.setThemingColor(dbId, verde)
        } else if (category.displayValue === 'Revit Furniture') {
          // pintar el mobilidario de color azul
          viewer.setThemingColor(dbId, azul)
        } else if (category.displayValue === 'Revit Roofs') {
          // pintar las cubiertas de color blanco
          viewer.setThemingColor(dbId, blanco)
        } else {
          // ocultar los objetos
          viewer.hide(dbId)
        }
        //categorias.push(category.displayValue)
      })
    })
  })
}

function buscarPropiedad(dbId, propiedad, matches) {
  return new Promise((resolve, reject) => {
    viewer.getProperties(
      dbId,
      (res) => {
        var prop = res.properties.find((x) => x.displayName === propiedad)
        if (prop !== undefined) {
          matches.push(prop.displayValue)
        }
        return resolve()
      },
      (err) => {
        return reject()
      }
    )
  })
}

function getAllLeafComponents(viewer, callback) {
  var cbCount = 0 // count pending callbacks
  var components = [] // store the results
  var tree // the instance tree

  function getLeafComponentsRec(parent) {
    cbCount++
    if (tree.getChildCount(parent) != 0) {
      tree.enumNodeChildren(
        parent,
        function (children) {
          getLeafComponentsRec(children)
        },
        false
      )
    } else {
      components.push(parent)
    }
    if (--cbCount == 0) callback(components)
  }
  viewer.getObjectTree(function (objectTree) {
    tree = objectTree
    var allLeafComponents = getLeafComponentsRec(tree.getRootId())
  })
}
