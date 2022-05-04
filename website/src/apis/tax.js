import { get, patch, post, destroy } from './httpClient'

export const addTax = (body) => post('/tax/create', body)
export const getTaxs = (query) => get('/tax', query)
export const updateTax = (body, id) => patch(`/tax/update/${id}`, body)
export const deleteTax = (body) => destroy(`/tax/delete`, body)
