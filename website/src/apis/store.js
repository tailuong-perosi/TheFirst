import { get, patch, post } from './httpClient'

export const getAllStore = (query) => get('/store', query)
export const addStore = (body) => post('/store/create', body)
export const updateStore = (body, id) => patch(`/store/update/${id}`, body)
