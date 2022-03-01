var viewer
var viewer2

function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken,
  }

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(
      document.getElementById('forgeViewer'),
      { extensions: ['Autodesk.DocumentBrowser'] }
    )
    viewer2 = new Autodesk.Viewing.GuiViewer3D(
      document.getElementById('forgeViewer2'),
      { extensions: ['Autodesk.DocumentBrowser'] }
    )
    viewer.start()
    viewer2.start()
    var documentId = 'urn:' + urn
    Autodesk.Viewing.Document.load(
      documentId,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    )
  })
}

function onDocumentLoadSuccess2(doc) {
  var viewables = doc.getRoot().getDefaultGeometry()
  viewer2.loadDocumentNode(doc, viewables).then((i) => {
    // documented loaded, any action?
  })
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry()
  const viewables2 = doc.getRoot().getSheetNodes()[0]
  viewer2.loadDocumentNode(doc, viewables2).then((i) => {
    // documented loaded, any action?
    viewer2.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (ev) => {
      const dbIds = ev.dbIdArray
      viewer.isolate(dbIds)
      viewer.fitToView(dbIds)
    })
  })
  viewer.loadDocumentNode(doc, viewables).then((i) => {
    // documented loaded, any action?
    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (ev) => {
      var dbIds = ev.dbIdArray
      $('#nObjectos').text(`${dbIds.length} Objectos seleccionados`)
      datosSeleccion(dbIds)
    })
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (ev) => {
      //alert('Modelo Cargado!!!')
    })
  })
}

function onDocumentLoadFailure(viewerErrorCode, viewerErrorMsg) {
  console.error(
    'onDocumentLoadFailure() - errorCode:' +
      viewerErrorCode +
      '\n- errorMessage:' +
      viewerErrorMsg
  )
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then((res) => {
    res.json().then((data) => {
      callback(data.access_token, data.expires_in)
    })
  })
}
