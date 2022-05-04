import axios from 'axios'
import { stringify } from 'querystring'
export const FetchAPI = async (
  path,
  method,
  headers,
  body,
  endpoint = process.env.REACT_APP_API_ENDPOINT_DEV
) => {
  const defaultHeaders = {
    'Content-type': 'application/json',
    Authorization: localStorage.getItem('accessToken'),
  }
  if (typeof headers === 'object') Object.assign(defaultHeaders, headers)

  try {
    return await axios({ url: endpoint + path, method, headers: defaultHeaders, data: body })
  } catch (error) {
    if (error.response && error.response.status !== 401) {
      return error.response
    }
    return {
      status: 401,
    }
  }
}
export const get = (path, query = {}, headers = {}, endpoint) =>
  FetchAPI(`${path}?${stringify(query)}`, 'GET', headers, null, endpoint)
export const post = (path, body, headers, endpoint) =>
  FetchAPI(path, 'POST', headers, body, endpoint)
export const patch = (path, body, headers, endpoint) =>
  FetchAPI(path, 'PATCH', headers, body, endpoint)
export const destroy = (path, body, headers, endpoint) =>
  FetchAPI(path, 'DELETE', headers, body, endpoint)
