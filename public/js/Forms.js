$(document).ready(function () {
  $('#form').submit(function (e) {
      e.preventDefault()
      const title = e.target.title.value
      const user = e.target.user.value
      const status = e.target.status.value
      const closedAt = e.target.closedAt.value
      const incidencia = {
        title,
        user,
        status,
        closedAt,
        dbIds: viewer.getSelection()
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
        }
      })
  })
})
