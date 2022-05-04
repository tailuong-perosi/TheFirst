import React, { useEffect, useState, useRef } from 'react'
import { formatCash } from 'utils'

//antd
import { Modal, Space, Input, Select, Table, Button, Radio, DatePicker, Popconfirm } from 'antd'

//icons
import { SearchOutlined } from '@ant-design/icons'

//apis
import { getOrders, updateOrder } from 'apis/order'

export default function OrdersReturn() {
  const typingTimeoutRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})
  const [isOpenSelect, setIsOpenSelect] = useState(false)
  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)

  const [ordersRefund, setOrdersRefund] = useState([])
  const [finalCost, setFinalCost] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [cost, setCost] = useState(0)
  const [customerPaid, setCustomerPaid] = useState(0)

  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 5 })
  const [countOrdersRefund, setCountOrdersRefund] = useState(0)

  const onSearch = (e) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value
      if (value) paramsFilter.keyword = value
      else delete paramsFilter.keyword
      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 750)
  }

  const _getOrdersRefund = async () => {
    try {
      setLoading(true)
      const res = await getOrders({ ...paramsFilter })
      console.log(res)
      if (res.status === 200) {
        setOrdersRefund(res.data.data)
        setCountOrdersRefund(res.data.count)
        let finalCost = 0
        let discount = 0
        let cost = 0
        let customerPaid = 0
        res.data.data.map((order) => {
          finalCost += order.final_cost
          discount += order.total_discount
          cost += order.total_cost
          customerPaid += order.customer_paid
        })

        setFinalCost(finalCost)
        setDiscount(discount)
        setCost(cost)
        setCustomerPaid(customerPaid)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _updateOrder = async (id) => {
    try {
      const res = await updateOrder({ bill_status: 'REFUND' }, id)
      console.log(res)
      if (res.status === 200) {
        _getOrdersRefund()
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
    },
    {
      title: 'Khách hàng',
      render: (text, record) =>
        record.customer && `${record.customer.first_name} ${record.customer.last_name}`,
    },
    {
      title: 'Tổng tiền',
      render: (text, record) => formatCash(record.total_cost || 0),
    },
    {
      title: 'Chiết khấu',
      render: (text, record) => formatCash(record.total_discount || 0),
    },
    {
      title: 'Thành tiền',
      render: (text, record) => formatCash(record.final_cost || 0),
    },
    {
      title: 'Khách đã trả',
      render: (text, record) => formatCash(record.customer_paid || 0),
    },
    {
      title: 'Hành động',
      render: (text, record) => (
        record.bill_status === 'REFUND' ?
          <p style={{
            textAlign: 'center',
            width: 110,
          }}>Đã Refund</p>
          :
          <Popconfirm
            title="Bạn có muốn Refund đơn hàng này?"
            onConfirm={() => _updateOrder(record.order_id)}
            okText="Đồng ý"
            cancelText="Không"
          >
            <Button
              style={{
                backgroundColor: '#5B6BE8',
                borderColor: '#5B6BE8',
                borderRadius: '3px',
                color: 'white',
                width: 110,
              }}
            >
              Refund
            </Button>
          </Popconfirm>
      ),
    },
  ]

  useEffect(() => {
    _getOrdersRefund()
  }, [paramsFilter])

  return (
    <>
      <Radio checked={visible} onClick={toggle}>
        Trả hàng
      </Radio>
      <Modal
        width={1150}
        visible={visible}
        onCancel={toggle}
        title="Danh sách đơn hàng"
        footer={null}
      >
        <div>
          <Space style={{ marginBottom: 25 }}>
            <Input
              onChange={onSearch}
              prefix={<SearchOutlined />}
              style={{ width: 350 }}
              placeholder="Tìm kiếm mã đơn hàng"
            />
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
              style={{ width: 270 }}
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
              <Select.Option value="today">Hôm nay</Select.Option>
              <Select.Option value="yesterday">Hôm qua</Select.Option>
              <Select.Option value="this_week">Tuần này</Select.Option>
              <Select.Option value="last_week">Tuần trước</Select.Option>
              <Select.Option value="this_month">Tháng này</Select.Option>
              <Select.Option value="last_month">Tháng trước</Select.Option>
              <Select.Option value="this_year">Năm này</Select.Option>
              <Select.Option value="last_year">Năm trước</Select.Option>
            </Select>
          </Space>
          <Table
            size="small"
            loading={loading}
            scroll={{ y: 300 }}
            style={{ width: '100%' }}
            dataSource={ordersRefund}
            columns={columns}
            pagination={{
              current: paramsFilter.page,
              pageSize: paramsFilter.page_size,
              showQuickJumper: true,
              onChange: (page, pageSize) =>
                setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
              total: countOrdersRefund,
            }}
          />
        </div>
      </Modal>
    </>
  )
}
