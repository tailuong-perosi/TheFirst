import { get, patch, post, destroy } from './httpClient'

export const getBlogs = (query) => get('/blog', query)
export const createBlog = (body) => post('/blog/create', body)
export const updateBlog = (id, body) => patch(`/blog/update/${id}`, body)
export const deleteBlog = (id) => destroy('/blog/delete', id)
