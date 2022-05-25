import { get, post, destroy, patch } from './httpClient'

export const addMenu = (body) => post('/menu/create', body)
export const getMenu = (query) => get('/menu', query)
export const updateMenu = (body, id) => patch(`/menu/update/${id}`, body)
export const deleteMenu = (id) => destroy('/menu/delete', { menu_id: [id] })