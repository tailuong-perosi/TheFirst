import { get, patch, post, destroy } from './httpClient'

export const getBrands = (params) => get('/brand', params)
export const createBrand = (body) => post('/brand/create', body)
export const updateBrand = (id, body) => patch(`/brand/update/${id}`, body)
export const deleteBrand = (id) => destroy('/brand/delete', id)
