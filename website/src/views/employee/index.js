import React, { useEffect, useState, useRef } from 'react'

import moment from 'moment'
import { compare } from 'utils'
import { useDispatch, useSelector } from 'react-redux'
import { ACTION, ROUTES } from 'consts'
import { useHistory } from 'react-router-dom'

//antd
import {
  Popconfirm,
  Input,
  Row,
  Col,
  Select,
  Table,
  Button,
  Space,
  notification,
  DatePicker,
} from 'antd'
import { SearchOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons'

//apis
import { getEmployees, deleteEmployee } from 'apis/employee'
import { getDistricts, getProvinces } from 'apis/address'
import { getAllBranch } from 'apis/branch'
import { getRoles } from 'apis/role'

//components
import TitlePage from 'components/title-page'
import EmployeeForm from './employee-form'
import SettingColumns from 'components/setting-columns'
import columnsEmployee from './columns'

const { Option } = Select
export default function Employee() {
  const typingTimeoutRef = useRef(null)
  const history = useHistory()
  const dispatch = useDispatch()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [roles, setRoles] = useState([])
  const [districts, setDistricts] = useState([])
  const [branches, setBranches] = useState([])
  const [provinces, setProvinces] = useState([])
  const [columns, setColumns] = useState([])
  const [users, setUsers] = useState([])
  const [countUser, setCountUser] = useState([])
  const [loading, setLoading] = useState(false)
  const [Address, setAddress] = useState({ province: [], district: [] })
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [valueDateSearch, setValueDateSearch] = useState(null)
  const [valueSearch, setValueSearch] = useState('')
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)

  const _onFilter = (attribute = '', value = '') => {
    if (value) paramsFilter[attribute] = value
    else delete paramsFilter[attribute]
    setParamsFilter({ ...paramsFilter, page: 1 })
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

      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 650)
  }

  const _clearFilters = () => {
    setParamsFilter({ page: 1, page_size: 20 })
    setValueSearch('')
    setValueTime()
    setValueDateTimeSearch({})
    setValueDateSearch(null)
  }

  const _deleteUser = async (id) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await deleteEmployee(id)
      dispatch({ type: ACTION.LOADING, data: false })

      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xóa nhân viên thành công' })
          _getEmployees()
        } else
          notification.error({
            message: res.data.message || 'Xóa nhân viên không thất bại, vui lòng thử lại',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa nhân viên không thất bại, vui lòng thử lại',
        })
    } catch (err) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(err)
    }
  }
  const _getEmployees = async () => {
    try {
      setLoading(true)
      const res = await getEmployees({ ...paramsFilter, branch_id: branchIdApp })
      console.log(res)
      if (res.status === 200) {
        // const employees = res.data.data.filter((employee) => employee.role_id !== 1)
        setUsers(res.data.data)
        setCountUser(res.data.count)
        console.log('res.data.data', res.data.data)
      }
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  }
  const getAddress = async (api, callback, key, params) => {
    try {
      const res = await api(params)
      if (res.status === 200) {
        callback((e) => {
          return { ...e, [key]: res.data.data }
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  const _getDistricts = async () => {
    try {
      const res = await getDistricts()
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

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) setBranches(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getRoles = async () => {
    try {
      const res = await getRoles()
      if (res.status === 200) {
        const roles = res.data.data.filter((e) => e.role_id !== 1)
        setRoles([...roles])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getBranches()
    _getRoles()
    _getProvinces()
    _getDistricts()
  }, [])

  useEffect(() => {
    getAddress(getProvinces, setAddress, 'province')
    getAddress(getDistricts, setAddress, 'district')
  }, [])

  useEffect(() => {
    _getEmployees()
  }, [paramsFilter, branchIdApp])

  return (
    <div className="card">
      <TitlePage
        title={
          <Row
            align="middle"
            onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
            style={{ cursor: 'pointer' }}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            <div>Quản lý nhân viên</div>
          </Row>
        }
      >
        <Space>
          <SettingColumns
            columns={columns}
            setColumns={setColumns}
            columnsDefault={columnsEmployee}
            nameColumn="columnsEmployee"
          />
          <EmployeeForm
            reloadData={_getEmployees}
            roles={roles}
            provinces={provinces}
            districts={districts}
            branches={branches}
          >
            <Button type="primary" size="large">
              Tạo nhân viên
            </Button>
          </EmployeeForm>
        </Space>
      </TitlePage>
      <Row
        gutter={[16, 16]}
        style={{ marginTop: 15, border: '1px solid #d9d9d9', borderRadius: 5 }}
      >
        <Col xs={24} sm={24} md={12} lg={12} xl={6}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo tên nhân viên"
            onChange={onSearch}
            value={valueSearch}
            bordered={false}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          xl={6}
          style={{ borderLeft: '1px solid #d9d9d9', borderRight: '1px solid #d9d9d9' }}
        >
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="Chọn tỉnh/thành phố"
            showSearch
            onChange={(value) => _onFilter('province', value)}
            value={paramsFilter.province}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            bordered={false}
          >
            {Address.province.map((e, index) => (
              <Option value={e.province_name} key={index}>
                {e.province_name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ borderRight: '1px solid #d9d9d9' }}>
          <Select
            allowClear
            showSearch
            style={{ width: '100%' }}
            placeholder="Chọn quận/huyện"
            optionFilterProp="children"
            value={paramsFilter.district}
            onChange={(value) => _onFilter('district', value)}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            bordered={false}
          >
            {Address.district
              .filter((e) => !paramsFilter.province || e.province_name === paramsFilter.province)
              .map((e, index) => (
                <Option value={e.district_name} key={index}>
                  {e.district_name}
                </Option>
              ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={6}>
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
            placeholder="Lọc theo thời gian"
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
      </Row>
      <Row style={{ width: '100%', marginTop: 15 }} justify="space-between">
        <Button
          style={{ display: Object.keys(paramsFilter).length < 3 && 'none' }}
          onClick={_clearFilters}
          type="primary"
        >
          Xóa bộ lọc
        </Button>
      </Row>

      <Table
        loading={loading}
        rowKey="user_id"
        size="small"
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: countUser,
        }}
        columns={columns.map((column) => {
          if (column.key === 'stt') return { ...column, render: (text, record, index) => index + 1 }
          if (column.key === 'name')
            return {
              ...column,
              render: (text, record) => (
                <EmployeeForm
                  record={record}
                  reloadData={_getEmployees}
                  roles={roles}
                  provinces={provinces}
                  districts={districts}
                  branches={branches}
                >
                  <a>{record.first_name + ' ' + record.last_name}</a>
                </EmployeeForm>
              ),
            }
          if (column.key === 'phone')
            return { ...column, sorter: (a, b) => compare(a, b, 'username') }
          if (column.key === 'address')
            return {
              ...column,
              render: (text, record) =>
                `${record.address && record.address + ', '}${
                  record.district && record.district + ', '
                }${record.province && record.province}`,
            }
          if (column.key === 'birth_day')
            return {
              ...column,
              sorter: (a, b) => moment(a.birth_day).unix() - moment(b.birth_day).unix(),
              render: (data) => data && moment(data).format('DD/MM/YYYY'),
            }
          if (column.key === 'email') return { ...column, sorter: (a, b) => compare(a, b, 'email') }
          if (column.key === 'create_date')
            return {
              ...column,
              sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
              render: (data) => data && moment(data).format('DD/MM/YYYY HH:mm'),
            }
          if (column.key === 'role')
            return {
              ...column,
              render: (data, record) => record._role && record._role.name,
            }
          if (column.key === 'action')
            return {
              ...column,
              render: (text, record) => (
                <Popconfirm
                  title="Bạn có muốn xóa nhân viên này không?"
                  okText="Đồng ý"
                  cancelText="Từ chối"
                  onConfirm={() => _deleteUser(record.user_id)}
                >
                  <Button icon={<DeleteOutlined />} type="primary" danger />
                </Popconfirm>
              ),
            }

          return column
        })}
        dataSource={users}
        style={{ width: '100%', marginTop: 10 }}
      />
    </div>
  )
}
