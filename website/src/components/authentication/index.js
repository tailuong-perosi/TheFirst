import React, { cloneElement } from 'react'
import { Redirect } from 'react-router-dom'
import { ROUTES } from 'consts'
import jwt_decode from 'jwt-decode'

/**
 *
 * @param {Object} props
 * @param {Array<String>} props.permissions
 * @param {React.ReactChildren} props.children
 */
const Authentication = ({ permissions, title, children, ...props }) => {
  const payload =
    localStorage.getItem('accessToken') && jwt_decode(localStorage.getItem('accessToken'))

  //modify title
  document.title = title

  //check đã đăng nhập chưa hoặc token còn hạn -> vào trang home
  if (payload) return cloneElement(children, props)

  //check login ?
  if (!payload) return <Redirect to={ROUTES.LOGIN} />

  return <div />
}

export default Authentication
