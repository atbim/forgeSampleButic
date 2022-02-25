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
    viewer.model.getBulkProperties(dbIds, [parametro], res => {
        var total = 0.00
        var texto = res[0].properties[0].displayName
        res.forEach(item => {
            total += item.properties[0].displayValue
        })
        console.log('El ' + texto + ' del modelo es: ' + total.toFixed(2))
    })
}

const datosSeleccion = (dbIds) => {
  viewer.model.getBulkProperties(dbIds, ['Length', 'Volume', 'Area'], res => {
    //['Longitud', 'Volumen', 'Área']
    var longitud = 0.00
    var area = 0.00
    var volumen = 0.00
    // Nos recorremos cada objeto de la selección
    res.forEach(item => {
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
    dbIds.forEach(dbId => {
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
