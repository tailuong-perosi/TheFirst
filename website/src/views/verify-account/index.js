import React, { useEffect } from 'react'
import { ROUTES } from 'consts'

import { useLocation, useHistory } from 'react-router'
import { notification, Row, Spin } from 'antd'
import { checkLink } from 'apis/auth'

export default function VerifyAccount() {
  const location = useLocation()
  const history = useHistory()

  const _checkLink = async (uid) => {
    try {
      const res = await checkLink({ UID: uid })
      console.log('res', res)
      if (res.status === 200) {
        if (res.data.success) {
          history.push({ pathname: ROUTES.OTP, state: res.data.data })
          return
        } else
          notification.error({
            message: res.data.message || 'Xác thực không thành công, vui lòng thử lại',
          })
      } else
        notification.error({
          message: res.data.message || 'Xác thực không thành công, vui lòng thử lại',
        })

      history.push(ROUTES.OVERVIEW)
    } catch (error) {
      history.push(ROUTES.OVERVIEW)
      console.log(error)
    }
  }

  useEffect(() => {
    const uid = new URLSearchParams(location.search).get('uid')

    if (!uid) history.push(ROUTES.OVERVIEW)
    else _checkLink(uid)
  }, [])

  return (
    <Row justify="center">
      <Spin size="large" />
      Đang kiểm tra tài khoản, vui lòng đợi chút!
    </Row>
  )
}
