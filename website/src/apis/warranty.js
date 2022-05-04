import { get, patch, post } from './httpClient'

export const getWarranties = (query) => get('/warranty', query)
export const addWarranty = (body) => post('/warranty/create', body)
export const updateWarranty = (id, data) => patch('/warranty/update/' + id, data)
