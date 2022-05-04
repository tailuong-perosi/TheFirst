import React, { useState, useEffect, useRef } from 'react'
import { FILTER_COL_HEIGHT, FILTER_SIZE, PERMISSIONS } from 'consts'
import moment from 'moment'
import { compare } from 'utils'

//antd
import {
  DatePicker,
  Select,
  Input,
  Button,
  Table,
  Row,
  Col,
  Space,
  Popconfirm,
  notification,
  Affix,
} from 'antd'

//icons
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'

//components
import Permission from 'components/permission'
import TitlePage from 'components/title-page'
import SupplierForm from './supplier-form'
import columnsSupplier from './columns'
import SettingColumns from 'components/setting-columns'

//apis
import { getEmployees } from 'apis/employee'
import { getProvinces, getDistricts } from 'apis/address'
import { getSuppliers, deleteSupplier } from 'apis/supplier'

const { Option } = Select
export default function Supplier() {
  const typingTimeoutRef = useRef(null)

  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(false)
  const [valueSearch, setValueSearch] = useState('')

  const [countSupplier, setCountSupplier] = useState(0)
  const [suppliers, setSuppliers] = useState([])
  const [users, setUsers] = useState([])
  const [districts, setDistricts] = useState([])
  const [provinces, setProvinces] = useState([])

  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })

  const onSearch = (e) => {
    const value = e.target.value

    setValueSearch(value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (value) paramsFilter.search = value
      else delete paramsFilter.search

      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 650)
  }

  const _deleteSupplier = async (id) => {
    try {
      setLoading(true)
      const res = await deleteSupplier(id)
      console.log(res)
      setLoading(false)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xóa nhà cung cấp thành công!' })
          _getSuppliers()
        } else
          notification.error({
            message: res.data.message || 'Xóa nhà cung cấp thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa nhà cung cấp thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _getSuppliers = async () => {
    try {
      setLoading(true)
      const res = await getSuppliers({ ...paramsFilter, _creator: true })
      console.log(res)
      if (res.status === 200) {
        setSuppliers(res.data.data)
        setCountSupplier(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const onClickClear = () => {
    setValueSearch('')
    setParamsFilter({ page: 1, page_size: 20 })
  }

  const _getDistricts = async () => {
    try {
      setLoading(true)
      const res = await getDistricts()
      if (res.status === 200) setDistricts(res.data.data)

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const _getProvinces = async () => {
    try {
      setLoading(true)
      const res = await getProvinces()
      if (res.status === 200) setProvinces(res.data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const _getUsers = async () => {
    try {
      const res = await getEmployees()
      if (res.status === 200) setUsers(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getSuppliers()
  }, [paramsFilter])

  useEffect(() => {
    _getProvinces()
    _getDistricts()
    _getUsers()
  }, [])

  const _onFilter = async (attribute = '', value = '') => {
    if (value) paramsFilter[attribute] = value
    else delete paramsFilter[attribute]

    paramsFilter.page = 1
    setParamsFilter({ ...paramsFilter })
  }

  return (
    <div className="card">
      <Affix offsetTop={60}>
        <TitlePage title="Quản lý nhà cung cấp">
          <Space>
            <SettingColumns
              nameColumn="columnsSupplier"
              columns={columns}
              setColumns={setColumns}
              columnsDefault={columnsSupplier}
            />
            <SupplierForm reloadData={_getSuppliers}>
              <Permission permissions={[PERMISSIONS.them_nha_cung_cap]}>
                <Button size="large" type="primary" icon={<PlusCircleOutlined />}>
                  Thêm nhà cung cấp
                </Button>
              </Permission>
            </SupplierForm>
          </Space>
        </TitlePage>
      </Affix>
      <Row style={{ marginTop: '1rem', border: '1px solid #d9d9d9', borderRadius: 5 }}>
        <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
          <Input
            value={valueSearch}
            size={FILTER_SIZE}
            enterButton
            onChange={onSearch}
            placeholder="Tìm kiếm theo mã, theo tên"
            allowClear
            bordered={false}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={6}
          lg={6}
          xl={6}
          style={{
            borderLeft: '1px solid #d9d9d9',
            borderRight: '1px solid #d9d9d9',
            height: FILTER_COL_HEIGHT,
          }}
        >
          <Select
            allowClear
            style={{ width: '100%' }}
            showSearch
            size={FILTER_SIZE}
            placeholder="Lọc theo tỉnh/thành phố"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={paramsFilter.province}
            onChange={(value) => _onFilter('province', value)}
            bordered={false}
          >
            {provinces.map((province, index) => (
              <Option value={province.province_name} key={index}>
                {province.province_name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
          <Select
            allowClear
            showSearch
            size={FILTER_SIZE}
            style={{ width: '100%', borderRight: '1px solid #d9d9d9' }}
            placeholder="Lọc theo quận/huyện"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={paramsFilter.district}
            onChange={(value) => _onFilter('district', value)}
            bordered={false}
          >
            {districts.map((district, index) => (
              <Option value={district.district_name} key={index}>
                {district.district_name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
          <Select
            allowClear
            showSearch
            size={FILTER_SIZE}
            style={{ width: '100%' }}
            placeholder="Lọc theo người tạo"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={paramsFilter.creator_id}
            onChange={(value) => _onFilter('creator_id', value)}
            bordered={false}
          >
            {users.map((user, index) => (
              <Option value={user.user_id} key={index}>
                {user.first_name || ''} {user.last_name || ''}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row style={{ marginTop: '1rem' }}>
        <Col style={{ display: Object.keys(paramsFilter).length < 3 && 'none' }}>
          <Button onClick={onClickClear} type="primary">
            Xóa tất cả lọc
          </Button>
        </Col>
      </Row>

      <Table
        style={{ marginTop: 12, width: '100%' }}
        scroll={{ y: 400 }}
        size="small"
        rowKey="_id"
        // rowSelection={rowSelection}
        columns={columns.map((column) => {
          if (column.key === 'stt') return { ...column, render: (text, record, index) => index + 1 }
          if (column.key === 'code')
            return {
              ...column,
              render: (text, record) => (
                <SupplierForm reloadData={_getSuppliers} record={record}>
                  <a>{text}</a>
                </SupplierForm>
              ),
              sorter: (a, b) => compare(a, b, 'code'),
            }
          if (column.key === 'name') return { ...column, sorter: (a, b) => compare(a, b, 'name') }
          if (column.key === 'create_date')
            return {
              ...column,
              render: (text, record) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : ''),
              sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
            }
          if (column.key === 'email') return { ...column, sorter: (a, b) => compare(a, b, 'email') }
          if (column.key === 'phone') return { ...column, sorter: (a, b) => compare(a, b, 'phone') }
          if (column.key === 'address')
            return {
              ...column,
              render: (text, record) =>
                `${record.address && record.address + ', '}${
                  record.district && record.district + ', '
                }${record.province && record.province}`,
            }
          if (column.key === 'creator')
            return {
              ...column,
              render: (text, record) =>
                record._creator && record._creator.first_name + ' ' + record._creator.last_name,
              sorter: (a, b) =>
                (a._creator && a._creator.first_name + ' ' + a._creator.last_name).length -
                (b._creator && b._creator.first_name + ' ' + b._creator.last_name).length,
            }
          if (column.key === 'action')
            return {
              ...column,
              render: (text, record) => (
                <Popconfirm
                  onConfirm={() => _deleteSupplier(record.supplier_id)}
                  title="Bạn có muốn xóa nhà cung cấp này không?"
                  okText="Đồng ý"
                  cancelText="Từ chối"
                >
                  <Button type="primary" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            }

          return column
        })}
        dataSource={suppliers}
        loading={loading}
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            paramsFilter.page = page
            paramsFilter.page_size = pageSize
            setParamsFilter({ ...paramsFilter })
          },
          total: countSupplier,
        }}
      />
    </div>
  )
}
