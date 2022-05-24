import { get, post, destroy, patch } from './httpClient'

export const addadministrator = (body) => post('/administrator/add', body)
export const getAdminstrator = (query) => get('/administrator', query)
export const updateAdminstrator = (body, id) => patch(`/administrator/update/${id}`, body)
export const deleteAdminstrator = (id) => destroy('/administrator/delete', { administrator_id: [id] })
