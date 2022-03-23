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
                `<canvas id="${id}" width="400" height="400"></canvas>`
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
