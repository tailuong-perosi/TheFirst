import styles from './store.module.scss'
import React, { useState, useEffect, useRef } from 'react'
import { ACTION, ROUTES, PERMISSIONS } from 'consts'
import { useDispatch } from 'react-redux'
import moment from 'moment'
import noimage from 'assets/img/noimage.jpg'
import { compare } from 'utils'

//antd
import {
  Switch,
  Input,
  Row,
  DatePicker,
  Col,
  notification,
  Select,
  Table,
  Popover,
  Button,
} from 'antd'

//icons
import { PlusCircleOutlined } from '@ant-design/icons'

//components
import StoreForm from './store-form'
import Permission from 'components/permission'

//apis
import { getDistricts, getProvinces } from 'apis/address'
import { getAllStore, updateStore } from 'apis/store'
import { getEmployees } from 'apis/employee'

const { Option } = Select
const { RangePicker } = DatePicker
export default function Store() {
  const dispatch = useDispatch()
  const typingTimeoutRef = useRef(null)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [countStore, setCountStore] = useState(0)
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })

  const [valueDateFilter, setValueDateFilter] = useState(null)
  function onChangeDate(dates, dateStrings) {
    if (dates) {
      setValueDateFilter(dates)
      paramsFilter.from_date = dateStrings[0]
      paramsFilter.to_date = dateStrings[1]
    } else {
      setValueDateFilter(null)
      delete paramsFilter.from_date
      delete paramsFilter.to_date
    }

    paramsFilter.page = 1
    setParamsFilter({ ...paramsFilter })
  }
  const [valueSearch, setValueSearch] = useState('')
  const onSearch = (e) => {
    setValueSearch(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value
      if (value) paramsFilter.search = value
      else delete paramsFilter.search

      paramsFilter.page = 1
      setParamsFilter({ ...paramsFilter })
    }, 750)
  }

  const openNotificationSuccessStoreDelete = (data) => {
    notification.success({
      message: 'Thành công',
      duration: 3,
      description:
        data === 2 ? 'Vô hiệu hóa cửa hàng thành công.' : 'Kích hoạt cửa hàng thành công',
    })
  }

  const updateStoreData = async (object, id, data) => {
    try {
      setLoading(true)
      const res = await updateStore(object, id)
      console.log(res)
      if (res.status === 200) {
        await _getStores()
        setSelectedRowKeys([])
        openNotificationSuccessStoreDelete(data)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  function onChangeSwitch(checked, record) {
    console.log(`switch to ${checked}`)
    updateStoreData({ ...record, active: checked }, record.store_id, checked ? 1 : 2)
  }

  const _getStores = async (params) => {
    try {
      setLoading(true)
      setSelectedRowKeys([])
      const res = await getAllStore({ ...params, _creator: true })
      console.log(res)
      if (res.status === 200) {
        setStore(res.data.data)
        setCountStore(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const contentImage = (data) => (
    <img src={data} style={{ width: '25rem', height: '15rem', objectFit: 'contain' }} alt="" />
  )
  const columns = [
    {
      title: 'Mã cửa hàng',
      render: (text, record) => (
        <StoreForm infoStoreUpdate={record} reloadData={_getStores}>
          <a>{record.code}</a>
        </StoreForm>
      ),
      sorter: (a, b) => compare(a, b, 'code'),
    },
    {
      title: 'Ảnh',
      dataIndex: 'logo',
      render: (text, record) =>
        text ? (
          <Popover content={() => contentImage(text)}>
            <div>
              <img src={text} style={{ width: 70, height: 70, objectFit: 'cover' }} alt="" />
            </div>
          </Popover>
        ) : (
          <img
            src={noimage}
            style={{ width: '6.75rem', height: '5rem', objectFit: 'cover' }}
            alt=""
          />
        ),
    },
    {
      title: 'Tên cửa hàng',
      dataIndex: 'name',
      render: (text, record) => <div>{text}</div>,
      sorter: (a, b) => compare(a, b, 'name'),
    },

    {
      title: 'Liên hệ',
      dataIndex: 'phone',
      sorter: (a, b) => compare(a, b, 'phone'),
    },
    {
      title: 'Địa chỉ',
      render: (text, record) =>
        `${record.address && record.address + ', '}${record.district && record.district + ', '}${
          record.province && record.province
        }`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'create_date',
      render: (text, record) => (text ? moment(text).format('DD-MM-YYYY HH:mm') : ''),
      sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
    },
    {
      title: 'Người tạo',
      render: (text, record) => record._creator.first_name + ' ' + record._creator.last_name,
      sorter: (a, b) =>
        (a._creator && a._creator.first_name + ' ' + a._creator.last_name).length -
        (b._creator && b._creator.first_name + ' ' + b._creator.last_name).length,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      fixed: 'right',
      width: 100,
      render: (text, record) =>
        text ? (
          <Switch defaultChecked onChange={(e) => onChangeSwitch(e, record)} />
        ) : (
          <Switch onChange={(e) => onChangeSwitch(e, record)} />
        ),
    },
  ]

  const onClickClear = async () => {
    setParamsFilter({ page: 1, page_size: 20 })
    setValueSearch('')
    setValueDateFilter(null)
    setSelectedRowKeys([])
  }

  const [provinceMain, setProvinceMain] = useState([])
  const [districtMain, setDistrictMain] = useState([])
  const apiDistrictData = async (query) => {
    try {
      const res = await getDistricts(query)
      if (res.status === 200) {
        setDistrictMain(res.data.data)
      }
      // if (res.status === 200) setUsers(res.data);
    } catch (error) {}
  }
  const _getProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.status === 200) {
        setProvinceMain(res.data.data)
      }
    } catch (error) {}
  }

  const _getUsers = async () => {
    try {
      const res = await getEmployees()
      console.log(res)
      if (res.status === 200) {
        setUsers(res.data.data)
      }
    } catch (error) {}
  }

  useEffect(() => {
    _getProvinces()
    _getUsers()
  }, [])

  useEffect(() => {
    apiDistrictData({ search: paramsFilter.province })
  }, [paramsFilter.province])

  useEffect(() => _getStores({ ...paramsFilter }), [paramsFilter])

  return (
    <div className={`${styles['promotion_manager']} ${styles['card']}`}>
      <Row
        wrap={false}
        align="middle"
        justify="space-between"
        style={{ borderBottom: '1px solid rgb(236, 226, 226)', paddingBottom: '0.75rem' }}
      >
        <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>Quản lý cửa hàng</div>
        {/* <Permission permissions={[PERMISSIONS.them_cua_hang]}> */}
        <StoreForm reloadData={_getStores}>
          <Button size="large" icon={<PlusCircleOutlined />} type="primary">
            Thêm cửa hàng
          </Button>
        </StoreForm>
        {/* </Permission> */}
      </Row>

      <Row justify="space-between">
        <Col style={{ marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
          <Input
            size="large"
            style={{ width: '100%' }}
            name="name"
            value={valueSearch}
            enterButton
            onChange={onSearch}
            placeholder="Tìm kiếm theo mã, theo tên"
            allowClear
          />
        </Col>

        <Col style={{ marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
          <Select
            size="large"
            showSearch
            allowClear
            style={{ width: '100%' }}
            placeholder="Chọn tỉnh/thành phố"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => {
              if (value) paramsFilter.province = value
              else delete paramsFilter.province
              paramsFilter.page = 1
              setParamsFilter({ ...paramsFilter })
            }}
            value={paramsFilter.province}
          >
            {provinceMain.map((values, index) => (
              <Option value={values.province_name} key={index}>
                {values.province_name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col style={{ marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
          <Select
            size="large"
            showSearch
            allowClear
            style={{ width: '100%' }}
            placeholder="Chọn quận/huyện"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={paramsFilter.district}
            onChange={(value) => {
              if (value) paramsFilter.district = value
              else delete paramsFilter.district

              paramsFilter.page = 1
              setParamsFilter({ ...paramsFilter })
            }}
          >
            {districtMain.map((values, index) => (
              <Option value={values.district_name} key={index}>
                {values.district_name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col style={{ marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
          <RangePicker
            size="large"
            className="br-15__date-picker"
            value={valueDateFilter}
            style={{ width: '100%' }}
            ranges={{
              Today: [moment(), moment()],
              'This Month': [moment().startOf('month'), moment().endOf('month')],
            }}
            onChange={onChangeDate}
          />
        </Col>
        <Col style={{ marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
          <Select
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            showSearch
            size="large"
            placeholder="Chọn người tạo"
            style={{ width: '100%' }}
            value={paramsFilter.creator_id}
            onChange={(value) => {
              if (value) paramsFilter.creator_id = value
              else delete paramsFilter.creator_id

              paramsFilter.page = 1
              setParamsFilter({ ...paramsFilter })
            }}
          >
            {users.map((user, index) => (
              <Select.Option key={index} value={user.user_id}>
                {user.first_name || ''} {user.last_name || ''}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row
        justify="end"
        style={{ marginTop: 15, display: Object.keys(paramsFilter).length < 3 && 'none' }}
      >
        <Button onClick={onClickClear} type="primary" size="large">
          Xóa tất cả lọc
        </Button>
      </Row>

      <Table
        size="small"
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={store}
        style={{ width: '100%', marginTop: 20 }}
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 50, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            paramsFilter.page = page
            paramsFilter.page_size = pageSize
            setParamsFilter({ ...paramsFilter })
          },
          total: countStore,
        }}
      />
    </div>
  )
}
