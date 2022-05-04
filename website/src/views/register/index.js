import React from 'react'
import styles from './register.module.scss'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ACTION, ROUTES } from 'consts'
import { validatePhone } from 'utils'

//background
import background from 'assets/img/bg1.jpg'
import logoRegister from 'assets/img/logoRegister.svg'

//antd
import { Row, Col, Form, Input, Button, notification, Tabs, InputNumber } from 'antd'

//apis
import { register } from 'apis/auth'

export default function Login() {
  const dispatch = useDispatch()
  let history = useHistory()
  const [formRegister] = Form.useForm()

  const _register = async (dataForm) => {
    try {
      /*check validated form*/
      const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()?])[A-Za-z\d!@#$%^&*()?]{8,}$/

      if (!regexPassword.test(dataForm.password)) {
        notification.error({
          message:
            'Mật khẩu không được chứa dấu và tối thiểu 8 ký tự, ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt',
        })
        return
      }
      if (dataForm.password !== dataForm.passwordAgain) {
        notification.error({ message: 'Mật khẩu và nhập lại mật khẩu phải giống nhau' })
        return
      }
      const phone =
        (dataForm.username + '')[0] + (dataForm.username + '')[1] === '84'
          ? '0' + (dataForm.username + '').slice(2, (dataForm.username + '').length)
          : dataForm.username + ''

      if (dataForm.username && !validatePhone(phone)) {
        notification.error({ message: 'Vui lòng nhập số điện thoại đúng định dạng' })
        return
      }
      delete dataForm.passwordAgain
      const body = {
        ...dataForm,
        avatar: '',
        business_name: dataForm.business_name,
        first_name: '',
        last_name: dataForm.business_name,
        birthday: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        company_name: '',
        company_website: '',
        tax_code: '',
        fax: '',
        branch: '',
        business_areas: '',
      }

      dispatch({ type: ACTION.LOADING, data: true })
      const res = await register(body)
      if (res.status === 200) {
        if (res.data.success) {
          if (res.data.verify_with === 'EMAIL') {
            notification.info({ message: 'Vui lòng kiểm tra email để lấy link xác thực tài khoản' })
          } else {
            notification.info({ message: 'Mã otp đã được gửi về số điện thoại của bạn' })
            history.push({ pathname: ROUTES.OTP, state: res.data.data })
          }
        } else
          notification.error({
            message: res.data.message || 'Đăng kí không thành công, vui lòng thử lại',
          })
      } else
        notification.error({
          message: res.data.message || 'Đăng kí không thành công, vui lòng thử lại',
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  return (
    <Row className={styles['registration']}>
      <img src={background} alt="background" />
      <div className={styles['registration-content']}>
        <Tabs className="tabs-login" size="large" activeKey="register" centered>
          <Tabs.TabPane
            tab={
              <div className={styles['registration-content-container']}>
                <div className={styles['registration-content--logo']}>
                  <img style={{ maxWidth: 120, maxHeight: 120 }} src={logoRegister} alt="logo" />
                </div>
                <h2>Đăng ký tài khoản miễn phí</h2>
                <h2>để bắt đầu bán hàng</h2>
              </div>
            }
            key="register"
          >
            <div className={styles['registration-content-container']}>
              <div className={styles['registration-content--form']}>
                <Form layout="vertical" form={formRegister} onFinish={_register}>
                  <Row className="edit-form-item-register" gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        name="business_name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
                      >
                        <Input
                          allowClear
                          style={{ width: '60%' }}
                          size="large"
                          placeholder="Nhập tên doanh nghiệp"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                      >
                        <Input
                          type="number"
                          allowClear
                          style={{ width: '60%' }}
                          size="large"
                          placeholder="Nhập số điện thoại"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        rules={[
                          { type: 'email', message: 'Vui lòng nhập Email đúng định dạng!' },
                          { required: true, message: 'Vui lòng nhập email' },
                        ]}
                        name="email"
                      >
                        <Input
                          allowClear
                          size="large"
                          placeholder="Nhập email"
                          style={{ width: '60%' }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                      >
                        <Input.Password
                          allowClear
                          style={{ width: '60%' }}
                          size="large"
                          type="password"
                          placeholder="Mật khẩu"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item
                        name="passwordAgain"
                        rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu' }]}
                      >
                        <Input.Password
                          allowClear
                          style={{ width: '60%' }}
                          size="large"
                          type="password"
                          placeholder="Nhập lại mật khẩu"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Row justify="end">
                        <div
                          style={{
                            color: 'white',
                            cursor: 'pointer',
                            marginTop: 10,
                            marginRight: '20%',
                          }}
                          onClick={() => history.push(ROUTES.CHECK_SUBDOMAIN)}
                        >
                          Đi đến trang đăng nhập
                        </div>
                      </Row>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className={styles['btn-registration']}
                        >
                          Đăng ký
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Row>
  )
}
