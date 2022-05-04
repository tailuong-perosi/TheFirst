import { get, patch, post, destroy } from './httpClient'

export const getTransportOrders = (query) => get('/inventory/transport', query)
export const addTransportOrder = (body) => post('/inventory/transport/create', body)
export const deleteTransportOrder = (id) =>
  destroy('/inventory/transport/delete', { order_id: [id] })
export const updateTransportOrder = (body, id) => patch('/inventory/transport/update/' + id, body)
export const getStatusTransportOrder = () => get('/enum/transportorder')
export const addTransportOrderWithFile = (formData) =>
  post('/inventory/transport/create/file', formData)
