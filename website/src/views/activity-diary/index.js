import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { ROUTES } from 'consts'
import { compare } from 'utils'

//antd
import { Input, Row, Col, Select, Table, Button } from 'antd'

//icons
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'

//components
import TitlePage from 'components/title-page'
import FilterDate from 'components/filter-date'

//apis
import { getActions, getActionLayouts } from 'apis/action'

export default function ActivityDiary() {
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [activityDiary, setActivityDiary] = useState([])
  const [layouts, setLayouts] = useState([])
  const typingTimeoutRef = useRef(null)
  const [valueSearch, setValueSearch] = useState('')
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [countAction, setCountAction] = useState(0)

  const onFilters = (attribute = '', value = '') => {
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
      if (value) paramsFilter.name = value
      else delete paramsFilter.name
      setParamsFilter({ ...paramsFilter, page: 1, page_size: 20 })
    }, 650)
  }

  const columns = [
    {
      title: 'STT',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên người dùng',
      sortDirections: ['descend'],
      render: (text, record) =>
        record.data ? `${record.data.first_name || ''} ${record.data.last_name || ''}` : '',
    },
    {
      title: 'Tên chức năng',
      dataIndex: 'name',
      sorter: (a, b) => compare(a, b, 'name'),
    },
    {
      title: 'Thao tác',
      dataIndex: 'type',
      sorter: (a, b) => compare(a, b, 'type'),
    },
    {
      title: 'Giao diện',
      dataIndex: 'properties',
      sorter: (a, b) => compare(a, b, 'properties'),
    },
    {
      title: 'Thời gian thao tác',
      dataIndex: 'date',
      defaultSortOrder: 'descend',

      render: (text, record) => (text ? moment(text).format('YYYY-MM-DD H:mm:ss') : ''),
      // sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
  ]

  const _getActionsHistory = async () => {
    try {
      setLoading(true)
      const res = await getActions(paramsFilter)
      if (res.status === 200) {
        setCountAction(res.data.count)
        setActivityDiary(res.data.data)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const _getActionLayouts = async () => {
    try {
      const res = await getActionLayouts()
      if (res.status === 200) setLayouts(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const onClickClear = async () => {
    setValueSearch('')
    setParamsFilter({ page: 1, page_size: 20 })
  }

  useEffect(() => {
    _getActionLayouts()
  }, [])

  useEffect(() => {
    _getActionsHistory()
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
            <ArrowLeftOutlined />
            <div style={{ marginLeft: 8 }}>Nhật ký hoạt động</div>
          </Row>
        }
      >
        <Button
          style={{ display: Object.keys(paramsFilter).length <= 2 && 'none' }}
          onClick={onClickClear}
          type="primary"
          size="large"
        >
          Xóa tất cả lọc
        </Button>
      </TitlePage>

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: '1rem',
          marginBottom: '1rem',
          marginLeft: '0px',
          marginRight: '0px',
          border: '1px solid #d9d9d9',
          borderRadius: 5,
        }}
      >
        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <Input
            prefix={<SearchOutlined />}
            style={{ width: '100%' }}
            name="name"
            value={valueSearch}
            enterButton
            onChange={onSearch}
            placeholder="Tìm kiếm theo tên chức năng"
            allowClear
            bordered={false}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={6}
          xl={6}
          style={{ borderLeft: '1px solid #d9d9d9', borderRight: '1px solid #d9d9d9' }}
        >
          <FilterDate paramsFilter={paramsFilter} setParamsFilter={setParamsFilter} />
        </Col>
        <Col xs={24} sm={24} md={12} lg={4} xl={4}>
          <Select
            value={paramsFilter.type}
            style={{ width: '100%', borderRight: '1px solid #d9d9d9' }}
            placeholder="Lọc thao tác"
            optionFilterProp="children"
            bordered={false}
            allowClear
            onChange={(value) => onFilters('type', value)}
          >
            <Select.Option value="CREATE">Tạo</Select.Option>
            <Select.Option value="UPDATE">Cập nhật</Select.Option>
            <Select.Option value="DELETE">Xóa</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
          <Select
            value={paramsFilter.menu}
            style={{ width: '100%' }}
            placeholder="Lọc giao diện"
            optionFilterProp="children"
            bordered={false}
            allowClear
            showSearch
            optionLabelProp="children"
            onChange={(value) => onFilters('menu', value)}
          >
            {layouts.map((layout, index) => (
              <Select.Option value={layout.name} key={index}>
                {layout.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        loading={loading}
        size="small"
        columns={columns}
        dataSource={activityDiary}
        style={{ width: '100%' }}
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: countAction,
        }}
      />
    </div>
  )
}
