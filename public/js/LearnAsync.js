const alumnos = [
  {
    id: 1,
    name: 'Adrian',
    company: 'atbim',
  },
  {
    id: 2,
    name: 'Victor',
    company: 'FCC',
  },
  {
    id: 3,
    name: 'Guillermo',
    company: 'Ineco',
  },
  {
    id: 4,
    name: 'Juanra',
    company: 'FCC',
  },
]

const getAlumnosAsync = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const array = []
      alumnos.forEach((alumno) => {
        array.push(alumno)
      })
      resolve(array)
    }, 3000)
  })
}

const getAlumnos = async () => {
  const array = await getAlumnosAsync()
  console.log(array)
}