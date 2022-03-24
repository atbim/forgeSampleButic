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
      {
        extensions: [
          'Autodesk.DocumentBrowser',
          'MyAwesomeExtension',
          'ExtraDataExtension',
        ],
      }
    )
    viewer.start()
    var documentId = 'urn:' + urn
    Autodesk.Viewing.Document.load(
      documentId,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    )
  })
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry()
  viewer.loadDocumentNode(doc, viewables).then((i) => {
    // documented loaded, any action?
    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (ev) => {
      

      // Mostrar información de extradata
      if (dbIds.length === 1) {
        //getExtradaData(dbIds[0])
      }
    })
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (ev) => {
      getOpenIncidencias()
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
