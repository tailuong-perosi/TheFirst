const columnsDelivery = [
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
    title: 'Mã vận đơn',
    key: 'shipping_code',
  },
  {
    title: 'Đơn vị vận chuyển',
    key: 'shipping_name',
  },
  {
    title: 'Tiền thu hộ',
    key: 'total_cod',
  },
  {
    title: 'Phí vận chuyển',
    key: 'fee_shipping',
  },
  {
    title: 'Ngày đóng gói',
    dataIndex: 'create_date',
    key: 'create_date',
  },
  {
    title: 'Người nhận',
    key: 'customer',
  },
  // {
  //   title: 'Địa chỉ người nhận',
  //   key: 'address',
  // },
  // {
  //   title: 'SĐT người nhận',
  //   key: 'phone',
  // },
  // {
  //   title: 'Đơn vị giao hàng',
  //   key: 'shipping_company_system',
  // },
  // {
  //   title: 'Dịch vụ giao hàng',
  //   key: 'shipping_company_system',
  // },
  {
    title: 'Trạng thái giao hàng',
    dataIndex: 'ship_status',
    key: 'ship_status',
  },
]

export default columnsDelivery
