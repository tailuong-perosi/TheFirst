import { get, patch, post, destroy } from './httpClient'

export const getOrdersImportInventory = (params) => get('/inventory/import', params)
export const updateOrderImportInventory = (body, id) =>
  patch('/inventory/import/update/' + id, body)
export const createOrderImportInventory = (body) => post('/inventory/import/create', body)
export const deleteOrderImportInventory = (id) =>
  destroy('/inventory/import/delete', { order_id: [id] })
export const uploadOrdersImportInventory = (formData) =>
  post('/inventory/import/create/file', formData)
export const getStatusOrderImportInventory = () => get('/enum/importorder')

export const getCheckInventoryNote = (params) => get('/inventory/inventory-note', params)
export const createCheckInventoryNote = (body) => post('/inventory/inventory-note/create', body)
export const importCheckInventoryNote = (formData) =>
  post('/inventory/inventory-note/create/file', formData)
export const updateCheckInventoryNote = (body, id) =>
  patch('/inventory/inventory-note/update/' + id, body)
