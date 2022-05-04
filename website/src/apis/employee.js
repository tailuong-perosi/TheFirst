import { get, post, destroy, patch } from './httpClient'

export const addEmployee = (body) => post('/user/create', body)
export const getEmployees = (query) => get('/user', query)
export const updateEmployee = (body, id) => patch(`/user/update/${id}`, body)
export const deleteEmployee = (id) => destroy('/user/delete', { user_id: [id] })
