import { SearchOutlined } from '@ant-design/icons'
//antd
import { Affix, Col, DatePicker, Input, Row, Select, Space, Table } from 'antd'
import { getEmployees } from 'apis/employee'
//apis
import { addShippingControlWithFile, getShippingControlList, getShippings } from 'apis/shipping'
import ImportCsv from 'components/ImportCSV'
import SettingColumns from 'components/setting-columns'
import TitlePage from 'components/title-page'
import { FILTER_COL_HEIGHT, FILTER_SIZE } from 'consts'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { compare, formatCash } from 'utils'
import columnsShippingControl from './columns'

export default function ShippingControl() {
  const history = useHistory()
  const typingTimeoutRef = useRef(null)

  const [valueSearch, setValueSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [countShippingControl, setCountShippingControl] = useState(0)
  const [shippingControlList, setShippingControlList] = useState([])
  const [shippingId, setShippingId] = useState('') //shipping id import
  const [shippings, setShippings] = useState([])
  console.log(shippings)
  const [employees, setEmployees] = useState([])
  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [columns, setColumns] = useState([])

  const columnsOrder = [
    {
      title: 'Mã vận đơn',
      render: (text, record) => record.tracking_number || '',
    },
    {
      title: 'Phí bảo hiểm',
      render: (text, record) => formatCash(record.fee_insurance || 0),
    },
    {
      title: 'Phí giao hàng',
      render: (text, record) => formatCash(record.fee_shipping || 0),
    },
    {
      title: 'Phí lưu Kho',
      render: (text, record) => formatCash(record.fee_warehouse || 0),
    },
    {
      title: 'Tiền COD',
      render: (text, record) => formatCash(record.cod || 0),
    },
    {
      title: 'Trạng thái',
      render: (text, record) => record.status || '',
    },
    {
      title: 'Khối lượng',
      render: (text, record) => record.weight || '',
    },
  ]

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

  const _onFilter = (attribute = '', value = '') => {
    if (value) paramsFilter[attribute] = value
    else delete paramsFilter[attribute]
    setParamsFilter({ ...paramsFilter, page: 1 })
  }

  const _getShippingControlList = async () => {
    try {
      setLoading(true)
      const res = await getShippingControlList(paramsFilter)
      console.log(res)
      if (res.status === 200) {
        setShippingControlList(res.data.data)
        setCountShippingControl(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _getShippings = async () => {
    try {
      setLoading(true)
      const res = await getShippings()
      console.log(res)
      if (res.status === 200) {
        setShippings(res.data.data)
        const defaultShippingId = res.data.data.find((item) => item.default === true)
        setShippingId(defaultShippingId.shipping_company_id)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _getEmployees = async () => {
    try {
      setLoading(true)
      const res = await getEmployees()
      if (res.status === 200) setEmployees(res.data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    _getShippingControlList()
  }, [paramsFilter])

  useEffect(() => {
    _getEmployees()
    _getShippings()
  }, [])

  return (
    <div className="card">
      <Affix offsetTop={60}>
        <TitlePage title="Đối soát vận chuyển">
          <Space>
            <ImportCsv
              size="large"
              shippingId={shippingId}
              txt="Import phiếu đối soát"
              upload={addShippingControlWithFile}
              title={
                <Row wrap={false} align="middle">
                  <div>Nhập phiếu đối soát bằng file excel</div>
                  <div style={{ marginLeft: 20 }}>
                    <p style={{ margin: 0, fontSize: 12 }}>Chọn đơn vị vận chuyển</p>
                    <Select
                      showSearch
                      optionFilterProp="children"
                      onChange={setShippingId}
                      value={shippingId}
                      defaultValue={shippingId}
                      placeholder="Chọn đơn vị vận chuyển"
                      style={{ width: 250 }}
                    >
                      {shippings.map((shipping, index) => (
                        <Select.Option value={shipping.shipping_company_id} key={index}>
                          {shipping.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Row>
              }
              fileTemplated="https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/03/13/d5937240-928b-46f1-b532-51e8f9cbed1d/file_mau_doi_soat.xlsx"
              reload={_getShippingControlList}
            />
            <SettingColumns
              columns={columns}
              setColumns={setColumns}
              columnsDefault={columnsShippingControl}
              nameColumn="columnsShippingControl"
            />
            {/* <Permission permissions={[PERMISSIONS.them_phieu_doi_soat_van_chuyen]}>
            <Button
              size="large"
              icon={<PlusCircleOutlined />}
              type="primary"
              onClick={() => history.push(ROUTES.SHIPPING_CONTROL_ADD)}
            >
              Thêm phiếu đối soát
            </Button>
          </Permission> */}
          </Space>
        </TitlePage>
      </Affix>
      <div style={{ marginTop: 10 }}>
        <Row style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 5 }}>
          <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
            <Input
              allowClear
              size={FILTER_SIZE}
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
              placeholder="Tìm kiếm theo mã phiếu"
              enterButton
              bordered={false}
              onChange={onSearch}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              size={FILTER_SIZE}
              allowClear
              bordered={false}
              placeholder="Lọc theo đơn vị vận chuyển"
              style={{ width: '100%', borderLeft: '1px solid #d9d9d9' }}
              value={paramsFilter.shipping_company_id}
              onChange={(value) => _onFilter('shipping_company_id', value)}
            >
              {shippings.map((shipping, index) => (
                <Select.Option value={shipping.shipping_company_id} key={index}>
                  {shipping.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              style={{
                width: '100%',
                borderLeft: '1px solid #d9d9d9',
                borderRight: '1px solid #d9d9d9',
              }}
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
              placeholder="Lọc theo thời gian tạo"
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
                  <DatePicker.RangePicker
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
              <Select.Option value="today">Hôm nay</Select.Option>
              <Select.Option value="yesterday">Hôm qua</Select.Option>
              <Select.Option value="this_week">Tuần này</Select.Option>
              <Select.Option value="last_week">Tuần trước</Select.Option>
              <Select.Option value="this_month">Tháng này</Select.Option>
              <Select.Option value="last_month">Tháng trước</Select.Option>
              <Select.Option value="this_year">Năm này</Select.Option>
              <Select.Option value="last_year">Năm trước</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              allowClear
              size={FILTER_SIZE}
              bordered={false}
              placeholder="Lọc theo người tạo phiếu"
              style={{ width: '100%' }}
              value={paramsFilter.employee_id}
              onChange={(value) => _onFilter('employee_id', value)}
            >
              {employees.map((employee, index) => (
                <Select.Option value={employee.user_id} key={index}>
                  {employee.first_name} {employee.last_name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Table
          dataSource={shippingControlList}
          loading={loading}
          scroll={{ y: 400 }}
          style={{ width: '100%', marginTop: 20 }}
          size="small"
          columns={columns.map((column) => {
            if (column.key === 'stt')
              return { ...column, render: (text, record, index) => index + 1 }
            if (column.key === 'code')
              return {
                ...column,
                render: (text, record) => <span>#{record.card_id}</span> || '',
                sort: (a, b) => compare(a, b, 'code'),
              }
            if (column.key === 'shipping_company')
              return {
                ...column,
                render: (text, record) =>
                  record.shipping_company ? record.shipping_company.name : '',
              }
            if (column.key === 'status')
              return {
                ...column,
                render: (text, record) => '',
              }
            if (column.key === 'file')
              return {
                ...column,
                render: (text, record) =>
                  record.link_file ? <a href={record.link_file}>Tải file</a> : '',
              }
            if (column.key === 'employee')
              return {
                ...column,
                render: (text, record) =>
                  record.employee
                    ? `${record.employee.first_name} ${record.employee.last_name}`
                    : '',
              }
            if (column.key === 'create_date')
              return {
                ...column,
                render: (text, record) =>
                  record.create_date && moment(record.create_date).format('DD/MM/YYYY HH:mm'),
              }
            return column
          })}
          rowKey="_id"
          expandable={{
            expandedRowRender: (record) => {
              return (
                <div style={{ marginTop: 25, marginBottom: 25 }}>
                  <Table
                    style={{ width: '100%' }}
                    pagination={false}
                    columns={columnsOrder}
                    dataSource={record.list_order || []}
                    size="small"
                  />
                </div>
              )
            },
          }}
          pagination={{
            position: ['bottomLeft'],
            current: paramsFilter.page,
            pageSize: paramsFilter.page_size,
            pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
            showQuickJumper: true,
            onChange: (page, pageSize) =>
              setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
            total: countShippingControl,
          }}
        />
      </div>
    </div>
  )
}
