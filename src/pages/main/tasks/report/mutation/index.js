export const useCustomCell = (columnName) => {
    return (record, rowIndex, column) => {
        return {
            // 自定义属性，也就是官方文档中的props，可通过条件来控制样式
            style: {
                // 'font-weight': record.id === currentRow.value.id ? 'bolder' : 'normal',
                // 'background-color': record[columnName] === 'Y' ? '#1976d2' : '',
                'background-color': (record[columnName] === 'Y' && column.key !== 'operation') ? 'orange' : '',
                // cursor: 'pointer',
            },
            // 鼠标单击行
            onClick: (event) => {
            },
        }
    }
}
