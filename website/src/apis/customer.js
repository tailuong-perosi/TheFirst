import { get, patch, post, destroy } from './httpClient'

export const getCustomerTypes = (query) => get('/customer/type', query)
export const addCustomerType = (body) => post('/customer/type/create', body)
export const getCustomers = (query) => get('/customer', query)
export const addCustomer = (body) => post('/customer/create', body)
export const deleteCustomer = (id) => destroy('/customer/delete', { customer_id: [id] })
export const updateCustomer = (id, body) => patch('/customer/update/' + id, body)
export const importCustomers = (formData) => post('/customer/create/file', formData)
