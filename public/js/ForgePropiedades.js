const getInstancesAsync = () => {
    return new Promise((resolve, reject) => {
        getAllLeafComponents(viewer, res => {
            resolve(res)
        })
    })
}

const getPropertiesAsync = (dbId) => {
    return new Promise((resolve, reject) => {
        viewer.getProperties(dbId, res => {
            resolve(res)
        }, err => {
            reject(err)
        })
    })
}

const getPropValues = async (displayName) => {
    const dbIds = await getInstancesAsync()
    const array = []
    for (const dbId of dbIds) {
        const result = await getPropertiesAsync(dbId)
        const propiedad = result.properties.find(x => x.displayName === displayName)
        // Comprobamos si existe la propiedad en el ejemplar y si no está en blanco
        if (propiedad !== undefined && propiedad.displayValue !== '') {
            array.push(propiedad.displayValue)
        }
    }
    
    const uniques = array.filter(onlyUnique)
    // Rellenar la lista en la UI
    $('#lista').empty()
    uniques.forEach(unique => {
        $('#lista').append(`<li class="list-group-item">${unique}</li>`)
    })
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

