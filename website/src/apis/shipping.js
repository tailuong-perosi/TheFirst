import { get, patch, post, destroy } from './httpClient'

export const addShipping = (body) => post('/shipping-company/create', body)
export const getShippings = (query) => get('/shipping-company', query)
export const updateShipping = (body, id) => patch(`/shipping-company/update/${id}`, body)
export const deleteShippings = (ids) =>
  destroy('/shipping-company/delete', { shipping_company_id: ids })
export const addShippingControlWithFile = (formData, id) =>
  post('/shipping-company/compare/import', formData)
export const getShippingControlList = (query) => get('/shipping-company/compare/card', query)
export const getStatusShipping = () => get('/enum/shipping')
