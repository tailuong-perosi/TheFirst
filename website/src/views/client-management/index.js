import React, { useEffect, useState, useRef } from 'react'

import styles from './client-management.module.scss'
import moment from 'moment'
import { compare } from 'utils'
import { useDispatch } from 'react-redux'
import { ACTION } from 'consts'

//antd
import { Popconfirm, Input, Row, Col, Select, Table, Button, notification, DatePicker } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

//apis
import { getBusinesses, deleteBusinesses } from 'apis/business'
import { getDistricts, getProvinces } from 'apis/address'

//components
import TitlePage from 'components/title-page'
import ClientForm from './client-form'

const { Option } = Select
export default function ClientManagement() {
  const typingTimeoutRef = useRef(null)
  const dispatch = useDispatch()

  const [users, setUsers] = useState([])
  const [countUser, setCountUser] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
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

  const columnsClient = [
    {
      title: 'Tên client',
      render: (text, record) => (
        <ClientForm record={record} reloadData={_getUsers}>
          <a>{record.first_name + ' ' + record.last_name}</a>
        </ClientForm>
      ),
    },
    {
      title: 'Số điện thoại',
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
      title: 'Ngày sinh',
      dataIndex: 'birthday',
      sorter: (a, b) => moment(a.birthday).unix() - moment(b.birthday).unix(),
      render: (data) => data && moment(data).format('DD/MM/YYYY'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => compare(a, b, 'email'),
    },
    {
      title: 'Thời gian đăng kí',
      dataIndex: 'create_date',
      sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
      render: (data) => data && moment(data).format('DD/MM/YYYY HH:mm'),
    },
  ]

  const _clearFilters = () => {
    setParamsFilter({ page: 1, page_size: 20 })
    setValueSearch('')
    setValueTime()
    setValueDateTimeSearch({})
    setValueDateSearch(null)
  }

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const _deleteUsers = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await deleteBusinesses({ system_user_id: selectedRowKeys })
      dispatch({ type: ACTION.LOADING, data: false })

      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xóa khách hàng thành công' })
          _getUsers()
        } else
          notification.error({
            message: res.data.message || 'Xóa khách hàng không thất bại, vui lòng thử lại',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa khách hàng không thất bại, vui lòng thử lại',
        })
    } catch (err) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(err)
    }
  }
  const _getUsers = async () => {
    try {
      setLoading(true)
      setSelectedRowKeys([])
      const res = await getBusinesses(paramsFilter)
      console.log(res)
      if (res.status === 200) {
        //chỉ lấy danh sách role business
        setUsers(res.data.data.filter((e) => e.role_id === 2))
        setCountUser(res.data.count)
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

  useEffect(() => {
    getAddress(getProvinces, setAddress, 'province')
    getAddress(getDistricts, setAddress, 'district')
  }, [])

  useEffect(() => {
    _getUsers()
  }, [paramsFilter])
  return (
    <>
      <div className={`${styles['promotion_manager']} ${styles['card']}`}>
        <TitlePage title="Quản lý client">
          <ClientForm reloadData={_getUsers}>
            <Button type="primary" size="large">
              Tạo client
            </Button>
          </ClientForm>
        </TitlePage>
        <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
          <Col xs={24} sm={24} md={12} lg={12} xl={6}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm tên client"
              onChange={onSearch}
              value={valueSearch}
              size="large"
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={6}>
            <Select
              allowClear
              size="large"
              style={{ width: '100%' }}
              placeholder="Chọn tỉnh/thành phố"
              showSearch
              onChange={(value) => _onFilter('province', value)}
              value={paramsFilter.province}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {Address.province.map((e, index) => (
                <Option value={e.province_name} key={index}>
                  {e.province_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={6}>
            <Select
              allowClear
              size="large"
              showSearch
              style={{ width: '100%' }}
              placeholder="Chọn quận/huyện"
              optionFilterProp="children"
              value={paramsFilter.district}
              onChange={(value) => _onFilter('district', value)}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
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
              size="large"
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
          <div style={{ visibility: !selectedRowKeys.length && 'hidden' }}>
            <Popconfirm
              title="Bạn có muốn xóa các client này?"
              okText="Đồng ý"
              cancelText="Từ chối"
              onConfirm={_deleteUsers}
            >
              <Button size="large" type="primary" danger>
                Xóa client
              </Button>
            </Popconfirm>
          </div>

          <Button
            style={{ display: Object.keys(paramsFilter).length < 3 && 'none' }}
            size="large"
            onClick={_clearFilters}
            type="primary"
          >
            Xóa bộ lọc
          </Button>
        </Row>

        <Table
          loading={loading}
          rowSelection={rowSelection}
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
          columns={columnsClient}
          dataSource={users}
          style={{ width: '100%', marginTop: 10 }}
        />
      </div>
    </>
  )
}
