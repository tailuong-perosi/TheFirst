import { get, patch, post, destroy } from './httpClient'

export const addSupplier = (body) => post('/supplier/create', body)
export const getSuppliers = (query) => get('/supplier', query)
export const updateSupplier = (body, id) => patch(`/supplier/update/${id}`, body)
// export const deleteSupplier = (id) => patch('/supplier/delete', { supplier_id: [id] })
export const deleteSupplier = (id) => destroy('/supplier/delete', {supplier_id: [id]})
