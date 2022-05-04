const columns = [
  {
    title: 'STT',
    dataIndex: 'stt',
    key: 'stt',
    width: 50,
  },
  {
    title: 'Số hóa đơn',
    key: 'code',
  },
  {
    title: 'Địa điểm nhận hàng',
    key: 'location',
  },
  {
    title: 'Ngày nhập hàng',
    key: 'create_date',
  },
  {
    title: 'Tổng tiền (VND)',
    key: 'final_cost',
  },
  {
    title: 'Số tiền đã thanh toán (VND)',
    key: 'payment_amount',
  },
  {
    title: 'Tổng số lượng nhập',
    key: 'total_quantity',
  },
  {
    title: 'Người tạo đơn',
    key: 'creator',
  },
  {
    title: 'Người xác nhận phiếu',
    key: 'verifier',
  },
  {
    title: 'Ngày xác nhận phiếu',
    key: 'verify_date',
  },
  {
    title: 'Trạng thái đơn hàng',
    key: 'status',
  },
  {
    title: 'Danh sách sản phẩm',
    key: 'products',
  },
  {
    title: 'Hành động',
    key: 'action',
  },
]

export default columns
