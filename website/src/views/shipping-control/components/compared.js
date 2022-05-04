import {
  Col,
  Row,
  Input,
  DatePicker,
  Select,
  Button,
  Table,
  Checkbox,
  Typography,
} from 'antd'
import ImportFile from './ImportFile'
import moment from 'moment'
import { useState, useEffect } from 'react'
import Modal from 'antd/lib/modal/Modal'
import { compare, tableSum, formatCash } from 'utils'
const { Text } = Typography
export default function Compared(props) {
  const { compareList } = props
  const { Option } = Select
  const { RangePicker } = DatePicker
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const [defaultColumns, setDefaultColumns] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8,
  ])
  const [showCustomColumns, setShowCustomColumns] = useState(false)
  const [displayColumns, setDisplayColumns] = useState([])
  const [filter, setFilter] = useState({
    keyword: '',
    from_date: moment().startOf('month').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
    branch: '',
  })

  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order',
      key: 0,
      sorter: (a, b) => compare(a, b, 'order'),
    },
    {
      title: 'Mã vận đơn',
      dataIndex: 'code',
      key: 1,
      sorter: (a, b) => compare(a, b, 'code'),
    },
    {
      title: 'DVVC',
      dataIndex: 'shipping_company',
      key: 2,
      sorter: (a, b) => compare(a, b, 'shipping_company'),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: '',
      key: 3,
      sorter: (a, b) => compare(a, b, 'name'),
    },
    {
      title: 'Mã số khách',
      dataIndex: '',
      key: 4,
      sorter: (a, b) => compare(a, b, 'customer_id'),
    },
    {
      title: 'Ngày tạo đơn',
      dataIndex: 'revice_date',
      key: 5,
      sorter: (a, b) =>
        moment(a.revice_date).unix() - moment(b.revice_date).unix(),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Tiền COD',
      dataIndex: 'cod_cost',
      key: 6,
      sorter: (a, b) => compare(a, b, 'cod_cost'),
    },
    {
      title: 'tiền chuyển khoản',
      dataIndex: 'transfer_cost',
      key: 7,
      sorter: (a, b) => compare(a, b, 'transfer_cost'),
    },
    {
      title: 'Phí vận chuyển',
      dataIndex: 'delivery_cost',
      key: 8,
      sorter: (a, b) => compare(a, b, 'delivery_cost'),
    },
    {
      title: 'Tiền COD thực nhận',
      dataIndex: 'real_cod_cost',
      key: 9,
      sorter: (a, b) => compare(a, b, 'real_cod_cost'),
    },
    {
      title: 'Phí bảo hiểm',
      dataIndex: 'insurance_cost',
      key: 10,
      sorter: (a, b) => compare(a, b, 'insurance_cost'),
    },
    {
      title: 'Phí giao hàng',
      dataIndex: 'shipping_cost',
      key: 11,
      sorter: (a, b) => compare(a, b, 'shipping_cost'),
    },
    {
      title: 'Phí chuyển hoàn',
      dataIndex: 'warehouse_cost',
      key: 12,
      sorter: (a, b) => compare(a, b, 'warehouse_cost'),
    },
    {
      title: 'Phí lưu kho',
      dataIndex: 'warehouse_cost',
      key: 13,
      sorter: (a, b) => compare(a, b, 'warehouse_cost'),
    },
    {
      title: 'Khối lượng',
      dataIndex: 'weight',
      render(data) {
        return data + 'kg'
      },
      key: 14,
      sorter: (a, b) => compare(a, b, 'weight'),
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'revice_date',
      key: 15,
      sorter: (a, b) =>
        moment(a.revice_date).unix() - moment(b.revice_date).unix(),
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'complete_date',
      sorter: (a, b) =>
        moment(a.complete_date).unix() - moment(b.complete_date).unix(),
      key: 16,
    },
    {
      title: 'Ghi chú đơn',
      dataIndex: 'note',
      width: 200,
      key: 17,
      sorter: (a, b) => compare(a, b, 'note'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 18,
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
          from_date: moment()
            .subtract(1, 'weeks')
            .startOf('week')
            .format('YYYY-MM-DD'),
          to_date: moment()
            .subtract(1, 'weeks')
            .endOf('week')
            .format('YYYY-MM-DD'),
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
          from_date: moment()
            .subtract(1, 'month')
            .startOf('month')
            .format('YYYY-MM-DD'),
          to_date: moment()
            .subtract(1, 'month')
            .endOf('month')
            .format('YYYY-MM-DD'),
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
          from_date: moment()
            .subtract(1, 'year')
            .startOf('year')
            .format('YYYY-MM-DD'),
          to_date: moment()
            .subtract(1, 'year')
            .endOf('year')
            .format('YYYY-MM-DD'),
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
  const handleShowColumns = () => {
    let tmp = []
    defaultColumns.forEach((e) => {
      tmp.push(columns[e])
    })
    setDisplayColumns(tmp)
    setShowCustomColumns(false)
  }
  useEffect(handleShowColumns, [])
  return (
    <>
      <div>
        <Row style={{ border: '1px solid #d9d9d9', borderRadius: 5 }}>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Input
              onChange={(e) =>
                props.setFilter({
                  ...filter,
                  keyword: e.target.value,
                })
              }
              placeholder="Tìm theo mã, theo tên"
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
                  />{' '}
                  {menu}{' '}
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
                ))}{' '}
            </Select>
          </Col>
        </Row>

        <Row
          justify="end"
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <ImportFile />
          <Button
            size="large"
            type="primary"
            onClick={() => setShowCustomColumns(true)}
          >
            Setting Column
          </Button>
        </Row>
        <Table
          size="small"
          rowKey="_id"
          columns={displayColumns}
          scroll={{ x: 'max-content' }}
          dataSource={compareList.filter((e) =>
            e.status ? e.status.toLowerCase() == 'complete' : ''
          )}
          summary={(pageData) => {
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell>
                    <Text></Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Tiền CoD: {formatCash(tableSum(pageData, 'cod_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Tiền CoD thực nhận:
                      {formatCash(tableSum(pageData, 'cod_real_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Tiền chuyển khoản:
                      {formatCash(tableSum(pageData, 'transfer_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Phí vận chuyển:{' '}
                      {formatCash(tableSum(pageData, 'delivery_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Phí bảo hiểm:{' '}
                      {formatCash(tableSum(pageData, 'insurance_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Phí chuyển hoàn:{' '}
                      {formatCash(tableSum(pageData, 'warehouse_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Phí giao hàng:{' '}
                      {formatCash(tableSum(pageData, 'shipping_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text>
                      Phí lưu kho:{' '}
                      {formatCash(tableSum(pageData, 'warehouse_cost'))}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )
          }}
        />
      </div>
      <Modal
        centered
        visible={showCustomColumns}
        onCancel={() => setShowCustomColumns(false)}
        onOk={handleShowColumns}
      >
        <Checkbox.Group
          defaultValue={defaultColumns}
          onChange={(e) => setDefaultColumns(e)}
        >
          <Row justify="space-between" gutter={[20, 10]}>
            {columns.map((e) => (
              <Col span={11}>
                <Checkbox value={e.key}>{e.title}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal>
    </>
  )
}
