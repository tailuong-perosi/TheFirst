import { get, post, patch } from './httpClient'

export const checkDomain = (prefix) => post('/appinfo/checkdomain', { prefix })
export const getBusinesses = (query) => get('/business', query)
export const updateBusinesses = (body, id) => patch('/business/update/' + id, body)
