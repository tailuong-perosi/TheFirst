import { get, patch, post, destroy } from './httpClient'

export const getProducts = (query) => get('/product', query)
export const updateProduct = (body, id) => patch(`/product/update/${id}`, body)
export const getAttributes = (query) => get('/product/attribute', query)
export const addProduct = (body) => post('/product/create', body)
export const deleteProducts = (body) => destroy('/product/delete', body)
export const importProducts = (formData) => post('/product/file/import', formData)
export const pricesProduct = () => get('/product/unit')
export const getUnitProductEnum = () => get('/product/enum/unit-product')
