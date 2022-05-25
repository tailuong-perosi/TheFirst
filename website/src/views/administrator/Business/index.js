import React, { useEffect, useState, useRef } from 'react'

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
  Tooltip,
} from 'antd'
import { SearchOutlined, ArrowLeftOutlined, DeleteOutlined,ContactsTwoTone } from '@ant-design/icons'

//apis
import { getBusinesses, deleteBusinesses } from 'apis/business'
import { getRoles } from 'apis/role'

//components
import TitlePage from 'components/title-page'
import EmployeeForm from './employee-form'
import SettingColumns from 'components/setting-columns'
import columnsA from './colum'

const { Option } = Select
export default function Employee() {
  const typingTimeoutRef = useRef(null)
  const history = useHistory()
  const dispatch = useDispatch()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [roles, setRoles] = useState([])
  const [columns, setColumns] = useState([])
  const [business, setBusiness] = useState([])
  const [countBusiness, setCountBusiness] = useState([])
  const [loading, setLoading] = useState(false)
  const [Address, setAddress] = useState({ province: [], district: [] })
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [valueDateSearch, setValueDateSearch] = useState(null)
  const [valueSearch, setValueSearch] = useState('')
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

  const _deleteBusiness = async (id) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await deleteBusinesses(id)
      dispatch({ type: ACTION.LOADING, data: false })

      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xóa cửa hàng thành công' })
            ()
        } else
          notification.error({
            message: res.data.message || 'Xóa cửa hàng thất bại, vui lòng thử lại',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa cửa hàng thất bại, vui lòng thử lại',
        })
    } catch (err) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(err)
    }
  }
  const _getBusuiness = async () => {
    try {
      setLoading(true)
      const res = await getBusinesses({ ...paramsFilter })
      console.log(res)
      if (res.status === 200) {
        // const employees = res.data.data.filter((employee) => employee.role_id !== 1)
        setBusiness(res.data.data)
        setCountBusiness(res.data.count)
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

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  // const _getRoles = async () => {
  //   try {
  //     const res = await getRoles()
  //     if (res.status === 200) {
  //       const roles = res.data.data.filter((e) => e.role_id !== 1)
  //       setRoles([...roles])
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // useEffect(() => {
  //   _getBranches()
  //   _getRoles()
  //   _getProvinces()
  //   _getDistricts()
  // }, [])

  // useEffect(() => {
  //   getAddress(getProvinces, setAddress, 'province')
  //   getAddress(getDistricts, setAddress, 'district')
  // }, [])

  useEffect(() => {
    _getBusuiness()
  }, [paramsFilter])

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
            <div>Quản lý cửa hàng</div>
          </Row>
        }
      >
        <Space>
          <SettingColumns
            columns={columns}
            setColumns={setColumns}
            columnsDefault={columnsA}
            nameColumn="columnsA"
          />
          <EmployeeForm
            reloadData={_getBusuiness}
          // roles={roles}
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
            placeholder="Tìm kiếm tên cửa hàng"
            onChange={onSearch}
            value={valueSearch}
            bordered={false}
          />
        </Col>
      </Row>

      <Table
        loading={loading}
        rowKey="business_id"
        size="small"
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: countBusiness,
        }}
        columns={columns.map((column) => {
          if (column.key === 'stt') return { ...column, render: (text, record, index) => index + 1 }
          if (column.key === 'name')
            return {
              ...column,
              render: (text, record) => (
                <EmployeeForm
                  record={record}
                  reloadData={_getBusuiness}
                  roles={roles}
                >
                  <a>{record.business_name}</a>
                </EmployeeForm>
              ),
            }
          if (column.key === 'name')
            return { ...column, sorter: (a, b) => compare(a, b, 'phone') }
          if (column.key === 'address')
            return {
              ...column,
              render: (text, record) =>
                record.address
            }
          if(column.key === 'phone') return {...column, render: (text, record) => record.company_phone}
          if (column.key === 'profile') return { ...column, sorter: (a, b) => compare(a, b, 'profile') }
          if (column.key === 'status')
            return {

              ...column,
              render: (data, record) => (record.status ,
                <Select defaultValue={record.status}  style={{ width: 120 }} onChange={handleChange}>
                  <Option value="active">active</Option>
                  <Option value="band">band</Option>
                  <Option value="warnning" >warnning</Option>
                  <Option value="block">block</Option>
                  <Option value="waiting for review">waiting for review</Option>
                </Select>
              )
            }
          if (column.key === 'action')
            return {
              ...column,
              render: (text, record) => (
                <Space>
                  <Tooltip>
                <Popconfirm
                  title="Bạn có muốn xóa nhân viên này không?"
                  okText="Đồng ý"
                  cancelText="Từ chối"
                  onConfirm={() => _deleteBusiness(record.user_id)}
                >
                  <Button icon={<DeleteOutlined />} type="primary" danger />
                  
                </Popconfirm>
                </Tooltip>
                <Tooltip>
                <Button  icon={<ContactsTwoTone />} type='primary' />
                </Tooltip>
                </Space>
              ),
            }

          return column
        })}
        dataSource={business}
        style={{ width: '100%', marginTop: 10 }}
      />
    </div>
  )
}