import { get, patch, post, destroy } from './httpClient'

export const addBusiness = (body) => post('/business/create', body)
export const updateBusiness = (body, id) => post('/business/update/' + id, body)
export const getBusinesses = (query) => get('/business', query)
export const deleteBusinesses = (body) => get('/business/delete', body)
