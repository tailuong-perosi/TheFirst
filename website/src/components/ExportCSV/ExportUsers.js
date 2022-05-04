import React from 'react'
import styles from './../ExportCSV/exportcsv.module.scss'
import { ToTopOutlined } from '@ant-design/icons'

import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import moment from 'moment'

export default function ExportTracking({
  fileName,
  name,
  getUsersByExportOrder,
}) {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
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
      style={{ minWidth: 130 }}
      onClick={async () => {
        const data = await getUsersByExportOrder()
        let dataExport = []
        data.map((e) => {
          if (e.is_active)
            dataExport.push({
              Username: e.username || '',
              Email: e.mail || '',
              'First Name': e.first_name || '',
              'Last Name': e.last_name || '',
              Phone: e.phone || '',
              Birthday: e.birthday || '',
              Address: e.address || '',
              Role: e.role || '',
              'Created Date': e.createdAt
                ? moment(new Date(e.createdAt)).format('YYYY-MM-DD HH:mm:ss')
                : '',
            })
        })

        exportToCSV(dataExport, fileName)
      }}
      className={styles['import_orders_title_right']}
    >
      <div className={styles['import_orders_title_left_icon']}>
        <ToTopOutlined
          style={{ fontSize: '1.25rem', color: '#2A53CD', marginTop: '0.5rem' }}
        />
      </div>
      <div style={{ color: '#2A53CD', width: 'max-content' }}>{name}</div>
    </div>
  )
}
