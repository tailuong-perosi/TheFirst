import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import {
  ROUTES,
  PERMISSIONS,
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  FILTER_SIZE,
  FILTER_COL_HEIGHT,
  IMAGE_DEFAULT,
} from 'consts'
import { compare, formatCash, compareCustom, tableSum } from 'utils'
import { useReactToPrint } from 'react-to-print'
import { useSelector } from 'react-redux'

//antd
import {
  Input,
  Button,
  Row,
  DatePicker,
  Table,
  Select,
  Space,
  Popconfirm,
  notification,
  Col,
  Affix,
  Drawer,
  Collapse,
  Timeline,
  Modal,
} from 'antd'

//icons
import { PlusCircleOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'

//components
import Permissions from 'components/permission'
import PrintOrder from 'components/print/print-order'
import SettingColumns from 'components/setting-columns'
import columnsDelivery from './columnsDelivery'
import TitlePage from 'components/title-page'

//apis
import { getOrders, deleteOrders, getStatusOrder, updateOrder } from 'apis/order'
import { getEmployees } from 'apis/employee'
import { getAllBranch } from 'apis/branch'
import { getShippings } from 'apis/shipping'
import { getEnumPlatform, getShippingStatus } from 'apis/enum'

const { RangePicker } = DatePicker
const { Panel } = Collapse
export default function DeliveryControl() {
  let printOrderRef = useRef()
  const branchIdApp = useSelector((state) => state.branch.branchId)
  const history = useHistory()
  const [shippingCompany, setShippingCompany] = useState([])
  const [platforms, setPlatForms] = useState([])
  const typingTimeoutRef = useRef(null)
  const handlePrint = useReactToPrint({ content: () => printOrderRef.current })
  const [columns, setColumns] = useState([])
  const [dataPrint, setDataPrint] = useState(null)
  const [statusOrder, setStatusOrder] = useState([])
  const [statusShipping, setStatusShipping] = useState([])
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [countOrder, setCountOrder] = useState(0)
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [optionSearchName, setOptionSearchName] = useState('code')
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: PAGE_SIZE })
  const [paramsFilterOther, setParamsFilterOther] = useState({})
  const [valueSearch, setValueSearch] = useState('')
  const [visibleDrawer, setVisibleDrawer] = useState(false)

  const toggleDrawer = () => {
    setVisibleDrawer(!visibleDrawer)
  }

  const Print = () => (
    <div style={{ display: 'none' }}>
      <PrintOrder ref={printOrderRef} data={dataPrint} />
    </div>
  )

  const ModalUpdateTrackingNumberOrShipping = ({
    children,
    id = '',
    tracking_number = null,
    shipping = null,
  }) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)
    const [value, setValue] = useState(tracking_number || shipping || '')

    const _onUpdate = async () => {
      try {
        const shipping_info = {}
        if (!value) {
          notification.error({ message: 'Vui lòng nhập giá trị mới' })
          return
        } else {
          if (tracking_number !== null || tracking_number === '')
            shipping_info.tracking_number = value
          if (shipping !== null || shipping === '') shipping_info.shipping_name = value
        }
        const body = { shipping_info }
        const res = await updateOrder(body, id)
        if (res.status === 200) {
          if (res.data.success) {
            _getDeliveryOrders()
            notification.success({ message: 'Cập nhật thành công' })
          } else
            notification.error({
              message: res.data.message || 'Cập nhật thất bại, vui lòng thử lại',
            })
        } else
          notification.error({ message: res.data.message || 'Cập nhật thất bại, vui lòng thử lại' })
      } catch (error) {
        console.log(error)
      }
    }

    return (
      <>
        <a onClick={toggle}>{children}</a>
        <Modal
          onOk={_onUpdate}
          title={`Cập nhật ${
            tracking_number !== null && (tracking_number !== '' || tracking_number === '')
              ? 'mã vận đơn'
              : ''
          }${shipping !== null && (shipping !== '' || shipping === '') ? 'đơn vị vận chuyển' : ''}`}
          onCancel={toggle}
          visible={visible}
        >
          {tracking_number !== null && (tracking_number !== '' || tracking_number === '') && (
            <Input
              onChange={(e) => setValue(e.target.value)}
              value={value}
              placeholder="Nhập mã vận đơn"
            />
          )}

          {shipping !== null && (shipping !== '' || shipping === '') && (
            <Select
              value={value || undefined}
              onChange={setValue}
              showSearch
              placeholder="Chọn đơn vị vận chuyển mới"
              style={{ width: '100%' }}
            >
              {shippingCompany.map((shipping, index) => (
                <Select.Option value={shipping.name} key={index}>
                  {shipping.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Modal>
      </>
    )
  }

  const _onSearch = (e) => {
    const value = e.target.value
    setValueSearch(value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (value) paramsFilter[optionSearchName] = value
      else delete paramsFilter[optionSearchName]

      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 650)
  }

  const _onChangeDate = (date, dateString) => {
    if (date) {
      paramsFilter.from_date = dateString[0]
      paramsFilter.to_date = dateString[1]
    } else {
      delete paramsFilter.from_date
      delete paramsFilter.to_date
    }
    setParamsFilter({ ...paramsFilter, page: 1 })
  }

  const _onChangeFilter = (attribute = '', value = '') => {
    paramsFilter.page = 1
    if (value) paramsFilter[attribute] = value
    else delete paramsFilter[attribute]
    setParamsFilter({ ...paramsFilter })
  }

  const _onChangeOtherFilter = (attribute = '', value = '') => {
    if (value) paramsFilterOther[attribute] = value
    else {
      delete paramsFilterOther[attribute]
      delete paramsFilter[attribute]
    }
    setParamsFilterOther({ ...paramsFilterOther })
  }

  const _submitFilterOther = () => {
    setParamsFilter({ ...paramsFilter, ...paramsFilterOther })
  }

  const columnsProduct = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'sku',
      sorter: (a, b) => compare(a, b, 'sku'),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      render: (data) => (
        <img
          src={data && data[0] ? data[0] : IMAGE_DEFAULT}
          style={{ maxWidth: 60, maxHeight: 60 }}
          alt=""
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      sorter: (a, b) => compare(a, b, 'title'),
    },
    {
      title: 'Đơn vị',
      sorter: (a, b) => compare(a, b, 'unit'),
      dataIndex: 'unit',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      sorter: (a, b) => compare(a, b, 'quantity'),
    },
    {
      title: 'Đơn giá',
      sorter: (a, b) => compare(a, b, 'price'),

      render: (text, record) => (record.price ? formatCash(+record.price) : 0),
    },
    {
      title: 'Chiết khấu',
      sorter: (a, b) => compare(a, b, 'discount'),

      render: (text, record) => (record.discount ? formatCash(+record.discount) : 0),
    },
    {
      title: 'Thuế',
      dataIndex: '',
      // sorter: (a, b) => compare(a, b, 'price'),
    },
    {
      title: 'Thành tiền',
      sorter: (a, b) => compare(a, b, 'total_cost'),
      render: (text, record) => (record.total_cost ? formatCash(+record.total_cost) : 0),
    },
  ]

  const _getDeliveryOrders = async () => {
    try {
      setLoading(true)
      const res = await getOrders({ ...paramsFilter, branch_id: branchIdApp, is_delivery: true })
      if (res.status === 200) {
        setOrders(res.data.data)
        setCountOrder(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _getEmployees = async () => {
    try {
      const res = await getEmployees({ role_id: 2 })
      if (res.status === 200) setEmployees(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getShippingCompany = async () => {
    try {
      const res = await getShippings()
      console.log(res)
      if (res.status === 200) setShippingCompany(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getPlatform = async () => {
    try {
      const res = await getEnumPlatform()
      if (res.status === 200) setPlatForms(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getBranch = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) setBranches(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const onClickClear = async () => {
    setParamsFilter({ page: 1, page_size: 20 })
    setValueSearch('')
  }
  const _getShippingStatus = async () => {
    try {
      const res = await getShippingStatus()
      if (res.status === 200) setStatusShipping(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getEmployees()
    _getBranch()
    _getShippingCompany()
    _getPlatform()
    _getShippingStatus()
  }, [])

  useEffect(() => {
    _getDeliveryOrders()
  }, [paramsFilter, branchIdApp])

  return (
    <div className="card">
      <Drawer
        title="Bộ lọc khác"
        placement="right"
        onClose={toggleDrawer}
        visible={visibleDrawer}
        extra={
          <Button onClick={_submitFilterOther} type="primary">
            Lọc
          </Button>
        }
      >
        <Collapse defaultActiveKey={['1']} ghost>
          <Panel header="Đối tác giao hàng" key="1">
            <Select
              placeholder="Đối tác giao hàng"
              style={{ width: '100%' }}
              size={FILTER_SIZE}
              allowClear
              // value={paramsFilterOther.shipping_company_id || null}
              onChange={(value) => _onChangeOtherFilter('shipping_company_id', value)}
            >
              {shippingCompany.map((item) => (
                <Select.Option value={item.shipping_company_id}>{item.name}</Select.Option>
              ))}
            </Select>
          </Panel>
          {/* <Panel header="Trạng thái đối soát" key="2">
            <Select
              placeholder="Trạng thái đối soát"
              style={{ width: '100%' }}
              size={FILTER_SIZE}
              allowClear
            >
              <Select.Option value=""></Select.Option>
            </Select>
          </Panel>
          <Panel header="Trạng thái in" key="3">
            <Select
              placeholder="Trạng thái in"
              style={{ width: '100%' }}
              size={FILTER_SIZE}
              allowClear
            >
              <Select.Option value=""></Select.Option>
            </Select>
          </Panel> */}
          {/* <Panel header="Ngày xuất kho" key="4">
            <RangePicker
              size={FILTER_SIZE}
              onChange={_onChangeDate}
              style={{ width: '100%' }}
              className="br-15__date-picker"
              ranges={{
                Today: [moment(), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
              }}
            />
          </Panel> */}
          <Panel header="Nguồn" key="5">
            <Select
              placeholder="Nguồn"
              style={{ width: '100%' }}
              size={FILTER_SIZE}
              allowClear
              // value={paramsFilterOther.platform || null}
              onChange={(value) => _onChangeOtherFilter('platform', value)}
            >
              {platforms.map((item) => (
                <Select.Option value={item.name}>{item.label}</Select.Option>
              ))}
            </Select>
          </Panel>
          <Panel header="Nhân viên tạo" key="6">
            <Select
              onChange={(value) => _onChangeOtherFilter('employee_name', value)}
              showSearch
              size={FILTER_SIZE}
              placeholder="Chọn nhân viên"
              style={{ width: '100%' }}
              allowClear
            >
              {employees.map((employee, index) => (
                <Select.Option value={employee.first_name + ' ' + employee.last_name} key={index}>
                  {employee.first_name} {employee.last_name}
                </Select.Option>
              ))}
            </Select>
          </Panel>
          {/* <Panel header="Địa chỉ giao hàng" key="7">
            <Input
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
              name="address"
              onBlur={(e) => _onChangeFilter('address', e.target.value)}
              placeholder="Tìm kiếm theo địa chỉ giao hàng"
              allowClear
            />
          </Panel> */}
        </Collapse>
      </Drawer>
      <Print />
      <Affix offsetTop={60}>
        <TitlePage title="Quản lý giao hàng">
          <Space>
            <SettingColumns
              columnsDefault={columnsDelivery}
              nameColumn="columnsDelivery"
              columns={columns}
              setColumns={setColumns}
            />
            <Button onClick={toggleDrawer} size="large" type="primary">
              Bộ lọc khác
            </Button>
            <Permissions permissions={[PERMISSIONS.tao_don_hang]}>
              <Button
                onClick={() => history.push(ROUTES.ORDER_CREATE)}
                size="large"
                type="primary"
                icon={<PlusCircleOutlined />}
              >
                Tạo đơn và giao hàng
              </Button>
            </Permissions>
          </Space>
        </TitlePage>
      </Affix>
      <div style={{ marginTop: 15 }}>
        <Row gutter={[16, 16]} justify="space-between" style={{ marginRight: 0, marginLeft: 0 }}>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={8}
            xl={8}
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 5,
            }}
          >
            <Input
              style={{ width: '60%' }}
              prefix={<SearchOutlined />}
              name="name"
              value={valueSearch}
              onChange={_onSearch}
              placeholder="Tìm kiếm đơn hàng"
              bordered={false}
              allowClear
            />
            <Select
              showSearch
              size={FILTER_SIZE}
              style={{ width: '40%', borderLeft: '1px solid #d9d9d9' }}
              value={optionSearchName}
              onChange={(value) => {
                delete paramsFilter[optionSearchName]
                setOptionSearchName(value)
              }}
              bordered={false}
            >
              <Select.Option value="code">Mã đơn hàng</Select.Option>
              <Select.Option value="tracking_number">Mã vận đơn</Select.Option>
              <Select.Option value="customer_name">Tên khách hàng</Select.Option>
              <Select.Option value="customer_phone">SĐT khách hàng</Select.Option>
              <Select.Option value="address">Địa chỉ giao hàng</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={24} md={24} lg={16} xl={16}>
            <Row>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={8}
                xl={8}
                style={{
                  border: '1px solid #d9d9d9',
                  borderRight: 'none',
                  borderRadius: '5px 0px 0px 5px',
                }}
              >
                <RangePicker
                  size={FILTER_SIZE}
                  onChange={_onChangeDate}
                  style={{ width: '100%' }}
                  className="br-15__date-picker"
                  ranges={{
                    'Hôm nay': [moment(), moment()],
                    'Tuần này': [moment().startOf('week'), moment().endOf('week')],
                    'Tháng trước': [
                      moment().subtract(1, 'months').startOf('month'),
                      moment().subtract(1, 'months').endOf('month'),
                    ],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Năm này': [moment().startOf('year'), moment().endOf('year')],
                    'Năm trước': [
                      moment().subtract(1, 'years').startOf('year'),
                      moment().subtract(1, 'years').endOf('year'),
                    ],
                  }}
                  bordered={false}
                />
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={8}
                xl={8}
                style={{
                  border: '1px solid #d9d9d9',
                }}
              >
                <Select
                  size={FILTER_SIZE}
                  value={paramsFilter.bill_status}
                  onChange={(value) => _onChangeFilter('ship_status', value)}
                  showSearch
                  placeholder="Lọc theo trạng thái giao hàng"
                  style={{ width: '100%' }}
                  bordered={false}
                >
                  {statusShipping.map((status, index) => (
                    <Select.Option value={status.name} key={index}>
                      {status.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={8}
                xl={8}
                style={{
                  border: '1px solid #d9d9d9',
                  borderLeft: 'none',
                  borderRadius: '0px 5px 5px 0px',
                }}
              >
                <Select
                  //   value={paramsFilter.employee_name || ''}
                  onChange={(value) => _onChangeFilter('employee_name', value)}
                  showSearch
                  size={FILTER_SIZE}
                  placeholder="Lọc theo chi nhánh"
                  style={{ width: '100%' }}
                  bordered={false}
                >
                  <Select.Option value="">Tất cả</Select.Option>
                  {branches.map((branch, index) => (
                    <Select.Option value={branch.name} key={index}>
                      {branch.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
          <Button
            style={{
              display: Object.keys(paramsFilter).length <= 2 && 'none',
            }}
            onClick={onClickClear}
            type="primary"
          >
            Xóa tất cả lọc
          </Button>
        </Row>
      </div>

      <Table
        size="small"
        rowKey="order_id"
        loading={loading}
        scroll={{ y: '48vh' }}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <div style={{ paddingTop: 17, paddingBottom: 17 }}>
                <div className="table-product-in-order">
                  <Table
                    pagination={false}
                    size="small"
                    style={{ width: '100%' }}
                    columns={columnsProduct}
                    dataSource={record.order_details}
                    summary={() => (
                      <Table.Summary.Row>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell colSpan={2}>
                          <div style={{ fontSize: 14.7 }}>
                            <Row wrap={false} justify="space-between">
                              <div>Tổng tiền ({record.order_details.length} sản phẩm)</div>
                              <div>{record.total_cost ? formatCash(+record.total_cost) : 0}</div>
                            </Row>
                            <Row wrap={false} justify="space-between">
                              <div>Chiết khấu</div>
                              <div>
                                {record.promotion
                                  ? `${formatCash(+(record.promotion.value || 0))} ${
                                      record.promotion.type && record.promotion.type !== 'VALUE'
                                        ? '%'
                                        : ''
                                    }`
                                  : 0}
                              </div>
                            </Row>
                            <Row wrap={false} justify="space-between">
                              <div>Phí giao hàng</div>
                              <div>
                                {record.shipping_info
                                  ? formatCash(+record.shipping_info.cod || 0)
                                  : 0}
                              </div>
                            </Row>
                            <Row wrap={false} justify="space-between" style={{ fontWeight: 600 }}>
                              <div>Khách phải trả</div>
                              <div>
                                {record.final_cost ? formatCash(+record.final_cost || 0) : 0}
                              </div>
                            </Row>
                          </div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                  />
                </div>
                <Timeline style={{ marginTop: 30 }}>
                  {record.trackings?.map((e) => {
                    return (
                      <Timeline.Item>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 18 }}>{e.label}</div>
                          <div style={{ color: '#95a5a6' }}>
                            <div>{e.time_update ? e.time_update : 'Đang cập nhật'}</div>
                          </div>
                        </div>
                      </Timeline.Item>
                    )
                  })}
                </Timeline>
              </div>
            )
          },
        }}
        columns={columns.map((column) => {
          if (column.key === 'stt')
            return {
              ...column,
              width: 50,
              render: (text, record, index) =>
                (paramsFilter.page - 1) * paramsFilter.page_size + index + 1,
            }
          // if (column.key === 'address')
          //   return {
          //     ...column,
          //     sorter: (a, b) => compare(a, b, 'address'),
          //   }
          // if (column.key === 'phone')
          //   return {
          //     ...column,
          //     sorter: (a, b) => compare(a, b, 'phone'),
          //   }
          if (column.key === 'code')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'code'),
              render: (text, record) => (
                <a
                  style={{
                    color:
                      (record.bill_status === 'DRAFT' && 'black') ||
                      (record.bill_status === 'PROCESSING' && 'orange') ||
                      (record.bill_status === 'COMPLETE' && 'green') ||
                      (record.bill_status === 'CANCEL' && 'red') ||
                      (record.bill_status === 'REFUND' && '#ff7089'),
                  }}
                >
                  #{text}
                </a>
              ),
            }
          if (column.key === 'create_date')
            return {
              ...column,
              render: (text, record) => text && moment(text).format('DD/MM/YYYY HH:mm'),
              sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
            }
          if (column.key === 'customer')
            return {
              ...column,
              render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>
                    {record.customer_info
                      ? `${record.customer_info.first_name} ${record.customer_info.last_name}`
                      : record.customer
                      ? `${record.customer.first_name} ${record.customer.last_name}`
                      : ''}
                  </span>
                  <span>
                    {record.customer_info
                      ? record.customer_info.phone
                      : record.customer
                      ? record.customer.phone
                      : ''}
                  </span>
                  <span>
                    {record.customer_info
                      ? `${record.customer_info.province} ${record.customer_info.district} ${record.customer_info.address}`
                      : record.customer
                      ? `${record.customer.province} ${record.customer.district} ${record.customer.address}`
                      : 'Chưa có địa chỉ'}
                  </span>
                </div>
              ),
            }
          if (column.key === 'ship_status')
            return {
              ...column,
              render: (text) => {
                const status = statusShipping.find((s) => s.name === text)
                return status ? status.label : ''
              },
              sorter: (a, b) => compare(a, b, 'bill_status'),
            }
          if (column.key === 'shipping_code')
            return {
              ...column,
              render: (text, record) =>
                record.shipping_info && (
                  <ModalUpdateTrackingNumberOrShipping
                    id={record.order_id}
                    tracking_number={record.shipping_info?.tracking_number || ''}
                  >
                    {record.shipping_info?.tracking_number || 'Chưa có'}
                  </ModalUpdateTrackingNumberOrShipping>
                ),
            }
          if (column.key === 'shipping_name')
            return {
              ...column,
              render: (text, record) =>
                record.shipping_info && (
                  <ModalUpdateTrackingNumberOrShipping
                    id={record.order_id}
                    shipping={record.shipping_info?.shipping_name || ''}
                  >
                    {record.shipping_info?.shipping_name || 'Chưa có'}
                  </ModalUpdateTrackingNumberOrShipping>
                ),
            }
          if (column.key === 'total_cod')
            return {
              ...column,
              // render: (text, record) => record.shipping_info && record.shipping_info?.cod,
              render: (text, record) => record.total_cod && formatCash(record.total_cod),
            }
          if (column.key === 'fee_shipping')
            return {
              ...column,
              render: (text, record) =>
                record.shipping_info && formatCash(record.shipping_info?.fee_shipping),
            }
          return column
        })}
        style={{ width: '100%', marginTop: 25 }}
        pagination={{
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: countOrder,
        }}
        dataSource={orders}
      />
    </div>
  )
}
