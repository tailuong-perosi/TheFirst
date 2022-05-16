import React, { useEffect, useState } from 'react'
import styles from './overview.module.scss'
import { ACTION, ROUTES } from 'consts'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import { uploadFile } from 'apis/upload'
import delay from 'delay'
//antd
import { Row, Col, notification, Form, Input, Button, Upload, Steps,message,PageHeader } from 'antd'

//icons antd
import {  UploadOutlined, LoadingOutlined } from '@ant-design/icons'

//apis

import {addBusiness} from 'apis/business'
import {  getEmployees } from 'apis/employee'
import { verify, getOtp } from 'apis/auth'


function Overview (){
  
  const dispatch = useDispatch()
  let history = useHistory()
  const { Step } = Steps;
  const [loading, setLoading] = useState(false)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [loading3, setLoading3] = useState(false)
  const [image, setImage] = useState('')
  const [avatar, setAvatar] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [form] = Form.useForm()
  const [user, setUser] = useState({})

  
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
      console.log(error)
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
      console.log(error)
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
      console.log(error)
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
      console.log(error)
    }
  }
  const _addBusiness = async(dataForm) =>{
    try {
      const body = {
        ...dataForm,
        logo: dataForm.logo,
        business_name: dataForm.business_name,
        first_name: '',
        last_name: dataForm.business_name,
        company_phone: dataForm.company_phone,
        birthday: '',
        address: dataForm.company_address,
        company_website:dataForm.company_website,
        ward: '',
        district: '',
        province: '',
        company_name: '',
        company_website: '',
        career_id:dataForm.career,
        tax_code: dataForm.tax_code,
        fax: '',
        branch: '',
        business_areas: '',
      }

      dispatch({ type: ACTION.LOADING, data: true })
      const res = await addBusiness(body)
      if (res.status === 200) {
        if (res.data.success) {
            notification.info({ message: 'Mã otp đã được gửi về số điện thoại của bạn' })
            history.push({ pathname: ROUTES.OTP, state: res.data.data })
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
  const Step1 =()=>{
    return(
      <div id='HDSD' style={{ marginTop: 5,marginLeft:2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>
              <h1 style={{ marginTop: 100 }}>Để tạo cửa hàng thành công vui lòng hoàn thành 2 bước sau: </h1>
              <h1>1. Thông tin cửa hàng</h1>
              <h1>2. Xác thực thông tin </h1><br></br>
              <h1>- Ứng với mỗi tài khoản Ekata chỉ có thể tạo được 1 cửa hàng</h1>
              <h1>- Từ cửa hàng thứ 2 trở đi, bạn vui lòng đăng ký thêm số điện thoại(khác số điện thoại đăng nhập, chưa được đăng ký tài khoản Ekata) để thực hện mở của hàng</h1>
              <h1>Dữ liệu của cửa hàng nếu chưa được hoàn thành xác thực thông tin thì chỉ có thể tồn tại tối đa 60 ngày(kể từ ngày ghi nhận giao dịch cuối cùng của cửa hàng đó)</h1>
            </div>
    )
  }
  const Step2=()=>{
    return(
       <Row >
            <div id='TTCH' style={{ marginTop: 5,marginLeft:2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>

              <Form name="Addbusiness"  labelCol={{ span: 7 }} wrapperCol={{ span: 8 }} initialValues={{ remember: true, }}
                onFinish={_addBusiness}
                autoComplete="off"
                style={{ marginTop: 30 }}
                >
                <Col>
                  <Form.Item label="Tên cửa hàng" name="business_name"
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
                  <Form.Item label="Số điện thoại" name="company_phone"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      {
                        pattern: new RegExp(/([+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/),
                        message: 'Vui lòng nhập số điện thoại đúng định dạng',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item label="Địa chỉ" name="company_address" >
                    <Input />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item label="Website" name="company_website" >
                    <Input />
                  </Form.Item>
                </Col>
                <Col>

                  <Form.Item label="Logo" name="logo" >
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
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
                  <Form.Item label="Ngành nghề" name="career"
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


                <Form.Item
                  wrapperCol={{
                    offset: 13,
                    span: 16,
                  }}
                >
                  <Button type="primary" htmlType="submit" >
                    Tiếp tục
                  </Button>
                </Form.Item>
              </Form>

            </div>
          </Row>
    )
    
  }
  
  const Step3 =()=>{
    return(
      <Row>
            <div id='XTTT' style={{ marginTop: 5,marginLeft:2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>
              <Form name="Validatebusiness" labelCol={{ span: 7  }} wrapperCol={{ span: 15 }} initialValues={{ remember: true, }}
                // onFinish={_ValidateBusiness}
                
                autoComplete="off"
                style={{ marginTop: 30 }}>

                
                <Col >

                  <Form.Item label="CMND/CCCD" name="CMND"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập số CMND/CCCD!',

                      },
                    ]}
                  >
                    <Row>
                      <Col >
                        <Input />
                      </Col>
                      <Col>
                        <Upload
                          name="avatar"
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          data={_upload1}
                          beforeUpload={beforeUpload}
                        >
                          {image ? (
                            <img src={image} alt="avatar" style={{ width: '100%' }} />
                          ) : (
                            <div>
                              {loading1 ? <LoadingOutlined /> : <UploadOutlined />}
                              <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                          )}
                        </Upload>
                      </Col>
                    </Row>
                  </Form.Item>

                </Col>

                <Col>
                  <Form.Item label="Đăng ký kinh doanh" name="Business_Registration"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập đăng ký kinh doanh!',
                      },
                    ]}>
                    <Row>
                      <Col >
                        <Input />
                      </Col>
                      <Col>
                        <Upload
                          name="avatar"
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          data={_upload2}
                          beforeUpload={beforeUpload}
                        >
                          {image1 ? (
                            <img src={image1} alt="avatar" style={{ width: '100%' }} />
                          ) : (
                            <div>
                              {loading2 ? <LoadingOutlined /> : <UploadOutlined />}
                              <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                          )}
                        </Upload>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>


                <Col>
                  <Form.Item label="Mã số thuế" name="tax_code"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mã số thuế!',
                      },
                    ]}>
                    <Row>
                      <Col >
                        <Input />
                      </Col>
                      <Col>
                        <Upload
                          name="avatar"
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          data={_upload3}
                          beforeUpload={beforeUpload}
                        >
                          {image2 ? (
                            <img src={image2} alt="avatar" style={{ width: '100%' }} />
                          ) : (
                            <div>
                              {loading3 ? <LoadingOutlined /> : <UploadOutlined />}
                              <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                          )}
                        </Upload>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>


                <Form.Item
                  wrapperCol={{
                    offset: 5,
                    span: 40,
                  }}
                >
                  <Button type="primary" style={{ marginRight: 200 }}>Vào cửa hàng</Button>
                  <Button type="primary" htmlType="submit" >
                    Lưu
                  </Button>
                </Form.Item>

              </Form>
            </div>
          </Row> 
    )
  }
  const dataUser = localStorage.getItem('accessToken')
    ? jwt_decode(localStorage.getItem('accessToken'))
    : {}
  const getInfoUser = async (params) => {
    try {
      const res = await getEmployees(params)
      if (res.status === 200) {
        if (res.data.data.length) setUser({ ...res.data.data[0] })
        console.log(user.username);
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getInfoUser({user_id: dataUser.data.user_id})
  }, [dataUser.data.user_id])
  // const _verifyAccount = async () => {
  //   try {
  //     await form.validateFields()
  //     dispatch({ type: ACTION.LOADING, data: true })
  //     const dataForm = form.getFieldsValue()
  //     // var body = { sdt: sdt, otp_code: dataForm.otp }
  //     const res = await verify(body)
  //     dispatch({ type: ACTION.LOADING, data: false })
  //     console.log(res)
  //     if (res.status === 200) {
  //       if (res.data.success) {
  //         notification.success({ message: 'Xác thực otp thành công' })

  //         dispatch({ type: ACTION.LOGIN, data: res.data.data })

  //         //luu branch id len redux
  //         const dataUser = jwt_decode(res.data.data.accessToken)
  //         localStorage.setItem('accessToken', res.data.data.accessToken)
  //         dispatch({ type: 'SET_BRANCH_ID', data: dataUser.data.store_id })

  //         await delay(300)
  //         // window.location.href = `https://${dataUser.data._business.prefix}.${process.env.REACT_APP_HOST}${ROUTES.OVERVIEW}`
  //       } else
  //         notification.warning({
  //           message:
  //             res.data.message ||
  //             `Xác thực OTP thất bại, vui lòng bấm vào 'Gửi lại OTP' để thử lại`,
  //         })
  //     } else
  //       notification.warning({
  //         message:
  //           res.data.message || `Xác thực OTP thất bại, vui lòng bấm vào 'Gửi lại OTP' để thử lại`,
  //       })
  //   } catch (error) {
  //     console.log(error)
  //     dispatch({ type: ACTION.LOADING, data: false })
  //   }
  // }
  // const _resendOtp = async () => {
  //   try {
  //     dispatch({ type: ACTION.LOADING, data: true })
  //     // const res = await getOtp(sdt)
  //     if (res.status === 200) {
  //       if (res.data.success)
  //         notification.success({ message: 'Gửi lại otp thành công, vui lòng kiểm tra lại' })
  //       else notification.error({ message: 'Gửi lại otp thất bại, vui lòng thử lại' })
  //     } else notification.error({ message: 'Gửi lại otp thất bại, vui lòng thử lại' })
  //     dispatch({ type: ACTION.LOADING, data: false })
  //   } catch (error) {
  //     console.log(error)
  //     dispatch({ type: ACTION.LOADING, data: false })
  //   }
  // }
  const Step4=()=>{
    return(
      <div id='XTOTP' style={{ marginTop: 5,marginLeft:2, height: 500, marginBottom: 15, width: '100%' }} className={styles['card-overview']}>
      <Form form={form} style={{ marginTop: 15, width: '80%' }}>
            <Form.Item name="otp" rules={[{ required: true, message: 'Bạn chưa nhập mã OTP' }]}>
              <Input
                size="large"
                // onPressEnter={_verifyAccount}
                className={styles['input']}
                maxLength="6"
                placeholder="Nhập mã xác thực OTP"
              />
            </Form.Item>
            <Row wrap={false} align="end" style={{ color: 'white' }}>
              <div>Bạn chưa nhận được mã?</div>
              <p className={styles['otp-content-resent']}>
                Gửi lại OTP
              </p>
            </Row>
          </Form>
          <Button
            size="large"
            type="primary"
            className={styles['otp-button']}
            // onClick={_verifyAccount}
          >
            Xác thực
          </Button>
                </div>
    )
  }

  const steps = [
    {
      title: 'Hướng dẫn sử dụng',
      content: <Step1/>,
    },
    {
      title: 'Thông tin cửa hàng',
      content: <Step2/>,
    },
    {
      title: 'Xác thực thông tin',
      content: <Step3/>,
    },
    {
      title: 'Xác thực OTP',
      content: <Step4/>,
    },
  ];
  const App = () => {
    const [current, setCurrent] = useState(0);
  
    const next = () => {
      setCurrent(current + 1);
    };
  
    const prev = () => {
      setCurrent(current - 1);
    };
    return (
      <>
        <Steps current={current}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[current].content} </div>
        <div className="steps-action">
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()} >
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => message.success('Processing complete!')}>
              Done
            </Button>
          )}
          {current > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              Previous
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <PageHeader title="Tạo cửa hàng" >
      <App steps={steps} />
  </PageHeader>
  )
}
export default Overview

