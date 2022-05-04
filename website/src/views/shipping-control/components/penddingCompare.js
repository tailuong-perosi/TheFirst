import React, { useEffect, useState } from 'react'
import { Input, Row, Col, DatePicker, Select, Table, Typography } from 'antd'
import moment from 'moment'
import ImportFile from './ImportFile'
import { compare, tableSum } from 'utils'
const { Option } = Select
const { RangePicker } = DatePicker
const { Text } = Typography
export default function PenddingCompare(props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const [filter, setFilter] = useState({
    keyword: '',
    from_date: moment().startOf('month').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
    branch: '',
  })
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)
  const { compareList } = props
  const penddingCompareColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order',
      width: 150,
      sorter: (a, b) => compare(a, b, 'order'),
    },
    {
      title: 'Mã vận đơn',
      dataIndex: 'code',
      width: 150,
      sorter: (a, b) => compare(a, b, 'code'),
    },
    {
      title: 'Đơn vị vận chuyển',
      dataIndex: 'shipping_company',
      width: 150,
      sorter: (a, b) => compare(a, b, 'shipping_company'),
    },
    {
      title: 'Tên khách hàng',
      width: 150,
      sorter: (a, b) => compare(a, b, 'name'),
    },
    {
      title: 'Mã số khách',
      width: 150,
      sorter: (a, b) => compare(a, b, 'customer_id'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'revice_date',
      width: 150,
      sorter: (a, b) => moment(a.revice_date).unix() - moment(b.revice_date).unix(),
    },
    {
      title: 'Tiền CoD',
      dataIndex: 'cod_cost',
      width: 150,
      sorter: (a, b) => compare(a, b, 'cod_cost'),
    },
    {
      title: 'Tiền chuyển khoản',
      dataIndex: 'transfer_cost',
      width: 150,
      sorter: (a, b) => compare(a, b, 'transfer_cost'),
    },
    {
      title: 'Ghi chú đơn',
      dataIndex: 'note',
      width: 150,
      sorter: (a, b) => compare(a, b, 'note'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (data) => (
        <span
          style={
            data.toLowerCase() == 'processing'
              ? { color: 'orange' }
              : data.toLowerCase() == 'complete'
                ? { color: 'green' }
                : { color: 'red' }
          }
        >
          {data}
        </span>
      ),
      sorter: (a, b) => compare(a, b, 'status'),
    },
  ]
  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }
  const onSearch = (value) => props.setFilter({ ...filter, keyword: value.target.value })
  const changeRange = (date, dateString) => {
    props.setFilter({
      ...filter,
      from_date: dateString[0],
      to_date: dateString[1],
    })
  }
  const changeTimeOption = (value) => {
    switch (value) {
      case 'to_day':
        props.setFilter({
          ...filter,
          from_date: moment().format('YYYY-MM-DD'),
          to_date: moment().format('YYYY-MM-DD'),
        })
        break
      case 'yesterday':
        props.setFilter({
          ...filter,
          from_date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
          to_date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
        })
        break
      case 'this_week':
        props.setFilter({
          ...filter,
          from_date: moment().startOf('week').format('YYYY-MM-DD'),
          to_date: moment().endOf('week').format('YYYY-MM-DD'),
        })
        break
      case 'last_week':
        props.setFilter({
          ...filter,
          from_date: moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'),
          to_date: moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD'),
        })
        break
      case 'this_month':
        props.setFilter({
          ...filter,
          from_date: moment().startOf('month').format('YYYY-MM-DD'),
          to_date: moment().format('YYYY-MM-DD'),
        })
        break
      case 'last_month':
        props.setFilter({
          ...filter,
          from_date: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
          to_date: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
        })
        break
      case 'this_year':
        props.setFilter({
          ...filter,
          from_date: moment().startOf('years').format('YYYY-MM-DD'),
          to_date: moment().endOf('years').format('YYYY-MM-DD'),
        })
        break
      case 'last_year':
        props.setFilter({
          ...filter,
          from_date: moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
          to_date: moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
        })
        break
      default:
        props.setFilter({
          ...filter,
          from_date: moment().startOf('month').format('YYYY-MM-DD'),
          to_date: moment().format('YYYY-MM-DD'),
        })
        break
    }
  }

  return (
    <div>
      <Row
        style={{
          width: '100%',
          marginTop: '1rem', border: '1px solid #d9d9d9', borderRadius: 5
        }}
      >
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Input
            style={{ width: '100%' }}
            placeholder="Tìm kiếm theo mã, theo tên"
            onChange={onSearch}
            enterButton
            bordered={false}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} style={{ borderLeft: '1px solid #d9d9d9', borderRight: '1px solid #d9d9d9' }}>
          <Select
            open={isOpenSelect}
            onBlur={() => {
              if (isOpenSelect) toggleOpenSelect()
            }}
            onClick={() => {
              if (!isOpenSelect) toggleOpenSelect()
            }}
            style={{ width: '100%' }}
            placeholder="Chọn ngày"
            allowClear
            bordered={false}
            onChange={async (value) => {
              if (isOpenSelect) toggleOpenSelect()
              changeTimeOption(value)
            }}
            dropdownRender={(menu) => (
              <div>
                <RangePicker
                  onFocus={() => {
                    if (!isOpenSelect) toggleOpenSelect()
                  }}
                  onBlur={() => {
                    if (isOpenSelect) toggleOpenSelect()
                  }}
                  style={{ width: '100%' }}
                  onChange={changeRange}
                />
                {menu}
              </div>
            )}
          >
            <Option value="to_day">Today</Option>
            <Option value="yesterday">Yesterday</Option>
            <Option value="this_week">This week</Option>
            <Option value="last_week">Last week</Option>
            <Option value="last_month">Last month</Option>
            <Option value="this_month">This month</Option>
            <Option value="this_year">This year</Option>
            <Option value="last_year">Last year</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Select
            placeholder="Chọn chi nhánh"
            style={{ width: '100%' }}
            onChange={(e) =>
              props.setFilter({
                ...filter,
                branch: e,
              })
            }
            bordered={false}
          >
            {props.branchList
              .filter((e) => e.active)
              .map((e) => (
                <Option value={e.branch_id}>{e.name}</Option>
              ))}
          </Select>
        </Col>
      </Row>

      <Row
        justify="end"
        style={{
          marginTop: 15,
          width: '100%',
        }}
      >
        <ImportFile />
      </Row>
      <div
        style={{
          width: '100%',
          marginTop: '1rem',
          border: '1px solid rgb(243, 234, 234)',
        }}
      >
        <Table
          size="small"
          rowSelection={rowSelection}
          columns={penddingCompareColumns}
          style={{ width: '100%' }}
          dataSource={compareList.filter((e) =>
            e.status ? e.status.toLowerCase() != 'complete' : false
          )}
          scroll={{ y: 500 }}
          rowKey="_id"
          summary={(pageData) => {
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell> {tableSum(pageData, 'cod_cost')} VND</Table.Summary.Cell>
                  <Table.Summary.Cell>{tableSum(pageData, 'transfer_cost')} VND</Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )
          }}
        />
      </div>
    </div>
  )
}
