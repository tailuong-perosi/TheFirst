import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

import { createFileHistory } from 'apis/action'
import { uploadFileToExport } from 'apis/upload'

const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
const fileExtension = '.xlsx'

const _createFileHistory = async (body) => {
  try {
    const res = await createFileHistory(body)
  }
  catch (e) {
    console.log(e)
  }
}

const exportToCSV = (csvData, fileName) => {
  const ws = XLSX.utils.json_to_sheet(csvData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: fileType })
  FileSaver.saveAs(data, fileName + fileExtension)

  setTimeout(async () => {
    const urls = await uploadFileToExport(data, fileName + fileExtension)
    _createFileHistory({
      action_name: 'Xuất file excel',
      file_name: fileName + fileExtension,
      type: 'EXPORT',
      property: '',
      links: [urls]
    })
  }, 400)
}
export default exportToCSV
