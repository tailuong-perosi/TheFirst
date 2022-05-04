import React, { useEffect, useState } from 'react'
import { copyText } from 'utils'
import { ACTION, VERSION_APP } from 'consts'
import jwt_decode from 'jwt-decode'
import { useDispatch, useSelector } from 'react-redux'

//antd
import { Upload, Tabs, Table, Button, Row, Popconfirm, Modal, Input, notification } from 'antd'

//icons
import { LoadingOutlined, PlusOutlined, CopyOutlined, PlusCircleOutlined } from '@ant-design/icons'

//apis
import { uploadFile } from 'apis/upload'
import { getBusinesses, updateBusinesses } from 'apis/app'

export default function Setting() {
  const dispatch = useDispatch()
  const setting = useSelector((state) => state.setting)

  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState('')

  const columnsLanguage = [
    {
      title: 'Tên',
      dataIndex: 'name',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'logo',
    },
    {
      title: 'File',
      dataIndex: 'file',
    },
    {
      width: 110,
      title: '',
      render: (text, record) => (
        <Popconfirm title="Bạn có muốn xóa file này không ?">
          <Button type="primary" danger>
            Xóa file
          </Button>
        </Popconfirm>
      ),
    },
  ]

  let dataMockup = []
  for (let i = 0; i < 2; i++)
    dataMockup.push({
      name: 'Ngôn ngữ ' + i++,
      logo: '',
      file: 'File' + 1,
    })

  const _uploadLogo = async (file) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const company_logo = await uploadFile(file)
      if (company_logo) _updateSettingApp({ company_logo })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
    }
  }

  const ModalImportFile = () => {
    const [visible, setVisible] = useState(false)

    const toggle = () => setVisible(!visible)

    return (
      <>
        <Button onClick={toggle} icon={<PlusCircleOutlined />} type="primary">
          Tải file
        </Button>
        <Modal title={<a>Tải file mẫu</a>} visible={visible} onCancel={toggle}>
          <div>
            <div>Tên file</div>
            <Input placeholder="Nhập tên file" />
          </div>
          <Button
            icon={<PlusOutlined />}
            style={{ width: 150, height: 100, marginTop: 15 }}
          ></Button>
        </Modal>
      </>
    )
  }

  const _updateSettingApp = async (body) => {
    try {
      setLoading(true)
      const res = await updateBusinesses(body, setting.system_user_id)
      console.log(res)
      if (res.status === 200) {
        document.querySelector("link[rel*='icon']").href = body.company_logo || ''
        _getBusiness()
        notification.success({ message: 'Cập nhật thành công!' })
      } else
        notification.error({
          message: res.data.message || 'Cập nhật thất bại, vui lòng thử lại!',
        })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _getBusiness = async () => {
    try {
      setLoading(true)
      const res = await getBusinesses({ _business: true })
      if (res.status === 200)
        if (res.data.data)
          if (localStorage.getItem('accessToken')) {
            const dataUser = jwt_decode(localStorage.getItem('accessToken'))
            if (dataUser && dataUser.data) {
              const business = res.data.data.find(
                (e) =>
                  e._business && e._business.business_name === dataUser.data._business.business_name
              )
              if (business) dispatch({ type: 'GET_SETTING_APP', data: business._business || {} })
            }
          }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    _getBusiness()
  }, [])

  return (
    <div className="card">
      <Tabs size="large" type="card">
        <Tabs.TabPane tab="Ngôn ngữ" key="1">
          <Row justify="end" style={{ marginBottom: 15 }}>
            <ModalImportFile />
          </Row>
          <Table
            size="small"
            dataSource={dataMockup}
            columns={columnsLanguage}
            style={{ width: '100%' }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Chi tiết phiên bản" key="2">
          <div>
            <div>Version: {VERSION_APP}</div>
            <div>
              <div>Chi tiết:</div>
              <div>- Bổ sung giao diện nhập kho</div>
              <div>- Bổ sung chức năng tạo đơn nhập kho</div>
              <div>- Chỉnh sửa chức năng import sản phẩm bằng file excel</div>
              <div>- Cho phép tải file đính kèm khi tạo sản phẩm</div>
              <div>- Xuất file excel các đơn hàng nhập </div>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Kết nối API" key="3">
          Phát triển sau
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="Logo" key="4">
          <Upload
            name="avatar"
            listType="picture-card"
            className="upload-category-image"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            onChange={(info) => {
              if (info.file.status === 'uploading') info.file.status = 'done'
            }}
            data={_uploadLogo}
          >
            {setting && setting.company_logo ? (
              <img src={setting.company_logo} alt="avatar" style={{ width: '100%' }} />
            ) : (
              <div>
                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Logo</div>
              </div>
            )}
          </Upload>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Khác" key="5">
          <div>Lấy link hình ảnh</div>
          <Upload
            name="avatar"
            listType="picture-card"
            className="upload-category-image"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            data={async (file) => {
              setLoading(true)
              const url = await uploadFile(file)
              setImageUrl(url)
              setLoading(false)
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
            ) : (
              <div>
                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
          <h3>
            {imageUrl}{' '}
            <CopyOutlined
              style={{
                display: !imageUrl && 'none',
                color: '#5B6BE8',
                cursor: 'pointer',
                marginLeft: 7,
                fontSize: 19,
              }}
              onClick={() => copyText(imageUrl)}
            />
          </h3>
        </Tabs.TabPane> */}
      </Tabs>
    </div>
  )
}
