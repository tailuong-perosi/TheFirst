import React, { useEffect, useState, useRef } from 'react'
import { FILTER_COL_HEIGHT, FILTER_SIZE, PERMISSIONS, ROUTES } from 'consts'
import { useHistory } from 'react-router-dom'
import { PlusCircleOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import moment from 'moment'
import { compare, compareCustom } from 'utils'
import { useSelector } from 'react-redux'

import {
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  Table,
  Space,
  Popconfirm,
  notification,
  Tag,
  Affix,
} from 'antd'

//components
import exportToCSV from 'components/ExportCSV/export'
import Permission from 'components/permission'
import TitlePage from 'components/title-page'
import SettingColumns from 'components/setting-columns'
import columnsProduct from './columns'
import ImportCsv from 'components/ImportCSV'

//apis
import { getAllBranch } from 'apis/branch'
import {
  getTransportOrders,
  deleteTransportOrder,
  updateTransportOrder,
  getStatusTransportOrder,
  addTransportOrderWithFile,
} from 'apis/transport'

const { Option } = Select
const { RangePicker } = DatePicker
export default function ShippingProduct() {
  const history = useHistory()
  const typingTimeoutRef = useRef(null)

  const branchIdApp = useSelector((state) => state.branch.branchId)
  const [exportLocationId, setExportLocationId] = useState('')
  const [importLocationId, setImportLocationId] = useState('')
  const [branches, setBranches] = useState([])
  const [columns, setColumns] = useState([])
  const [statusTransportOrder, setStatusTransportOrder] = useState([])
  const [totalTransportOrder, setTotalTransportOrder] = useState(0)
  const [transportOrders, setTransportOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)
  const [valueSearch, setValueSearch] = useState('')
  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})

  const _getTransportOrdersToExportExcel = async () => {
    let dataExport = []
    try {
      setLoading(true)
      const res = await getTransportOrders({ branch_id: branchIdApp })
      if (res.status === 200)
        res.data.data.map((e, index) => {
          console.log(index)
          e.products.map((product,) => {
            dataExport.push({
              "STT": index + 1,
              'Mã phiếu chuyển': e.code || '',
              'Mã sản phẩm (*)': product.product_info && (product.product_info.name || ''),
              'Mã phiên bản (*)': product.variant_info && (product.variant_info.sku || ''),
              'Tên nơi xuất hàng (*)':
                e.export_location_info && (e.export_location_info.name || ''),
              'Tên nhập xuất hàng (*)':
                e.import_location_info && (e.import_location_info.name || ''),
              'Số lượng (*)': product.quantity || 0,
              'Ngày xuất hàng': '',
              'Ngày nhập hàng': '',
              'Chi phí dịch vụ': 0,
              'Thuế (VND)': 0,
              'Chiết khấu (VND)': 0,
              'Tổng cộng (VND)':
                (product.quantity || 0) * (product.variant_info ? product.variant_info.price : 0),
              'Ghi chú': e.note || '',
            })
          }
          )
        })
      setLoading(false)
      console.log(dataExport)
      exportToCSV(dataExport, 'Danh sách phiếu chuyển')
    } catch (e) {
      setLoading(false)
    }
  }

  const _getTransportOrders = async () => {
    try {
      setLoading(true)
      const res = await getTransportOrders({ ...paramsFilter, branch_id: branchIdApp })
      console.log(res)
      if (res.status === 200) {
        setTransportOrders(res.data.data)
        setTotalTransportOrder(res.data.count)
      }
      setLoading(false)
    } catch (e) {
      console.log(e)
      setLoading(false)
    }
  }

  const _acceptTransportOrder = async (status = 'VERIFY', id) => {
    try {
      const body = { status: status }
      const res = await updateTransportOrder(body, id)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getTransportOrders()
          notification.success({ message: 'Cập nhật phiếu chuyển hàng thành công!' })
        } else
          notification.error({
            message: res.data.message || 'Cập nhật phiếu chuyển hàng thất bại, vui lòng thử lại!!',
          })
      } else
        notification.error({
          message: res.data.message || 'Cập nhật phiếu chuyển hàng thất bại, vui lòng thử lại!!',
        })
    } catch (error) {
      console.log(error)
    }
  }

  const _deleteTransportOrder = async (id) => {
    try {
      setLoading(true)
      const res = await deleteTransportOrder(id)
      setLoading(false)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getTransportOrders()
          notification.success({ message: 'Xóa phiếu chuyển hàng thành công!' })
        } else
          notification.error({
            message: res.data.message || 'Xóa phiếu chuyển hàng thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa phiếu chuyển hàng thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const _onFilters = (attribute = '', value = '') => {

    if (value) paramsFilter[attribute] = value
    else delete paramsFilter[attribute]

    setParamsFilter({ ...paramsFilter, page: 1 })
  }

  const onSearch = (e) => {
    setValueSearch(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value

      if (value) paramsFilter.code = value
      else delete paramsFilter.code

      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 750)
  }

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      console.log(res)
      if (res.status === 200) setBranches(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getStatus = async () => {
    try {
      const res = await getStatusTransportOrder()
      console.log(res)
      if (res.status === 200) setStatusTransportOrder(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getBranches()
    _getStatus()
  }, [])

  useEffect(() => {
    _getTransportOrders()
  }, [paramsFilter, branchIdApp])

  return (
    <div className="card">
      <Affix offsetTop={60}>
        <TitlePage title="Quản lý phiếu chuyển hàng">
          <Space>
            <Button
              onClick={_getTransportOrdersToExportExcel}
              icon={<DownloadOutlined />}
              style={{ backgroundColor: 'green', borderColor: 'green' }}
              type="primary"
              size="large"
            >
              Xuất excel
            </Button>
            <ImportCsv
              size="large"
              txt="Import phiếu chuyển hàng"
              upload={addTransportOrderWithFile}
              exportId={exportLocationId}
              importId={importLocationId}
              title={
                <Row wrap={false} align="middle">
                  <div>Nhập phiếu chuyển hàng bằng file excel</div>
                  <div style={{ marginLeft: 20 }}>
                    <p style={{ margin: 0, fontSize: 15 }}>Chọn chi nhánh gửi hàng</p>
                    <Select
                      showSearch
                      optionFilterProp="children"
                      onChange={(value) => setExportLocationId(value)}
                      value={exportLocationId}
                      // defaultValue={shippingId}
                      allowClear
                      placeholder="Chọn chi nhánh gửi hàng"
                      style={{ width: 250 }}
                    >
                      {branches.map((e, index) => (
                        <Select.Option value={e.branch_id} key={index}>
                          {e.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <p style={{ margin: 0, fontSize: 15 }}>Chọn chi nhánh nhận hàng</p>
                    <Select
                      showSearch
                      optionFilterProp="children"
                      allowClear
                      onChange={(value) => setImportLocationId(value)}
                      value={importLocationId}
                      // defaultValue={shippingId}
                      placeholder="Chọn chi nhánh gửi hàng"
                      style={{ width: 250 }}
                    >
                      {branches.map((e, index) => (
                        <Select.Option value={e.branch_id} key={index}>
                          {e.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Row>
              }
              fileTemplated="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/15/126ad172-797f-4bf1-bd8c-23e0ea98b70d/InventoryTransport.xlsx"
              reload={_getTransportOrders}
            />
            <SettingColumns
              columnsDefault={columnsProduct}
              nameColumn="columnsShippingProduct"
              columns={columns}
              setColumns={setColumns}
            />
            <Permission permissions={[PERMISSIONS.tao_phieu_chuyen_hang]}>
              <Button
                size="large"
                icon={<PlusCircleOutlined />}
                type="primary"
                onClick={() => history.push(ROUTES.SHIPPING_PRODUCT_ADD)}
              >
                Tạo phiếu chuyển hàng
              </Button>
            </Permission>
          </Space>
        </TitlePage>
      </Affix>
      <div>
        <Row
          style={{
            marginTop: '1rem',
            border: '1px solid #d9d9d9',
            borderRadius: 5,
            marginBottom: 10,
          }}
        >
          <Col xs={24} sm={24} md={12} lg={12} xl={5} style={{ height: FILTER_COL_HEIGHT }}>
            <Input
              value={valueSearch}
              placeholder="Tìm kiếm theo mã phiếu"
              onChange={onSearch}
              size={FILTER_SIZE}
              allowClear
              bordered={false}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={6}
            style={{
              borderLeft: '1px solid #d9d9d9',
              borderRight: '1px solid #d9d9d9',
              height: FILTER_COL_HEIGHT,
            }}
          >
            <Select
              size={FILTER_SIZE}
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
              placeholder="Lọc theo thời gian"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={valueTime}
              bordered={false}
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
          <Col xs={24} sm={24} md={12} lg={12} xl={4} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              allowClear
              size={FILTER_SIZE}
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
              value={paramsFilter.status}
              bordered={false}
              onChange={(value) => _onFilters('status', value)}
            >
              {statusTransportOrder.map((status, index) => (
                <Select.Option value={status.name} key={index}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={5}
            style={{
              borderLeft: '1px solid #d9d9d9',
              borderRight: '1px solid #d9d9d9',
              height: FILTER_COL_HEIGHT,
            }}
          >
            <Select
              allowClear
              size={FILTER_SIZE}
              placeholder="Lọc theo nơi chuyển"
              style={{ width: '100%' }}
              onChange={(value) => _onFilters('export_location_id', value)}
              bordered={false}
            >
              {branches.map((e, index) => (
                <Select.Option value={e.branch_id} key={index}>
                  {e.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={4} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              allowClear
              size={FILTER_SIZE}
              placeholder="Lọc theo nơi nhận"
              style={{ width: '100%' }}
              onChange={(value) => _onFilters('import_location_id', value)}
              bordered={false}
            >
              {branches.map((e, index) => (
                <Select.Option value={e.branch_id} key={index}>
                  {e.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row>
          <Button
            onClick={() => setParamsFilter({ page: 1, page_size: 20 })}
            style={{ display: Object.keys(paramsFilter).length === 2 && 'none' }}
            type="primary"
          >
            Xóa bộ lọc
          </Button>
        </Row>
      </div>

      <Table
        size="small"
        scroll={{ y: 400 }}
        loading={loading}
        columns={columns.map((column) => {
          if (column.key === 'stt') return { ...column, render: (data, record, index) => index + 1 }
          if (column.key === 'code')
            return {
              ...column,
              render: (text, record) => (
                <a
                  onClick={() =>
                    history.push({ pathname: ROUTES.SHIPPING_PRODUCT_ADD, state: record })
                  }
                >
                  {text}
                </a>
              ),
              sorter: (a, b) => compare(a, b, 'code'),
            }
          if (column.key === 'export_location')
            return {
              ...column,
              render: (text, record) =>
                record.export_location_info && record.export_location_info.name,
            }
          if (column.key === 'import_location')
            return {
              ...column,
              render: (text, record) =>
                record.import_location_info && record.import_location_info.name,
            }
          if (column.key === 'verify_date')
            return {
              ...column,
              render: (data) => data && moment(data).format('DD-MM-YYYY hh:mm'),
              sorter: (a, b) => moment(a.verify_date).unix() - moment(b.verify_date).unix(),
            }
          if (column.key === 'delivery_time')
            return {
              ...column,
              render: (data) => moment(data).format('DD-MM-YYYY hh:mm'),
              sorter: (a, b) => moment(a.delivery_time).unix() - moment(b.delivery_time).unix(),
            }
          if (column.key === 'create_date')
            return {
              ...column,
              render: (data) => moment(data).format('DD-MM-YYYY hh:mm'),
              sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
            }
          if (column.key === '_creator')
            return {
              ...column,
              sorter: (a, b) =>
                compareCustom(
                  a._creator ? `${a._creator.first_name} ${a._creator.last_name}` : '',
                  b._creator ? `${b._creator.first_name} ${b._creator.last_name}` : ''
                ),
              render: (text) => text && text.first_name + ' ' + text.last_name,
            }
          if (column.key === 'status')
            return {
              ...column,
              render: (text) => {
                const status = statusTransportOrder.find((s) => s.name === text)
                return status ? status.label : ''
              },
              sorter: (a, b) => compare(a, b, 'status'),
            }
          if (column.key === 'action')
            return {
              ...column,
              render: (text, record) => (
                <Space>
                  {(record.status === 'VERIFY' && (
                    <Popconfirm
                      onConfirm={() => _acceptTransportOrder('COMPLETE', record.order_id)}
                      okText="Đồng ý"
                      cancelText="Từ chối"
                      title="Bạn có muốn hoàn thành phiếu chuyển hàng này không?"
                    >
                      <Button type="primary">Hoàn thành</Button>
                    </Popconfirm>
                  )) ||
                    (record.status === 'DRAFT' && (
                      <Popconfirm
                        onConfirm={() => _acceptTransportOrder('VERIFY', record.order_id)}
                        okText="Đồng ý"
                        cancelText="Từ chối"
                        title="Bạn có muốn xác nhận phiếu chuyển hàng này không?"
                      >
                        <Button type="primary">Xác nhận phiếu</Button>
                      </Popconfirm>
                    ))}
                  <Popconfirm
                    okText="Đồng ý"
                    cancelText="Từ chối"
                    onConfirm={() => _deleteTransportOrder(record.order_id)}
                    title="Bạn có muốn xóa phiếu chuyển hàng này không?"
                  >
                    <Button icon={<DeleteOutlined />} danger type="primary" />
                  </Popconfirm>
                </Space>
              ),
            }
          return column
        })}
        rowKey="order_id"
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: totalTransportOrder,
        }}
        dataSource={transportOrders}
        style={{ width: '100%', marginTop: 10 }}
      />
    </div>
  )
}
