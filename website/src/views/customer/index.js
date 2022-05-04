import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { PERMISSIONS } from 'consts'
import { useSelector } from 'react-redux'
import { compare, formatCash } from 'utils'

//antd
import {
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  Table,
  notification,
  Space,
  Popconfirm,
  Modal,
  Affix,
} from 'antd'

//icons
import { DeleteOutlined, DownloadOutlined, PlusCircleOutlined } from '@ant-design/icons'

//components
import CustomerForm from './customer-form'
import Permission from 'components/permission'
import SettingColumns from 'components/setting-columns'
import columnsCustomer from './columns'
import TitlePage from 'components/title-page'
import exportCustomers from 'components/ExportCSV/export'
import ImportCSV from 'components/ImportCSV'

//apis
import { getCustomers, deleteCustomer, getCustomerTypes, importCustomers } from 'apis/customer'

const { Option } = Select
const { RangePicker } = DatePicker
export default function Customer() {
  const typingTimeoutRef = useRef(null)
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [columns, setColumns] = useState([])
  const [countCustomer, setCountCustomer] = useState(0)
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [tableLoading, setTableLoading] = useState(false)

  const [customers, setCustomers] = useState([])
  const [customerTypes, setCustomerTypes] = useState([])

  const [valueSearch, setValueSearch] = useState('')
  const [optionSearch, setOptionSearch] = useState('name')

  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)

  const onSearch = (e) => {
    setValueSearch(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value

      if (value) paramsFilter[optionSearch] = value
      else delete paramsFilter[optionSearch]

      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 750)
  }
  function onChangeTypeCustomer(value) {
    if (value) paramsFilter.type_id = value
    else delete paramsFilter.type_id
    setParamsFilter({ page: 1, ...paramsFilter })
  }

  const ModalCustomer = ({ children, record }) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)

    return (
      <>
        <div onClick={toggle}>{children}</div>
        <Modal
          style={{ top: 20 }}
          onCancel={toggle}
          width={800}
          footer={null}
          title={`${record ? 'Cập nhật' : 'Tạo'} khách hàng`}
          visible={visible}
        >
          <CustomerForm
            record={record}
            close={toggle}
            text={record ? 'Lưu' : 'Tạo'}
            reload={_getCustomers}
          />
        </Modal>
      </>
    )
  }

  const _getCustomerToExport = async () => {
    let dataExport = []
    try {
      setTableLoading(true)
      const res = await getCustomers({ branch_id: branchIdApp })
      if (res.status === 200) {
        dataExport = res.data.data.map((item, index) => ({
          STT: index + 1,
          'Mã khách hàng': item.code || '',
          'Tên khách hàng': (item.first_name || '') + ' ' + (item.last_name || ''),
          'Loại khách hàng': item._type ? item._type.name : '',
          'Liên hệ': item.phone || '',
          'Tổng số đơn hàng': item.order_quantity || 0,
          'Điểm tích luỹ': item.point || 0,
          'Số điểm đã dùng': item.used_point || 0,
          'Tổng chi tiêu tại cửa hàng': item.order_total_cost || 0,
          'Ngày tạo': item.create_date ? moment(item.create_date).format('DD-MM-YYYY HH:mm') : '',
          'Ngày sinh': item.birthday ? moment(item.birthday).format('DD-MM-YYYY') : '',
          'Địa chỉ': `${item.address && item.address + ', '}${item.district && item.district + ', '
            }${item.province && item.province}`,
        }))
      }
      setTableLoading(false)
      exportCustomers(dataExport, 'Danh sách khách hàng')
    } catch (e) {
      console.log(e)
      setTableLoading(false)
    }
  }

  const _getCustomers = async () => {
    try {
      setTableLoading(true)
      const res = await getCustomers({ ...paramsFilter, branch_id: branchIdApp })
      console.log(res)
      if (res.status === 200) {
        setCustomers(res.data.data)
        setCountCustomer(res.data.count)
        console.log("resss",res.data.data)
      }
      setTableLoading(false)
    } catch (e) {
      console.log(e)
      setTableLoading(false)
    }
  }

  const _deleteCustomer = async (id) => {
    try {
      setTableLoading(true)
      const res = await deleteCustomer(id)
      console.log(res)
      setTableLoading(false)
      if (res.status === 200) {
        if (res.data.success) {
          _getCustomers()
          notification.success({ message: 'Xóa khách hàng thành công!' })
        } else
          notification.error({
            message: res.data.message || 'Xóa khách hàng thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa khách hàng thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      console.log(error)
      setTableLoading(false)
    }
  }

  const _getCustomerTypes = async () => {
    try {
      const res = await getCustomerTypes()
      if (res.status === 200) setCustomerTypes(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getCustomerTypes()
  }, [])

  useEffect(() => {
    _getCustomers()
  }, [paramsFilter, branchIdApp])

  return (
    <div className="card">
      <Affix offsetTop={60}>
        <TitlePage title="Quản lý khách hàng">
          <Space>
            <Button
              onClick={_getCustomerToExport}
              icon={<DownloadOutlined />}
              style={{ backgroundColor: 'green', borderColor: 'green' }}
              type="primary"
              size="large"
            >
              Xuất excel
            </Button>
            <ImportCSV
              size="large"
              txt="Nhập khách hàng"
              upload={importCustomers}
              title="Nhập khách hàng bằng file excel"
              fileTemplated="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/01/16/d5f3fe01-765d-40d0-9d8b-62ffaf61e057/CustomerImport.xlsx"
              reload={_getCustomers}
            />
            <SettingColumns
              columnsDefault={columnsCustomer}
              setColumns={setColumns}
              columns={columns}
              nameColumn="columnsCustomer"
            />
            <Permission permissions={[PERMISSIONS.them_khach_hang]}>
              <ModalCustomer>
                <Button
                  size="large"
                  icon={<PlusCircleOutlined style={{ fontSize: '1rem' }} />}
                  type="primary"
                >
                  Thêm khách hàng
                </Button>
              </ModalCustomer>
            </Permission>
          </Space>
        </TitlePage>
      </Affix>
      <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
        <Col xs={24} sm={24} md={24} lg={10} xl={10}>
          <Row wrap={false} style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 5 }}>
            <Input
              style={{ width: '100%', borderRight: '1px solid #d9d9d9' }}
              placeholder="Tìm kiếm theo..."
              value={valueSearch}
              onChange={(e) => onSearch(e)}
              allowClear
              bordered={false}
            />
            <Select
              style={{ width: 180 }}
              value={optionSearch}
              onChange={(value) => {
                delete paramsFilter[optionSearch]
                setOptionSearch(value)
              }}
              bordered={false}
            >
              <Option value="name">Tên khách hàng</Option>
              <Option value="phone">SDT khách hàng</Option>
              <Option value="code">Mã khách hàng</Option>
            </Select>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={14} xl={14}>
          <Row style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 5 }}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              xl={12}
              style={{ borderRight: '1px solid #d9d9d9' }}
            >
              <Select
                open={isOpenSelect}
                onBlur={() => {
                  if (isOpenSelect) toggleOpenSelect()
                }}
                onClick={() => {
                  if (!isOpenSelect) toggleOpenSelect()
                }}
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Lọc theo ngày tạo"
                optionFilterProp="children"
                bordered={false}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={valueTime}
                onChange={async (value) => {
                  setValueTime(value)

                  paramsFilter.page = 1

                  //xoa params search date hien tai
                  const p = Object.keys(valueDateTimeSearch)
                  if (p.length) delete paramsFilter[p[0]]

                  setValueDateSearch(null)
                  delete paramsFilter.from_date
                  delete paramsFilter.to_date

                  if (isOpenSelect) toggleOpenSelect()

                  if (value) {
                    const searchDate = Object.fromEntries([[value, true]]) // them params search date moi

                    setParamsFilter({ ...paramsFilter, ...searchDate })
                    setValueDateTimeSearch({ ...searchDate })
                  } else {
                    setParamsFilter({ ...paramsFilter })
                    setValueDateTimeSearch({})
                  }
                }}
                dropdownRender={(menu) => (
                  <>
                    <RangePicker
                      onFocus={() => {
                        if (!isOpenSelect) toggleOpenSelect()
                      }}
                      onBlur={() => {
                        if (isOpenSelect) toggleOpenSelect()
                      }}
                      value={valueDateSearch}
                      onChange={(dates, dateStrings) => {
                        //khi search hoac filter thi reset page ve 1
                        paramsFilter.page = 1

                        if (isOpenSelect) toggleOpenSelect()

                        //nếu search date thì xoá các params date
                        delete paramsFilter.to_day
                        delete paramsFilter.yesterday
                        delete paramsFilter.this_week
                        delete paramsFilter.last_week
                        delete paramsFilter.last_month
                        delete paramsFilter.this_month
                        delete paramsFilter.this_year
                        delete paramsFilter.last_year

                        //Kiểm tra xem date có được chọn ko
                        //Nếu ko thì thoát khỏi hàm, tránh cash app
                        //và get danh sách order
                        if (!dateStrings[0] && !dateStrings[1]) {
                          delete paramsFilter.from_date
                          delete paramsFilter.to_date

                          setValueDateSearch(null)
                          setValueTime()
                        } else {
                          const dateFirst = dateStrings[0]
                          const dateLast = dateStrings[1]
                          setValueDateSearch(dates)
                          setValueTime(`${dateFirst} -> ${dateLast}`)

                          dateFirst.replace(/-/g, '/')
                          dateLast.replace(/-/g, '/')

                          paramsFilter.from_date = dateFirst
                          paramsFilter.to_date = dateLast
                        }

                        setParamsFilter({ ...paramsFilter })
                      }}
                      style={{ width: '100%' }}
                    />
                    {menu}
                  </>
                )}
              >
                <Option value="today">Hôm nay</Option>
                <Option value="yesterday">Hôm qua</Option>
                <Option value="this_week">Tuần này</Option>
                <Option value="last_week">Tuần trước</Option>
                <Option value="this_month">Tháng này</Option>
                <Option value="last_month">Tháng trước</Option>
                <Option value="this_year">Năm này</Option>
                <Option value="last_year">Năm trước</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Select
                style={{ width: '100%' }}
                placeholder="Lọc theo loại khách hàng"
                value={paramsFilter.type}
                onChange={onChangeTypeCustomer}
                allowClear
                bordered={false}
                showSearch
                optionFilterProp="children"
              >
                {customerTypes.map((type, index) => (
                  <Option value={type.type_id} key={index}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>

      <Table
        style={{ width: '100%', marginTop: 10 }}
        rowKey="customer_id"
        scroll={{ y: 400 }}
        loading={tableLoading}
        columns={columns.map((column) => {
          if (column.key === 'stt')
            return {
              ...column,
              render: (text, record, index) => index + 1,
            }
          if (column.key === 'code')
            return {
              ...column,
              render: (text, record) => (
                <ModalCustomer record={record}>
                  <a>{record.code}</a>
                </ModalCustomer>
              ),
              sorter: (a, b) => compare(a, b, 'code'),
            }
          if (column.key === 'name')
            return {
              ...column,
              render: (text, record) => <p>{record.first_name + ' ' + record.last_name}</p>,
              sorter: (a, b) => a.first_name.length - b.first_name.length,
            }
          if (column.key === 'type')
            return {
              ...column,
              render: (text, record) => record._type ? record._type.name : '',
              sorter: (a, b) => compare(a, b, 'type'),
            }
          if (column.key === 'phone')
            return {
              ...column,
              render: (text, record) => record.phone || '',
              sorter: (a, b) => compare(a, b, 'phone'),
            }
          if (column.key === 'point')
            return {
              ...column,
              render: (text, record) => record.point && formatCash(record.point),
              sorter: (a, b) => compare(a, b, 'point'),
            }
          if (column.key === 'used_point')
            return {
              ...column,
              render: (text, record) => record.used_point && formatCash(record.used_point),
              sorter: (a, b) => compare(a, b, 'used_point'),
            }
          if (column.key === 'order_quantity')
            return {
              ...column,
              render: (text, record) => record.order_quantity && formatCash(record.order_quantity),
              sorter: (a, b) => compare(a, b, 'order_quantity'),
            }
          if (column.key === 'order_total_cost')
            return {
              ...column,
              render: (text, record) =>
                record.order_total_cost && formatCash(record.order_total_cost),
              sorter: (a, b) => compare(a, b, 'order_total_cost'),
            }
          if (column.key === 'create_date')
            return {
              ...column,
              render: (text, record) =>
                record.create_date && moment(record.create_date).format('DD-MM-YYYY HH:mm'),
              sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
            }
          if (column.key === 'birthday')
            return {
              ...column,
              render: (text, record) =>
                record.birthday && moment(record.birthday).format('DD-MM-YYYY'),
              sorter: (a, b) => moment(a.birthday || '').unix() - moment(b.birthday || '').unix(),
            }
          if (column.key === 'address')
            return {
              ...column,
              render: (text, record) =>
                `${record.address && record.address + ', '}${record.district && record.district + ', '
                }${record.province && record.province}`,
              sorter: (a, b) => compare(a, b, 'address'),
            }
          if (column.key === 'action')
            return {
              ...column,
              render: (text, record) => (
                <Permission permissions={[PERMISSIONS.cap_nhat_khach_hang]}>
                  <Popconfirm
                    title="Bạn có muốn xóa khách hàng này không?"
                    cancelText="Từ chối"
                    okText="Đồng ý"
                    onConfirm={() => _deleteCustomer(record.customer_id)}
                  >
                    <Button danger type="primary" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Permission>
              ),
            }

          return column
        })}
        dataSource={customers}
        size="small"
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 70, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize })
          },
          total: countCustomer,
        }}
      />
    </div>
  )
}
