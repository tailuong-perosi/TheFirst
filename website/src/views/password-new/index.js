import React, { useEffect } from 'react'
import styles from './password-new.module.scss'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ACTION, ROUTES } from 'consts/index'
import jwt_decode from 'jwt-decode'

//antd
import { Form, Input, Button, notification, Row, Col } from 'antd'

//icons
import { LockOutlined } from '@ant-design/icons'
import background from 'assets/img/bg1.jpg'

//apis
import { resetPassword } from 'apis/auth'
import delay from 'delay'

export default function PasswordNew() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [form] = Form.useForm()
  let history = useHistory()

  var username = location.state && location.state.username

  const _changePassword = async (dataForm) => {
    try {
      if (dataForm.password !== dataForm.passwordAgain) {
        notification.warning({ message: 'Nhập lại mật khẩu không chính xác' })
        return
      }

      dispatch({ type: ACTION.LOADING, data: true })

      const body = { ...dataForm, username: username }
      delete body.passwordAgain
      const res = await resetPassword(body)
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Thay đổi mật khẩu thành công' })
          const dataUser = jwt_decode(res.data.data.accessToken)
          await delay(300)
          window.location.href = `https://${dataUser.data._business.prefix}.${process.env.REACT_APP_HOST}/login`
        } else
          notification.error({
            message: res.data.message || 'Thay đổi mật khẩu không thành công, vui lòng thử lại',
          })
      } else
        notification.error({
          message: res.data.message || 'Thay đổi mật khẩu không thành công, vui lòng thử lại',
        })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  useEffect(() => {
    if (!location.state) history.push(ROUTES.LOGIN)
  }, [])

  return (
    <Row align="middle" className={styles['pw-new-container']}>
      <img
        src={background}
        style={{
          width: '100%',
          height: '100vh',
        }}
        alt=""
      />
      <Col xs={24} sm={24} md={24} lg={24} xl={10} className={styles['pw-new-content']}>
        <div>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Tạo mật khẩu mới
          </h2>
          <Form
            style={{ paddingLeft: '10%', paddingRight: '10%' }}
            layout="vertical"
            form={form}
            onFinish={_changePassword}
          >
            <Form.Item
              label={<div style={{ color: 'white' }}>Nhập mật khẩu mới</div>}
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
            >
              <Input.Password
                className={styles['input']}
                size="large"
                prefix={<LockOutlined />}
                type="password"
                placeholder="Mật khẩu mới"
              />
            </Form.Item>
            <Form.Item
              label={<div style={{ color: 'white' }}>Nhập lại mật khẩu mới</div>}
              name="passwordAgain"
              rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu mới' }]}
            >
              <Input.Password
                className={styles['input']}
                size="large"
                prefix={<LockOutlined />}
                type="password"
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>
            <Row justify="center">
              <Form.Item>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  className={styles['pw-new-button']}
                >
                  Thay đổi mật khẩu
                </Button>
              </Form.Item>
            </Row>
            {/* <Row justify="end">
              <Link to={ROUTES.LOGIN} style={{ color: 'white' }}>
                Quay về đăng nhập
              </Link>
            </Row> */}
          </Form>
        </div>
      </Col>
    </Row>
  )
}
