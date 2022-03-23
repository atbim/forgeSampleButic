$(document).ready(function () {
  prepareAppBucketTree()
  $('#refreshBuckets').click(function () {
    $('#appBuckets').jstree(true).refresh()
  })

  $('#createNewBucket').click(function () {
    createNewBucket()
  })

  $('#searchButton').click(function () {
    var texto = $('#customSearch').val()
    search(texto)
  })

  $('#volumeButton').click(function () {
    sumarCosas('Volume')
  })

  $('#areaButton').click(function () {
    sumarCosas('Area')
  })

  /* $('#pintarButton').click(function () {
    pintarSeleccion()
  }) */

  $('#checkPropiedadesButton').click(function () {
    var texto = $('#customSearch').val()
    comprobarPropiedad(texto)
  })

  $('#parametroButton').click(function () {
    var texto = $('#parametro').val()
    getPropValues(texto)
  })

  $('#createBucketModal').on('shown.bs.modal', function () {
    $('#newBucketKey').focus()
  })

  $('#hiddenUploadField').change(function () {
    var node = $('#appBuckets').jstree(true).get_selected(true)[0]
    var _this = this
    if (_this.files.length == 0) return
    var file = _this.files[0]
    switch (node.type) {
      case 'bucket':
        var formData = new FormData()
        formData.append('fileToUpload', file)
        formData.append('bucketKey', node.id)

        $.ajax({
          url: '/api/forge/oss/objects',
          data: formData,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function (data) {
            $('#appBuckets').jstree(true).refresh_node(node)
            _this.value = ''
          },
        })
        break
    }
  })
})

function createNewBucket() {
  var bucketKey = $('#newBucketKey').val()
  jQuery.post({
    url: '/api/forge/oss/buckets',
    contentType: 'application/json',
    data: JSON.stringify({ bucketKey: bucketKey }),
    success: function (res) {
      $('#appBuckets').jstree(true).refresh()
      $('#createBucketModal').modal('toggle')
    },
    error: function (err) {
      if (err.status == 409) alert('Bucket already exists - 409: Duplicated')
      console.log(err)
    },
  })
}

function prepareAppBucketTree() {
  $('#appBuckets')
    .jstree({
      core: {
        themes: { icons: true },
        data: {
          url: '/api/forge/oss/buckets',
          dataType: 'json',
          multiple: false,
          data: function (node) {
            return { id: node.id }
          },
        },
      },
      types: {
        default: {
          icon: 'glyphicon glyphicon-question-sign',
        },
        '#': {
          icon: 'glyphicon glyphicon-cloud',
        },
        bucket: {
          icon: 'glyphicon glyphicon-folder-open',
        },
        object: {
          icon: 'glyphicon glyphicon-file',
        },
      },
      plugins: ['types', 'state', 'sort', 'contextmenu'],
      contextmenu: { items: autodeskCustomMenu },
    })
    .on('loaded.jstree', function () {
      $('#appBuckets').jstree('open_all')
    })
    .bind('activate_node.jstree', function (evt, data) {
      if (data != null && data.node != null && data.node.type == 'object') {
        const urn = data.node.id
        $('#cuadroMandos').empty()
        $.ajax({
          url: '/api/forge/modelderivative/properties/' + urn + '/all',
          processData: false,
          contentType: 'application/json',
          type: 'GET',
          success: function (res) {
            console.log(res)
            const views = Object.keys(res)
            for (var i = 0; i < views.length; i++) {
              const id = `myChart${i}`
              $('#cuadroMandos').append(
                `<div class="col-sm-4"><canvas id="${id}" width="400" height="400"></canvas></div>`
              )
              dibujarGraficoVista(
                id,
                res[views[i]].data,
                views[i],
                res[views[i]].role
              )
            }
          },
          error: function (err) {
            console.error(err)
          },
        })
      }
      if (data != null && data.node != null && data.node.type == 'bucket') {
        const urns = data.node.children
        for (var i = 0; i < urns.length; i++) {
          const objectId = atob(urns[i])
          const array = objectId.split('.')
          const extension = array[array.length - 1]
          const id = `myChart${i}`
          $.ajax({
            url: '/api/forge/modelderivative/properties/' + urns[i],
            processData: false,
            contentType: 'application/json',
            type: 'GET',
            success: function (res) {
              $('#cuadroMandos').append(
                `<div class="col-sm-4"><canvas id="${id}" width="400" height="400"></canvas></div>`
              )
              dibujarGraficoCm(id, res, extension)
            },
            error: function (err) {
              console.error(err)
            },
          })
        }
      }
    })
}

const tranformarUnidadesSistemaMetrico = (unidad, cantidad) => {
  switch (unidad) {
    case 'mm':
      return cantidad * 0.001
    case 'ft':
      return cantidad * 0.3048
    case 'ft^3':
      return cantidad * 0.3048 * 0.3048 * 0.3048
    case 'ft^2':
      return cantidad * 0.3048 * 0.3048
    default:
      return cantidad
  }
}

const dibujarGraficoVista = (chartId, items, view, role) => {
  // Recorremos los items para montar nuestro objeto que va a ir al gráfico
  var _data = {}
  if (role === '3d') {
    items.forEach((item) => {
      let identityData = item.properties['Datos de identidad']
      if (identityData !== undefined) {
        const typeName = identityData['Nombre de tipo']
        if (typeName !== undefined) {
          // Rellenamos el objeto _data
          if (_data[typeName] === undefined)
            _data[typeName] = { area: 0, dbIds: [] }
          const cotas = item.properties['Cotas']
          if (cotas != undefined) {
            const area = cotas['Área']
            if (area !== undefined) {
              const _origen = area.split(' ')
              const areaOriginal = parseFloat(_origen[0])
              const unidad = _origen[1]
              _data[typeName].area += tranformarUnidadesSistemaMetrico(
                unidad,
                areaOriginal
              )
            }
          }
          _data[typeName].dbIds.push(item.objectid)
        }
      }
    })
    var labels = Object.keys(_data)
    var data = Object.keys(_data).map((key) => _data[key].area.toFixed(2))
    var colors = _generateColors(labels.length)

    const ctx = document.getElementById(chartId).getContext('2d')
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: view,
            data,
            backgroundColor: colors.background,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
              },
            },
          ],
          y: {
            beginAtZero: true,
            min: 0,
          },
        },
      },
    })
  } else {
    items.forEach((item) => {
      let identityData = item.properties['Datos de identidad']
      if (identityData !== undefined) {
        const category = identityData['Categoria']
        if (category !== undefined && category === 'Habitaciones') {
          const roomName = item.name
          if (_data[roomName] === undefined)
            _data[roomName] = { area: 0, altura: 0, dbIds: [] }
          const area = item.properties['Cotas']['Área']
          const _origen = area.split(' ')
          const areaOriginal = parseFloat(_origen[0])
          const unidad = _origen[1]
          _data[roomName].area += tranformarUnidadesSistemaMetrico(
            unidad,
            areaOriginal
          )
          const altura = item.properties['Cotas']['Altura sin límites']
          const _origen2 = altura.split(' ')
          const alturaOriginal = parseFloat(_origen2[0])
          const unidad2 = _origen2[1]
          _data[roomName].altura += tranformarUnidadesSistemaMetrico(
            unidad2,
            alturaOriginal
          )
          _data[roomName].dbIds.push(item.objectid)
        }
      }
    })
    var labels = Object.keys(_data)
    var dataArea = Object.keys(_data).map((key) => _data[key].area.toFixed(2))
    var dataAltura = Object.keys(_data).map((key) => _data[key].altura.toFixed(2))

    const ctx = document.getElementById(chartId).getContext('2d')
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Área',
            yAxisID: 'Area',
            data: dataArea,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Altura',
            yAxisID: 'Altura',
            data: dataAltura,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              id: 'Area',
              position: 'left',
              ticks: {
                min: 0,
              },
            },
            {
              id: 'Altura',
              position: 'right',
              ticks: {
                min: 0,
              },
            },
          ],
          y: {
            beginAtZero: true,
            min: 0,
          },
        },
      },
    })
  }
}

const dibujarGraficoCm = (chartId, res, extension) => {
  console.log(extension)
  var _data = {}
  res.forEach((item) => {
    // Compruebo la extension de fichero
    if (extension === 'rvt') {
      // Comprobar si tiene type name
      let identityData = item.properties['Identity Data']
      if (identityData !== undefined) {
        const typeName = identityData['Type Name']
        if (typeName !== undefined) {
          // Rellenamos el objeto _data
          if (_data[typeName] === undefined) _data[typeName] = []
          _data[typeName].push(item.objectid)
        }
      } else {
        identityData = item.properties['Datos de identidad']
        // Estoy trabajando en castellano
        if (identityData !== undefined) {
          const typeName = identityData['Nombre de tipo']
          if (typeName !== undefined) {
            // Rellenamos el objeto _data
            if (_data[typeName] === undefined) _data[typeName] = []
            _data[typeName].push(item.objectid)
          }
        }
      }
    } else if (extension === 'nwc') {
      let element = item.properties['Element']
      if (element !== undefined) {
        const assemblyCode = element['Name']
        if (assemblyCode !== undefined) {
          // Rellenamos el objeto _data
          if (_data[assemblyCode] === undefined) _data[assemblyCode] = []
          _data[assemblyCode].push(item.objectid)
        }
      }
    } else {
      console.error('No se reconoce la extension')
    }
  })
  var labels = Object.keys(_data)
  var data = Object.keys(_data).map((key) => _data[key].length)
  var colors = _generateColors(labels.length)
  const ctx = document.getElementById(chartId).getContext('2d')
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '# of Instances',
          data,
          backgroundColor: colors.background,
          borderColor: colors.borders,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

function autodeskCustomMenu(autodeskNode) {
  var items

  switch (autodeskNode.type) {
    case 'bucket':
      items = {
        uploadFile: {
          label: 'Upload file',
          action: function () {
            uploadFile()
          },
          icon: 'glyphicon glyphicon-cloud-upload',
        },
      }
      break
    case 'object':
      items = {
        translateFile: {
          label: 'Translate',
          action: function () {
            var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0]
            translateObject(treeNode)
          },
          icon: 'glyphicon glyphicon-eye-open',
        },
      }
      break
  }

  return items
}

function uploadFile() {
  $('#hiddenUploadField').click()
}

function translateObject(node) {
  $('#forgeViewer').empty()
  if (node == null) node = $('#appBuckets').jstree(true).get_selected(true)[0]
  var bucketKey = node.parents[0]
  var objectKey = node.id
  jQuery.post({
    url: '/api/forge/modelderivative/jobs',
    contentType: 'application/json',
    data: JSON.stringify({ bucketKey: bucketKey, objectName: objectKey }),
    success: function (res) {
      $('#forgeViewer').html(
        'Translation started! Please try again in a moment.'
      )
    },
  })
}
