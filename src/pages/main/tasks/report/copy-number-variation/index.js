export const columns = [
    { key: 'Chr', title: 'Chr', dataIndex: 'Chr', align: 'center', width: 50 },
    { key: 'Start', title: 'Start', dataIndex: 'Start', align: 'center', width: 80 },
    { key: 'End', title: 'End', dataIndex: 'End', align: 'center', width: 80 },
    { key: 'Type', title: 'Type', dataIndex: 'Type', align: 'center', width: 50 },
    { key: 'Gene', title: 'Gene', dataIndex: 'Gene', align: 'center', width: 50 },
    {
        key: 'Copys',
        title: 'Copys',
        dataIndex: 'Copys',
        align: 'center',
        width: 50,
        sorter: (r1, r2) => r1.Copys - r2.Copys,
    },
    { key: 'Rank', title: 'Rank', dataIndex: 'Rank', align: 'center', width: 50 },
    { key: 'Phenotypes', title: 'Phenotypes', dataIndex: 'Phenotypes', align: 'left', width: 200 },
    { key: 'Drugs', title: 'Drugs', dataIndex: 'Drugs', align: 'center', width: 80 },
]
export const pieOption = {
  tooltip: {
    trigger: 'item',
  },
  legend: {
    show: false,
    top: '5%',
    left: 'center',
  },
  series: [
    {
      type: 'pie',
      radius: ['70%', '78%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 1,
      },
      label: {
        show: true,
        position: 'outside',
        padding: 0,
        lineHeight: 2,
      },
      tooltip: {
        position: 'top',
        textStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        formatter: (param) => {
          return `${param.data.name}: ${param.data.value}bp`
        },
      },
      emphasis: {
        label: {
          show: false,
          fontSize: '40',
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: true,
      },
      data: [],
    },
    {
      type: 'pie',
      radius: ['55%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 3,
        borderColor: '#fff',
        borderWidth: 1,
        color: (object) => {
          return object.data.ratio ? 'red' : '#f0f0f5'
        },
      },
      label: {
        show: false,
        position: 'outside',
        padding: 0,
        lineHeight: 2,
      },
      tooltip: {
        position: 'top',
        textStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        formatter: (param) => {
          return param.data.ratio
            ? `${param.data.name}: ${param.data.start}-${param.data.end} ${param.data.ratio}拷贝`
            : null
        },
      },
      emphasis: {
        label: {
          show: false,
          position: 'center',
          fontSize: '28',
          fontWeight: 'bold',
          formatter: (param) => {
            const ratio = param.data.ratio || ''
            return param.data.ratio ? `${param.data.name}: ${ratio}` : null
          },
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
    {
      type: 'pie',
      radius: ['47%', '52%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 2,
        borderColor: '#fff',
        borderWidth: 1,
        color: (object) => {
          return object.data.ratio ? 'green' : '#f0f0f5'
        },
      },
      label: {
        show: false,
        position: 'outside',
        padding: 0,
        lineHeight: 2,
      },
      tooltip: {
        position: 'top',
        textStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        formatter: (param) => {
          return param.data.ratio
            ? `${param.data.name}: ${param.data.start}-${param.data.end} ${param.data.ratio}拷贝`
            : null
        },
      },
      emphasis: {
        label: {
          show: false,
          position: 'center',
          fontSize: '28',
          fontWeight: 'bold',
          formatter: (param) => {
            const ratio = param.data.ratio || ''
            return param.data.ratio ? `${param.data.name}: ${ratio}` : ''
          },
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
  ],
}
