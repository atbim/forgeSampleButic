const misPrimerosCheckeos = async () => {
    var _data = {}
    const dbIds = await getInstancesAsync()
    const items = await _getBulkPropertiesAsync(viewer, dbIds, [
      'Keynote',
      'Assembly Code',
    ])
    items.forEach(item => {
        const keynote = item.properties.find(x => x.displayName === 'Keynote')
        if (keynote !== undefined) {

        }
    })

    const ctx = document.getElementById('miGrafico').getContext('2d')
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Keynote', 'Assembly Code'],
        datasets: [
          {
            label: '# of Ok',
            data: [12, 19],
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            borderColor: 'rgba(0, 255, 0, 1)',
            borderWidth: 1,
          },
          {
            label: '# of Wrong',
            data: [3, 8],
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: 'rgba(255, 0, 0, 1)',
            borderWidth: 1,
          },
          {
            label: '# of Undefined',
            data: [4, 2],
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            borderColor: 'rgba(0, 0, 0, 255)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
}