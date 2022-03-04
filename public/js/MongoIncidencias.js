var _idIncidencia

$(document).ready(function () {
  $('#actualizarIncidenciaButton').hide()

  $('#cancelarIncidenciaButton').click(() => {
    _idIncidencia = ''
    const form = $('.f')[0]
    const formType = form.getAttribute('id')
    console.log(formType)
    if (formType === 'crearIncidencia') {
      resetForm('crearIncidencia')
    } else {
      resetForm('actualizarIncidencia')
      $('#guardarIncidenciaButton').show()
      $('#actualizarIncidenciaButton').hide()
      $('#actualizarIncidencia').attr('id', 'crearIncidencia')
    }
  })
  // Me suscribo al evento click a los objetos de dentro del ID listaIncidencias que tengan la clase .incidencia
  $('#listaIncidencias').on('click', '.incidencia', (e) => {
    const id = e.target.getAttribute('id')
    _idIncidencia = id
    const rojo = new THREE.Vector4(1, 0, 0, 1)
    $.ajax({
      url: '/api/forge/incidencias/' + id,
      processData: false,
      contentType: 'application/json',
      type: 'GET',
      success: function (res) {
        const {
          user,
          title,
          dbIds,
          status,
          assignedTo,
          closedAt,
          description,
        } = res.data
        viewer.select(dbIds)
        viewer.isolate(dbIds)
        viewer.fitToView(dbIds)
        viewer2.clearThemingColors()
        dbIds.forEach((dbId) => {
          viewer2.setThemingColor(dbId, rojo)
        })

        // Rellnear los inputs con el data del servidor
        $('#user').val(user)
        $('#title').val(title)
        $('#status').val(status)
        $('#assignedTo').val(assignedTo)
        var date = new Date(closedAt)
        var day = ('0' + date.getDate()).slice(-2)
        var month = ('0' + (date.getMonth() + 1)).slice(-2)
        var today = date.getFullYear() + '-' + month + '-' + day
        $('#closedAt').val(today)
        $('#description').val(description)

        $('#guardarIncidenciaButton').hide()
        $('#actualizarIncidenciaButton').show()
        $('#crearIncidencia').attr('id', 'actualizarIncidencia')
      },
      error: function (err) {
        console.error(err)
      },
    })
  })

  $('#crearIncidencia').submit((e) => {
    e.preventDefault()
    const formType = e.target.getAttribute('id')
    
    if (viewer !== undefined) {
      if (formType === 'crearIncidencia') {
        const title = e.target.title.value
        const user = e.target.user.value
        const status = e.target.status.value
        const closedAt = e.target.closedAt.value
        const assignedTo = e.target.assignedTo.value
        const description = e.target.description.value
        const dbIds = viewer.getSelection()
        const incidencia = {
          title,
          user,
          status,
          closedAt,
          dbIds,
          assignedTo,
          description,
        }
        $.ajax({
          url: '/api/forge/incidencias',
          data: JSON.stringify(incidencia),
          processData: false,
          contentType: 'application/json',
          type: 'POST',
          success: function (res) {
            resetForm('crearIncidencia')
            getOpenIncidencias()
          },
          error: function (err) {
            console.error(err)
          },
        })
      } else {
        // Asumo que así será actualizr incidencia
        const title = e.target.title.value
        const user = e.target.user.value
        const status = e.target.status.value
        const closedAt = e.target.closedAt.value
        const assignedTo = e.target.assignedTo.value
        const description = e.target.description.value
        const dbIds = viewer.getSelection()
        const incidencia = {
          title,
          user,
          status,
          closedAt,
          dbIds,
          assignedTo,
          description,
        }
        $.ajax({
          url: '/api/forge/incidencias/' + _idIncidencia,
          data: JSON.stringify(incidencia),
          processData: false,
          contentType: 'application/json',
          type: 'PATCH',
          success: async function (res) {
            _idIncidencia = ''
            $('#guardarIncidenciaButton').show()
            $('#actualizarIncidenciaButton').hide()
            resetForm('actualizarIncidencia')
            $('#actualizarIncidencia').attr('id', 'crearIncidencia')
            getOpenIncidencias()
          },
          error: function (err) {
            console.error(err)
          },
        })
      }
    }
  })
})

const getOpenIncidenciasAsync = (status) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/forge/incidencias/status?status=' + status,
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

const getOpenIncidencias = async () => {
  const incidencias = await getOpenIncidenciasAsync('Open')
  $('#listaIncidencias').empty()
  incidencias.data.forEach((incidencia) => {
    $('#listaIncidencias').append(
      `<li id="${incidencia._id}" class="list-group-item incidencia">${incidencia.title}</li>`
    )
  })
}

const resetForm = (id) => {
  $(`#${id}`).trigger('reset')
}

const getExtradaData = async (dbId) => {
  const res = await getPropertiesAsync(dbId)
  const keynoteParameter = res.properties.find(x => x.displayName === 'Keynote')
  if (keynoteParameter !== undefined) {
    const keynote = keynoteParameter.displayValue
    $.ajax({
      url: '/api/forge/extradata/' + keynote,
      processData: false,
      contentType: 'application/json',
      type: 'GET',
      success: function (res) {
        console.log(res.data.info)
      },
      error: function (err) {
        console.error(err)
      },
    })
  }
}
