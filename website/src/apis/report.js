import { get, post } from './httpClient'

export const getReportInventory = (query) => get('/report/inventory', query)
export const getReportOrder = (query) => get('/report/order', query)
export const getReportImportExportInventory = (query) =>
  get('/report/input-output-inventory', query)
export const getFinances = () => get('/report/finance')
export const addFinances = (body) => post('/report/finance/create', body)
