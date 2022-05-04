const columns = [
  {
    title: 'Mã phiếu',
    dataIndex: 'code',
  },
  {
    title: 'Hình phiếu',
    dataIndex: 'source',
  },
  {
    title: 'Loại hình phiếu',
    dataIndex: 'type',
  },
  {
    title: 'Hình thức thanh toán',
    key: 'payment',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
  },
  {
    title: 'Số tiền',
    key: 'money',
  },
  {
    title: 'Người nộp',
    key: 'payer',
  },
  {
    title: 'Người nhận',
    key: 'receiver',
  },
  {
    title: 'Người tạo phiếu',
    key: 'creator',
  },
  {
    title: 'Ngày ghi nhận',
    key: 'create_date',
  },
]

export default columns
