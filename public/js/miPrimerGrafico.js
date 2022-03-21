const _getBulkPropertiesAsync = (viewer, dbIds, parametros) => {
  return new Promise((resolve, reject) => {
    viewer.model.getBulkProperties(dbIds, parametros, res => {
      resolve(res)
    }, err => {
      reject(err)
    })
  })
}

const dibujarGrafico = async () => {
  const rojo = new THREE.Vector4(1, 0, 0, 1)
  const ctx = document.getElementById('myChart').getContext('2d')
  const ejemplares = await getInstancesAsync()
  const res = await _getBulkPropertiesAsync(viewer, ejemplares, ['Type Name', 'Area'])
  var _data = {
  }
  res.forEach(item => {
    // Checkear que tienen las 2 propiedades, tanto Type Name como Area
    if (item.properties.length === 2) {
      const typeName = item.properties.find(x => x.displayName === 'Type Name')
      const area = item.properties.find(x => x.displayName === 'Area')
      if (typeName.displayValue !== '') {
        if (_data[typeName.displayValue] === undefined)
          _data[typeName.displayValue] = { area: 0, dbIds: [] }
        _data[typeName.displayValue].area += area.displayValue
        _data[typeName.displayValue].dbIds.push(item.dbId)
      }
    }
  })

  var labels = Object.keys(_data)
  var data = labels.map((key) => _data[key].area.toFixed(2))
  var colors = _generateColors(labels.length)

  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Area',
          data,
          backgroundColor: colors.background,
          borderColor: colors.borders,
          borderWidth: 1,
        },
      ],
    },
    options: {
      onClick: function (ev, item) {
        if (item[0] !== undefined) {
          console.log(item[0]._model.backgroundColor)
          const rgb = item[0]._model.backgroundColor
            .split('(')[1]
            .split(')')[0]
            .split(',')
            .map(x => parseFloat(x))
          const color = new THREE.Vector4(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3])
          const label = item[0]._model.label
          const dbIds = _data[label].dbIds
          viewer.isolate(dbIds)
          viewer2.isolate(dbIds)
          viewer.clearThemingColors()
          viewer2.clearThemingColors()
          dbIds.forEach((dbId) => {
            viewer.setThemingColor(dbId, color)
            viewer2.setThemingColor(dbId, rojo)
          })
          viewer.fitToView(dbIds)
          viewer2.fitToView(dbIds)
        } else {
          viewer.showAll()
          viewer2.isolate()
          viewer.clearThemingColors()
          viewer2.clearThemingColors()
          viewer.fitToView()
          viewer2.fitToView()
        }
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

const _generateColors = (count) => {
    var background = []
    var borders = []
    for (var i = 0; i < count; i++) {
      var r = Math.round(Math.random() * 255)
      var g = Math.round(Math.random() * 255)
      var b = Math.round(Math.random() * 255)
      background.push('rgba(' + r + ', ' + g + ', ' + b + ', 0.2)')
      borders.push('rgba(' + r + ', ' + g + ', ' + b + ', 1)')
    }
    return { background, borders }
  }
