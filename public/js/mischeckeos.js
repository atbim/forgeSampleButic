const getCheckGeneral = async () => {
  var _data = {
    ok: {
      keynote: [],
      assemblyCode: [],
      typeName: [],
      typeMark: [],
    },
    wrong: {
      keynote: [],
      assemblyCode: [],
      typeName: [],
      typeMark: [],
    },
    undefined: {
      keynote: [],
      assemblyCode: [],
      typeName: [],
      typeMark: [],
    },
  }
  const dbIds = await getInstancesAsync()
  const items = await _getBulkPropertiesAsync(viewer, dbIds, [
    'Keynote',
    'Assembly Code',
    'Type Name',
    'Type Mark',
  ])
  const res = await getTypeMarksFromThisProject()
  const typeMarksDb = res.data.map((x) => x.typemark)
  items.forEach((item) => {
    // Analizamos el Keynote
    const keynote = item.properties.find((x) => x.displayName === 'Keynote')
    if (keynote !== undefined) {
      if (keynote.displayValue === '') {
        _data.wrong.keynote.push(item.dbId)
      } else {
        _data.ok.keynote.push(item.dbId)
      }
    } else {
      _data.undefined.keynote.push(item.dbId)
    }
    // Analizamos el Assembly Code
    const assemblyCode = item.properties.find(
      (x) => x.displayName === 'Assembly Code'
    )
    if (assemblyCode !== undefined) {
      if (assemblyCode.displayValue === '') {
        _data.wrong.assemblyCode.push(item.dbId)
      } else {
        _data.ok.assemblyCode.push(item.dbId)
      }
    } else {
      _data.undefined.assemblyCode.push(item.dbId)
    }
    // Analizamos que Type Name no tenga barra baja
    const typeName = item.properties.find((x) => x.displayName === 'Type Name')
    if (typeName !== undefined) {
      if (typeName.displayValue.includes('_')) {
        _data.wrong.typeName.push(item.dbId)
      } else {
        _data.ok.typeName.push(item.dbId)
      }
    } else {
      _data.undefined.typeName.push(item.dbId)
    }
    // Analizamos el TypeMark
    const typeMark = item.properties.find((x) => x.displayName === 'Type Mark')
    if (typeMark !== undefined) {
      if (typeMark.displayValue === '') {
        _data.undefined.typeMark.push(item.dbId)
      } else {
        // Tengo que comprobar si existe en la bbbdd
        const isInDb = typeMarksDb.includes(typeMark.displayValue)
        if (isInDb) {
          _data.ok.typeMark.push(item.dbId)
        } else {
          _data.wrong.typeMark.push(item.dbId)
        }
      }
    } else {
      _data.undefined.typeMark.push(item.dbId)
    }
  })

  return _data
}

const misPrimerosCheckeos = async () => {
    const _data = await getCheckGeneral()
    console.log(_data)

  const dataOk = []
  dataOk.push(_data.ok.keynote.length)
  dataOk.push(_data.ok.assemblyCode.length)
  dataOk.push(_data.ok.typeName.length)
  dataOk.push(_data.ok.typeMark.length)
  const dataWrong = []
  dataWrong.push(_data.wrong.keynote.length)
  dataWrong.push(_data.wrong.assemblyCode.length)
  dataWrong.push(_data.wrong.typeName.length)
  dataWrong.push(_data.wrong.typeMark.length)
  const dataUndefined = []
  dataUndefined.push(_data.undefined.keynote.length)
  dataUndefined.push(_data.undefined.assemblyCode.length)
  dataUndefined.push(_data.undefined.typeName.length)
  dataUndefined.push(_data.undefined.typeMark.length)

  const ctx = document.getElementById('miGrafico').getContext('2d')
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Keynote', 'Assembly Code', 'Type Name', 'Type Mark'],
      datasets: [
        {
          label: '# of Ok',
          data: dataOk,
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          borderColor: 'rgba(0, 255, 0, 1)',
          borderWidth: 1,
        },
        {
          label: '# of Wrong',
          data: dataWrong,
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 1,
        },
        {
          label: '# of Undefined',
          data: dataUndefined,
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
          borderColor: 'rgba(0, 0, 0, 255)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      onClick: function (ev, item) {
        viewer.clearThemingColors()
        if (item[0] !== undefined) {
          const label = camelize(item[0]._model.label)
          const dbIdsOk = _data.ok[label]
          const dbIdsWrong = _data.wrong[label]
          viewer.isolate(dbIdsWrong)
          const dbIdsUndefined = _data.undefined[label]
          const rojo = new THREE.Vector4(1, 0, 0, 1)
          const verde = new THREE.Vector4(0, 1, 0, 1)
          const azul = new THREE.Vector4(0, 0, 1, 1)
          dbIdsOk.forEach((dbId) => {
            viewer.setThemingColor(dbId, verde)
          })
          dbIdsWrong.forEach((dbId) => {
            viewer.setThemingColor(dbId, rojo)
          })
          dbIdsUndefined.forEach((dbId) => {
            viewer.setThemingColor(dbId, azul)
          })
        } else {
          console.log('No he seleccionado nada')
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

const camelize = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

const getTypeMarks = async () => {
  const dbIds = await getInstancesAsync()
  const items = await _getBulkPropertiesAsync(viewer, dbIds, ['Type Mark'])
  const typeMarks = items
    .map((x) => x.properties[0].displayValue)
    .filter(onlyUnique)
  console.log(typeMarks)
}

const getTypeMarksFromThisProject = async () => {
  const res = await _getBulkPropertiesAsync(viewer, [1], ['Project Number'])
  const project = res[0].properties[0].displayValue
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/forge/typemarks/' + project,
      processData: false,
      contentType: 'application/json',
      type: 'GET',
      success: function (res) {
        resolve(res)
      },
      error: function (err) {
        reject(err)
      },
    })
  })
}
