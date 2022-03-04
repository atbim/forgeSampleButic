$(document).ready(function () {
  $('#crearIncidencia').submit((e) => {
    e.preventDefault()
    if (viewer !== undefined) {
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
          console.log(res)
        },
        error: function (err) {
          console.error(err)
        },
      })
    }
  })
})

const getOpenIncidencias = (status) => {
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
