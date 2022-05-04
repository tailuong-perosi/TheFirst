const columnsOrder = [
  {
    title: 'STT',
    dataIndex: 'stt',
    key: 'stt',
    width: 50,
  },
  {
    title: 'Mã đơn hàng',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'create_date',
    key: 'create_date',
  },
  {
    title: 'Kênh bán hàng',
    dataIndex: 'channel',
    key: 'channel',
  },
  {
    title: 'Tên khách hàng',
    key: 'customer',
  },
  {
    title: 'Nhân viên',
    key: 'employee',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'bill_status',
    key: 'bill_status',
  },
  {
    title: 'Phương thức thanh toán',
    key: 'payments_method',
  },
  {
    title: 'Khách phải trả',
    dataIndex: 'final_cost',
    key: 'final_cost',
  },
  {
    title: 'Hành động',
    key: 'action',
  },
]

export default columnsOrder
