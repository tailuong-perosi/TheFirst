import React from 'react'
import styles from './exportcsv.module.scss'
import { Button } from 'antd'
import { FileExcelOutlined } from '@ant-design/icons'

import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

export const ExportCSV = ({ csvData, fileName, name }) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const exportToCSV = (csvData, fileName, name) => {
    const ws = XLSX.utils.json_to_sheet(csvData)
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + fileExtension)
  }

  return (
    <div
      //   key={index}
      onClick={(e) => exportToCSV(csvData, fileName)}
      className={styles['import_orders_title_right']}
    >
      <Button
        icon={<FileExcelOutlined />}
        style={{
          width: '7.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#008816',
        }}
        type="primary"
      >
        Xuất excel
      </Button>
    </div>
  )
}
