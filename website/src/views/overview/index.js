import React, { useState } from 'react'
import styles from './overview.module.scss'
import { ACTION, ROUTES } from 'consts'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { uploadFile } from 'apis/upload'

//antd
import { Row, Col, notification, Form, Input, Button, Upload, Steps, Result } from 'antd'

//icons antd
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import { useStepsForm } from 'sunflower-antd';
//apis

import { addBusiness, verify, getOtp } from 'apis/business'






function Overview() {

  const dispatch = useDispatch()
  const { Step } = Steps;
  let location = useLocation()
  const [loading, setLoading] = useState(false)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [loading3, setLoading3] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [image, setImage] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [valuesdata, setValuesdata] = useState('')

  const layout = {
    labelCol: { span: 50 },
    wrapperCol: { span: 50 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const item1 = {
    labelCol: { span: 7 },
    wrapperCol: { span: 8 }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notification.warning({ message: 'Bạn chỉ có thể tải lên tệp JPG / PNG / JPEG!' });
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notification.warning({ message: 'Hình ảnh phải có kích thước nhỏ hơn 2MB!' });
    }
    return isJpgOrPng && isLt2M;
  }

  const _upload = async (file) => {
    try {
      setLoading(true)
      const url = await uploadFile(file)
      console.log(url)
      setAvatar(url || '')
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const _upload1 = async (file) => {
    try {
      setLoading1(true)
      const url = await uploadFile(file)
      console.log(url)
      setImage(url || '')
      setLoading1(false)
    } catch (error) {
      setLoading1(false)
    }
  }

  const _upload2 = async (file) => {
    try {
      setLoading2(true)
      const url = await uploadFile(file)
      console.log(url)
      setImage1(url || '')
      setLoading2(false)
    } catch (error) {
      setLoading2(false)
    }
  }
  const _upload3 = async (file) => {
    try {
      setLoading3(true)
      const url = await uploadFile(file)
      console.log(url)
      setImage2(url || '')
      setLoading3(false)
    } catch (error) {
      setLoading3(false)
    }
  }

  const _verifyAccount = async () => {
    try {
      await form.validateFields()
      dispatch({ type: ACTION.LOADING, data: true })
      const dataForm = form.getFieldsValue()
      var body = { company_phone: valuesdata.company_phone, otp_code: dataForm.otp }
      const res = await verify(body)
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xác thực otp thành công' })
          gotoStep(current + 1);
          dispatch({ type: ACTION.LOGIN, data: res.data.data })


        } else
          notification.warning({
            message:
              res.data.message ||
              `Xác thực OTP thất bại, vui lòng bấm vào 'Gửi lại OTP' để thử lại`,
          })
      } else
        notification.warning({
          message:
            res.data.message || `Xác thực OTP thất bại, vui lòng bấm vào 'Gửi lại OTP' để thử lại`,
        })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }
  const _resendOtp = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getOtp(valuesdata.company_phone)
      if (res.status === 200) {
        if (res.data.success)
          notification.success({ message: 'Gửi lại otp thành công, vui lòng kiểm tra lại' })
        else notification.error({ message: 'Gửi lại otp thất bại, vui lòng thử lại' })
      } else notification.error({ message: 'Gửi lại otp thất bại, vui lòng thử lại' })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const {
    form,
    current,
    gotoStep,
    stepsProps,
    formProps,
    submit,
    formLoading,
  } = useStepsForm({
    async submit(values) {
      setValuesdata(values);
      await new Promise(r => setTimeout(r, 1000));
      return 'ok';
    },
  });
  console.log(valuesdata);
  const _addBusiness = async () => {
    try {
      const body = {
        logo: avatar,
        business_name: valuesdata.business_name,
        first_name: '',
        last_name: valuesdata.business_name,
        company_phone: valuesdata.company_phone,
        birthday: '',
        address: valuesdata.company_address,
        company_website: valuesdata.company_website,
        ward: '',
        district: '',
        province: '',
        company_name: '',
        career_id: valuesdata.career,
        CMND_CCCD: valuesdata.SoCMND,
        CMNDimage: image,
        Business_Registration: valuesdata.Business_Registration,
        BRimage: image1,
        tax_code: valuesdata.tax_code,
        tax_codeimage: image2,
        fax: '',
        branch: '',
        business_areas: '',
      }
      console.log('vao data');
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await addBusiness(body)
      if (res.status === 200) {
        if (res.data.success) {
          notification.info({ message: 'Mã otp đã được gửi về số điện thoại của bạn' })
          // history.push({ pathname: ROUTES.OTP, state: res.data.data })
          gotoStep(current + 1);
        }
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

  const formList = [
    <div id='HDSD' style={{ marginTop: 5, marginLeft: 2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>
      <h1 style={{ marginTop: 100 }}>Để tạo cửa hàng thành công vui lòng hoàn thành 2 bước sau: </h1>
      <h1>1. Thông tin cửa hàng</h1>
      <h1>2. Xác thực thông tin </h1><br></br>
      <h1>- Ứng với mỗi tài khoản Ekata chỉ có thể tạo được 1 cửa hàng</h1>
      <h1>- Từ cửa hàng thứ 2 trở đi, bạn vui lòng đăng ký thêm số điện thoại(khác số điện thoại đăng nhập, chưa được đăng ký tài khoản Ekata) để thực hện mở của hàng</h1>
      <h1>Dữ liệu của cửa hàng nếu chưa được hoàn thành xác thực thông tin thì chỉ có thể tồn tại tối đa 60 ngày(kể từ ngày ghi nhận giao dịch cuối cùng của cửa hàng đó)</h1>
      <Form.Item {...tailLayout} style={{ marginTop: 100 }}>
        <Button type='primary' onClick={() => gotoStep(current + 1)}>Next</Button>
      </Form.Item>
    </div>,
    <Row >
      <div id='TTCH' style={{ marginTop: 5, marginLeft: 2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']} >
        <>
          <Col >
            <Form.Item label="Tên cửa hàng" name="business_name" {...item1}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên cửa hàng!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Số điện thoại" name="company_phone" {...item1}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                {
                  pattern: new RegExp(/([+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/),
                  message: 'Vui lòng nhập số điện thoại đúng định dạng',
                },
              ]}
            >
              <Input />
            </Form.Item >
          </Col>
          <Col>
            <Form.Item label="Địa chỉ" name="company_address" {...item1} >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Website" name="company_website" {...item1} >
              <Input />
            </Form.Item>
          </Col>
          <Col>

            <Form.Item label="Logo" name="logo" {...item1} >

              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                data={_upload}
                beforeUpload={beforeUpload}
              >
                {avatar ? (
                  <img src={avatar} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  <div>
                    {loading ? <LoadingOutlined /> : <UploadOutlined />}
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>

            </Form.Item>

          </Col>
          <Col>
            <Form.Item label="Ngành nghề" name="career" {...item1}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập ngành nghề!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Form.Item {...tailLayout}>
            <Button
              style={{ marginRight: 10 }}
              type="primary"
              loading={formLoading}

              onClick={() => {
                submit().then(result => {
                  if (result === 'ok') {
                    gotoStep(current + 1);
                  }
                });
              }}
            >
              Submit
            </Button>
            <Button onClick={() => gotoStep(current - 1)}>Prev</Button>
          </Form.Item>
        </>

      </div>
    </Row>,
    <Row >
      <div id='TTKD' style={{ marginTop: 5, marginLeft: 2, height: 1000, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>
        <>
          <Col >
            <Form.Item label="CMND/CCCD" name="SoCMND" {...item1}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập số CMND/CCCD!',

                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col >
            <Form.Item name="image" {...item1} style={{ marginLeft: 600 }}>
              <Col>
                <Upload
                  name="image"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  data={_upload1}
                  beforeUpload={beforeUpload}
                >
                  {image ? (
                    <img src={image} alt="image" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      {loading1 ? <LoadingOutlined /> : <UploadOutlined />}
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>


              </Col>
            </Form.Item>
          </Col>

          <Col>
            <Form.Item label="Đăng ký kinh doanh" name="Business_Registration" {...item1}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập đăng ký kinh doanh!',
                },
              ]}>


              <Input />

            </Form.Item>
          </Col>
          <Col style={{ marginLeft: 600 }} >
            <Form.Item name="image1" {...item1}   >
              <Col>
                <Upload
                  name="image1"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  data={_upload2}
                  beforeUpload={beforeUpload}
                >
                  {image1 ? (
                    <img src={image1} alt="image1" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      {loading2 ? <LoadingOutlined /> : <UploadOutlined />}
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Col>
            </Form.Item>
          </Col>

          <Col>
            <Form.Item label="Mã số thuế" name="tax_code" {...item1}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mã số thuế!',
                },
              ]}>


              <Input />

            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="image2" {...item1} style={{ marginLeft: 600 }}>
              <Col>
                <Upload
                  name="image2"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  data={_upload3}
                  beforeUpload={beforeUpload}
                >
                  {image2 ? (
                    <img src={image2} alt="image2" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      {loading3 ? <LoadingOutlined /> : <UploadOutlined />}
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Col>
            </Form.Item>

          </Col>
          <Form.Item {...tailLayout} style={{ marginTop: 50 }} >

            <Button
              style={{ marginRight: 10 }}
              type="primary"
              loading={formLoading}
              // onClick={_addBusiness}
              onClick={() => {
                submit().then(result => {
                  if (result === 'ok') {
                    _addBusiness();
                  }
                });
              }}
            >
              Submit
            </Button>
            <Button onClick={() => gotoStep(current - 1)}>Prev</Button>
          </Form.Item>

        </>
      </div>
    </Row >,
    <Form >
      <div id='XTOTP' style={{ marginTop: 5, marginLeft: 2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>
        <Form form={form} style={{ marginTop: 15, width: '80%' }}>
          <Col>
            <Form.Item name="otp" rules={[{ required: true, message: 'Bạn chưa nhập mã OTP' }]} {...item1} style={{ marginLeft: 500 }}>
              <Input
                size="large"
                onPressEnter={_verifyAccount}
                className={styles['input']}
                maxLength="6"
                placeholder="Nhập mã xác thực OTP"
              />
            </Form.Item>
          </Col>

        </Form>
        <Form.Item {...tailLayout} style={{ marginTop: 50 }}>
          <div>Bạn chưa nhận được mã?</div>
          <Row>
            <Col>
              <Button onClick={_resendOtp}>
                Gửi lại OTP
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                className={styles['otp-button']}
                // onClick={_verifyAccount}
                onClick={_verifyAccount}
              >
                Xác thực
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </div>
    </Form>


  ];

  return (
    <div>
      <Steps {...stepsProps} style={{ marginTop: 10 }} >
        <Step title="Hướng dẫn sử dụng" />
        <Step title="Thông tin cửa hàng" />
        <Step title="Thông tin kinh doanh" />
        <Step title="Xác thực số điện thoại" />
        <Step title="Hoàn thành" />
      </Steps>
      <div style={{ marginTop: 100 }}>
        <Form {...layout} {...formProps}>
          {formList[current]}
        </Form>

        {current === 4 && (
          <Result
            status="success"
            title="Submit is succeed!"
            extra={
              <>
                <Button
                  type="primary"
                  onClick={() => {
                    form.resetFields();
                    gotoStep(0);
                  }}
                >
                  Về trang chủ
                </Button>
                <Button >Vào cửa hàng</Button>
              </>
            }
          />
        )}
      </div>
    </div>
  )
}
export default Overview


