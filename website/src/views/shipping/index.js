import styles from './shipping.module.scss'
// icons
import { ArrowLeftOutlined, PlusCircleOutlined } from '@ant-design/icons'
//antd
import { Button, Col, Form, Input, Modal, notification, Row, Select, Space } from 'antd'
import { getDistricts, getProvinces } from 'apis/address'
//apis
import { deleteShippings, getShippings } from 'apis/shipping'
//components
import Permission from 'components/permission'
import TitlePage from 'components/title-page'
import { PERMISSIONS, ROUTES } from 'consts'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

const { Option } = Select
export default function Shipping() {
  const dispatch = useDispatch()
  const history = useHistory()
  const typingTimeoutRef = useRef(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [countShipping, setCountShipping] = useState(0)
  const [shippings, setShippings] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [columns, setColumns] = useState([])
  const [districts, setDistricts] = useState([])
  const [provinces, setProvinces] = useState([])
  const [valueSearch, setValueSearch] = useState('')
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [modalVisible, setModalVisible] = useState(false)
  const [shippingCompanyName, setShippingCompanyName] = useState('')
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})
  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date

  const toggleModal = (name) => {
    setShippingCompanyName(name)
    setModalVisible(!modalVisible)
  }

  const _onFilter = (attribute = '', value = '') => {
    if (value) paramsFilter[attribute] = value
    else delete paramsFilter[attribute]
    paramsFilter.page = 1 //reset page
    setParamsFilter({ ...paramsFilter })
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }

  const onSearch = (e) => {
    const value = e.target.value
    setValueSearch(value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (value) paramsFilter.name = value
      else delete paramsFilter.name
      paramsFilter.page = 1
      setParamsFilter({ ...paramsFilter })
    }, 650)
  }

  const _getShippings = async () => {
    try {
      setLoading(true)
      setSelectedRowKeys([])
      const res = await getShippings(paramsFilter)
      console.log(res)
      if (res.status === 200) {
        setCountShipping(res.data.count)
        setShippings(res.data.data)
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const _deleteShippings = async () => {
    try {
      setLoading(true)
      const res = await deleteShippings(selectedRowKeys)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getShippings()
          notification.success({ message: `Xóa đối tác vận chuyển thành công` })
        } else
          notification.error({
            message: res.data.message || `Xóa đối tác vận chuyển thất bại, vui lòng thử lại`,
          })
      } else
        notification.error({
          message: res.data.message || `Xóa đối tác vận chuyển thất bại, vui lòng thử lại`,
        })

      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const _clearFilters = () => {
    setParamsFilter({ page: 1, page_size: 20 })
    setValueSearch('')
    setValueTime()
    setValueDateTimeSearch({})
    setValueDateSearch(null)
  }

  const _getDistricts = async () => {
    try {
      const res = await getDistricts()
      console.log(res)
      if (res.status === 200) setDistricts(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.status === 200) setProvinces(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getShippings()
  }, [paramsFilter])

  useEffect(() => {
    _getDistricts()
    _getProvinces()
  }, [])

  return (
    <>
      <div className="card">
        <Modal
          visible={modalVisible}
          title={`Kết nối đối tác ${shippingCompanyName}`}
          onCancel={toggleModal}
          footer={[
            <Button
              onClick={() =>
                shippingCompanyName === 'GHTK'
                  ? history.push(ROUTES.SHIPPING_CREATE_GHTK)
                  : history.push(ROUTES.SHIPPING_CREATE_GHN)
              }
              type="primary"
              style={{ backgroundColor: '#6D24CF', border: 'none' }}
            >
              Kết nối
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            {shippingCompanyName === 'GHTK' ? (
              <>
                <Form.Item label="Secret key" name="secret_key">
                  <Input placeholder="Secret key" />
                </Form.Item>
                <Form.Item label="Customer code secret key" name="customer_secret_key">
                  <Input placeholder="Customer code secret key" />
                </Form.Item>
                <div className={styles['content-modal']}>
                  <h4>Hướng dẫn lấy bằng hình ảnh</h4>
                  <div>
                    <p>Step 1: Lorem ipsum dolor sit amet, consetetur sadipscing elitr sed diam.</p>
                    <img
                      style={{ display: 'block', width: '100%' }}
                      src="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/07/10e585da-4952-41d0-b92a-e385c3f9a4a3/Group 14113.png"
                    />
                  </div>
                  <div>
                    <p>Step 2: Lorem ipsum dolor sit amet, consetetur sadipscing elitr sed diam.</p>
                    <img
                      style={{ display: 'block', width: '100%' }}
                      src="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/07/10e585da-4952-41d0-b92a-e385c3f9a4a3/Group 14113.png"
                    />
                  </div>
                </div>
              </>
            ) : (
              <Form.Item label="Token API" name="token_api">
                <Input placeholder="Token API" />
              </Form.Item>
            )}
          </Form>
        </Modal>
        <TitlePage
          title={
            <Row
              wrap={false}
              align="middle"
              style={{ cursor: 'pointer' }}
              onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
            >
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              Đối tác vận chuyển
            </Row>
          }
        >
          <Space>
            {/* <SettingColumns
              nameColumn="columnsShipping"
              columns={columns}
              setColumns={setColumns}
              columnsDefault={columnsShipping}
            />
            <ShippingForm reloadData={_getShippings}></ShippingForm> */}
            <Permission permissions={[PERMISSIONS.them_doi_tac_van_chuyen]}>
              <Button
                onClick={() => history.push(ROUTES.SHIPPING_CREATE)}
                icon={<PlusCircleOutlined />}
                type="primary"
                size="large"
              >
                Thêm đối tác
              </Button>
            </Permission>
          </Space>
        </TitlePage>
        <Row gutter={[20, 20]} style={{ padding: '20px 10px' }} justify="space-between">
          <Col span={12}>
            <Row
              justify="space-between"
              align="middle"
              style={{
                boxShadow: '0px 4px 25px rgba(37, 107, 254, 0.25)',
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Col span={5}>
                <img
                  style={{ display: 'block', width: '80px', height: 80 }}
                  src="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/07/31d98110-7516-4558-bdf8-6766b891b4e6/Frame 16671.png"
                />
                <p>Tự giao hàng</p>
              </Col>
              <Col span={5}>
                <Button type="primary" style={{ backgroundColor: '#68D69D', border: 'none' }}>
                  Đã kích hoạt
                </Button>
              </Col>
              <Col span={24}>
                <p>
                  Nhà bán hàng được chủ động giao sản phẩm và dịch vụ đến người mua mà không cần
                  thông qua các đối tác vận chuyển nào.
                </p>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row
              justify="space-between"
              align="middle"
              style={{
                boxShadow: '0px 4px 25px rgba(37, 107, 254, 0.25)',
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Col span={5}>
                <img
                  style={{ display: 'block', width: '100px', height: 80 }}
                  src="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/07/15c0738f-7d3d-46e0-8ca5-0db90617e3b5/ghn.jpg"
                />
                <p>Giao hàng nhanh</p>
              </Col>
              <Col span={5}>
                <Button
                  onClick={() => toggleModal('GHN')}
                  type="primary"
                  style={{ backgroundColor: '#FF9240', border: 'none' }}
                >
                  Chưa kích hoạt
                </Button>
              </Col>
              <Col span={24}>
                <p>
                  Nhà bán hàng được chủ động giao sản phẩm và dịch vụ đến người mua mà không cần
                  thông qua các đối tác vận chuyển nào.
                </p>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row
              justify="space-between"
              align="middle"
              style={{
                boxShadow: '0px 4px 25px rgba(37, 107, 254, 0.25)',
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Col span={8}>
                <img
                  style={{ display: 'block', width: '100px', height: 80 }}
                  src="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/07/e6268e25-7ca7-4c03-a486-8c4aded667b8/giao_hang_tiet_kiem.png"
                />
                <p>Giao hàng tiết kiệm (chưa kích hoạt)</p>
              </Col>
              <Col span={5}>
                <Button
                  type="primary"
                  onClick={() => toggleModal('GHTK')}
                  style={{ backgroundColor: '#FF9240', border: 'none' }}
                >
                  Chưa kích hoạt
                </Button>
              </Col>
              <Col span={24}>
                <p>
                  Cung cấp dịch vụ giao hàng tận nơi và thu tiền tận nơi cho các Shop/Doanh nghiệp
                  kinh doanh trực tuyến. Giao hàng với tốc độ nhanh, mạng lưới phủ sóng rộng trên
                  toàn quốc.
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  )
}
