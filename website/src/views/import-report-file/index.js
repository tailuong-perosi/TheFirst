import { ArrowLeftOutlined } from '@ant-design/icons'
import { Col, DatePicker, Input, Row, Select, Table } from 'antd'
import TitlePage from 'components/title-page'
import { FILTER_SIZE, ROUTES } from 'consts'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import dataTest from './datatest'

//apis
import { getFileHistory } from 'apis/action'

export default function ImportReportFile() {
  const history = useHistory()

  const [paramsFilter, setParamsFilter] = useState({ this_week: true, page: 1, page_size: 20 })
  const [fileActionList, setFileActionList] = useState([])

  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({ this_week: true })
  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [tableLoading, setTableLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('file_name')
  const [totalRecord, setTotalRecord] = useState(0)
  const typingTimeoutRef = useRef()
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)

  // const _getFileHistory = async (params) => {
  //   try {
  //     const res = await getFileHistory(paramsFilter)
  //     console.log(res)
  //     if (res.status === 200) setFileActionList(res.data.data)
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  // }

  const _search = (e) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(async () => {
      const value = e.target.value

      //khi search hoac filter thi reset page ve 1
      paramsFilter.page = 1
      delete paramsFilter.file_name
      delete paramsFilter.action_name
      if (value) paramsFilter[searchKey] = value
      else delete paramsFilter[searchKey]

      setParamsFilter({ ...paramsFilter })
    }, 450)
  }
  const _getFileAction = async (params) => {
    try {
      setTableLoading(true)
      const res = await getFileHistory(params)
      if (res.data.success) {
        setFileActionList(res.data.data)
        setTotalRecord(res.data.count)
      }
      setTableLoading(false)
    } catch (err) {
      setTableLoading(false)
      console.log(err)
    }
  }
  useEffect(() => {
      _getFileAction(paramsFilter)
    }, [paramsFilter])

  const _onChangeDate = (dates, dateStrings) => {
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
      delete paramsFilter.startDate
      delete paramsFilter.endDate
      setValueDateSearch(null)
      setValueTime()
    } else {
      const dateFirst = dateStrings[0]
      const dateLast = dateStrings[1]
      setValueDateSearch(dates)
      setValueTime(`${dateFirst} -> ${dateLast}`)

      dateFirst.replace(/-/g, '/')
      dateLast.replace(/-/g, '/')

      paramsFilter.startDate = dateFirst
      paramsFilter.endDate = dateLast
    }

    setParamsFilter({ ...paramsFilter })
  }

  const _onChangeTime = (value) => {
    setValueTime(value)

    //khi search hoac filter thi reset page ve 1
    paramsFilter.page = 1

    //xoa params search date hien tai
    const p = Object.keys(valueDateTimeSearch)
    if (p.length) delete paramsFilter[p[0]]

    setValueDateSearch(null)
    delete paramsFilter.startDate
    delete paramsFilter.endDate

    if (isOpenSelect) toggleOpenSelect()

    if (value) {
      const searchDate = Object.fromEntries([[value, true]]) // them params search date moi
      setParamsFilter({ ...paramsFilter, ...searchDate })
      setValueDateTimeSearch({ ...searchDate })
    } else {
      setParamsFilter({ ...paramsFilter })
      setValueDateTimeSearch({})
    }
  }

  const columns = [
    {
      title: 'STT',
      render(data, record, index) {
        return (paramsFilter.page - 1) * paramsFilter.page_size + index + 1
      },
      width: 70,
      align: 'center',
    },
    {
      title: 'Tên file',
      dataIndex: 'file_name',
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'creator_info',
      render(data) {
        return data && data.name && data.name
      },
    },
    {
      title: 'Thời gian thao tác',
      dataIndex: 'create_date',
      render: (data) => moment(data).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Thao tác',
      dataIndex: 'action_name',
    },
    {
      title: 'Hành động',
      dataIndex: 'links',
      render: (data) => (
        <a href={data[0]} download={true} style={{ color: '#0017E3' }}>
          Tải xuống
        </a>
      ),
    },
  ]

  return (
    <div className="card">
      <TitlePage
        isAffix={true}
        title={
          <Row
            wrap={false}
            align="middle"
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Quản lý xuất/nhập
          </Row>
        }
      ></TitlePage>

      <Row justify="space-between" gutter={[16, 16]} style={{ margin: '20px 0px' }}>
        <Col
          xs={24}
          sm={24}
          md={10}
          lg={10}
          xl={10}
          style={{
            marginTop: '1rem',
          }}
        >
          <Input.Group style={{ width: '100%' }}>
            <Row style={{
              width: '100%',
              border: '1px solid #d9d9d9',
              borderRadius: 5,
            }}>
              <Col span={16}>
                <Input
                  size={FILTER_SIZE}
                  allowClear
                  enterButton
                  placeholder="Tìm kiếm theo"
                  onChange={_search}
                  style={{ width: '100%' }}
                  bordered={false}
                />
              </Col>
              <Col span={8}>
                <Select
                  size={FILTER_SIZE}
                  style={{
                    width: '100%',
                    borderLeft: '1px solid #d9d9d9',
                  }}
                  showSearch
                  value={searchKey}
                  onChange={(e) => setSearchKey(e)}
                  bordered={false}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                // suffixIcon={<SuffixIconCustom />}
                >
                  <Select.Option value="file_name">Tên file</Select.Option>
                  <Select.Option value="action_name">Thao tác</Select.Option>
                </Select>
              </Col>
            </Row>
          </Input.Group>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={14}
          lg={14}
          xl={14}
          style={{
            marginTop: '1rem',
          }}
        >
          <Row style={{
            border: '1px solid #d9d9d9',
            borderRadius: 5,
          }}>
            <Col span={12}>
              <Select
                dropdownClassName="dropdown-select-custom"
                //   suffixIcon={<SuffixIconCustom />}
                open={isOpenSelect}
                onBlur={() => {
                  if (isOpenSelect) toggleOpenSelect()
                }}
                onClick={() => {
                  if (!isOpenSelect) toggleOpenSelect()
                }}
                style={{ width: '100%', borderRight: '1px solid #d9d9d9' }}
                placeholder="Lọc theo thời gian"
                allowClear
                size={FILTER_SIZE}
                bordered={false}
                value={valueTime}
                onChange={_onChangeTime}
                dropdownRender={(menu) => (
                  <div>
                    <DatePicker.RangePicker
                      dropdownClassName="dropdown-datepicker-custom"
                      className="datepicker-custom"
                      onFocus={() => {
                        if (!isOpenSelect) toggleOpenSelect()
                      }}
                      onBlur={() => {
                        if (isOpenSelect) toggleOpenSelect()
                      }}
                      value={valueDateSearch}
                      onChange={_onChangeDate}
                      style={{ width: '100%' }}
                    />
                    {menu}
                  </div>
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
            <Col span={12}>
              <Select
                showSearch
                size={FILTER_SIZE}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: '100%' }}
                allowClear
                bordered={false}
                placeholder="Lọc theo thao tác"
                //   suffixIcon={<SuffixIconCustom />}
                onChange={(e) => setParamsFilter({ ...paramsFilter, type: e })}
              >
                <Select.Option value="IMPORT">Nhập file</Select.Option>
                <Select.Option value="EXPORT">Xuất file</Select.Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>

      <Table
        size="small"
        scroll={{ y: '56vh' }}
        style={{ width: '100%', marginTop: '1rem' }}
        columns={columns}
        dataSource={fileActionList}
        loading={tableLoading}
        pagination={{
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          total: totalRecord,
          onChange: ({ page, page_size }) => setParamsFilter({ ...paramsFilter, page, page_size }),
        }}
      />
    </div>
  )
}
