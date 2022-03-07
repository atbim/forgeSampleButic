class ExtraDataExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options)
    this._group = null
    this._button = null
    this._buttonDp = null
    this._panel = null
    this._panelDp = null
  }

  load() {
    console.log('ExtraDataExtension has been loaded')
    return true
  }

  unload() {
    // Clean our UI elements if we added any
    if (this._group) {
      this._group.removeControl(this._button)
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group)
      }
    }
    console.log('ExtraDataExtension has been unloaded')
    return true
  }

  onToolbarCreated() {
    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl(
      'allMyAwesomeExtensionsToolbar'
    )
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup(
        'allMyAwesomeExtensionsToolbar'
      )
      this.viewer.toolbar.addControl(this._group)
    }

    // Add a new button to the toolbar group
    this._button = new Autodesk.Viewing.UI.Button('ExtraDataExtensionButton')
    var _this = this
    this._button.onClick = (ev) => {
      // Execute an action here
      // Check if the panel is created or not
      if (this._panel == null) {
        this._panel = new ModelSummaryPanel(
          this.viewer,
          this.viewer.container,
          'modelSummaryPanel',
          'Mi Primer Panel'
        )
      }
      // Show/hide docking panel
      this._panel.setVisible(!this._panel.isVisible())

      // If panel is NOT visible, exit the function
      if (!this._panel.isVisible()) return

      viewer.addEventListener(
        Autodesk.Viewing.SELECTION_CHANGED_EVENT,
        async (ev) => {
          const dbIds = ev.dbIdArray
          if (dbIds.length === 1) {
            const dbId = dbIds[0]
            // Recoger el valor de Keynote
            const result = await getPropertiesAsync(dbId)
            const keynoteParameter = result.properties.find(
              (x) => x.displayName === 'Keynote'
            )
            if (
              keynoteParameter !== undefined &&
              keynoteParameter.displayValue !== ''
            ) {
              _this._panel.removeAllProperties()
              _this._panel.addProperty(
                keynoteParameter.displayName,
                keynoteParameter.displayValue,
                keynoteParameter.displayCategory
              )
              // Llamar al servidor con el valor del Keynote
              const keynote = keynoteParameter.displayValue
              $.ajax({
                url: '/api/forge/extradata/' + keynote,
                processData: false,
                contentType: 'application/json',
                type: 'GET',
                success: function (res) {
                  console.log(res)
                  // Con la respuesta añadir todas las propiedades con un forEach
                  res.data.info.forEach((item) => {
                    _this._panel.addProperty(
                      item.displayName,
                      item.displayValue,
                      'Extra Data'
                    )
                  })
                },
                error: function (err) {
                  console.error(err)
                },
              })
            } else {
              _this._panel.showNoProperties()
            }
          } else {
          }
        }
      )
    }
    this._button.setToolTip('Extra Data Extension')
    this._button.addClass('extraDataExtensionIcon')

    this._buttonDp = new Autodesk.Viewing.UI.Button('dpButton')
    this._buttonDp.onClick = (ev) => {
      // Execute an action here
      // Check if the panel is created or not
      if (this._panelDp == null) {
        this._panelDp = new MiPrimerDockingPanel(
          this.viewer,
          this.viewer.container,
          'miDockingPanel',
          'Mi Primer Docking Panel'
        )
      }
      // Show/hide docking panel
      this._panelDp.setVisible(!this._panelDp.isVisible())

      // If panel is NOT visible, exit the function
      if (!this._panelDp.isVisible()) return
    }
    this._buttonDp.setToolTip('Docking Panel Extension')
    this._buttonDp.addClass('myAwesomeExtensionIcon')

    this._group.addControl(this._button)
    this._group.addControl(this._buttonDp)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'ExtraDataExtension',
  ExtraDataExtension
)

class ModelSummaryPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options)
    this.viewer = viewer
  }
}

class MiPrimerDockingPanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options)
    this.viewer = viewer

    this.container.classList.add('docking-panel-container-solid-color-a')
    this.container.style.top = '10px'
    this.container.style.left = '10px'
    this.container.style.width = 'auto'
    this.container.style.height = 'auto'
    this.container.style.resize = 'auto'

    this.createTitleBar(title)

    var div = document.createElement('div')
    div.setAttribute('id', 'testPaneladsfsaf')
    div.innerHTML = `Hola Mundo!!!`
    this.container.appendChild(div)
  }
}
