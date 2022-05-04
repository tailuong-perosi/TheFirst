import { get, patch, post, destroy } from './httpClient'

export const getRoles = (query) => get('/role', query)
export const updateRole = (body, id) => patch(`/role/update/${id}`, body)
export const createRole = (body) => post('/role/create', body)
export const deleteRole = (ids) => destroy('/role/delete', { role_id: ids })