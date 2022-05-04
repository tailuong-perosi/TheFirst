import { get } from './httpClient'

export const getDistricts = (query) => get('/address/district', query)
export const getProvinces = (query) => get('/address/province', query)
export const getWards = (query) => get('/address/ward', query)
export const getCountries = (query) => get('/address/country', query)
