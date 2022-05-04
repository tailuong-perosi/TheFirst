const columns = [
  {
    title: 'STT',
    key: 'stt',
    width: 60,
  },
  {
    title: 'Mã phiếu',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Nơi chuyển',
    key: 'export_location',
  },
  {
    title: 'Ngày nhận',
    dataIndex: 'verify_date',
    key: 'verify_date',
  },

  {
    title: 'Nơi nhận',
    key: 'import_location',
  },
  {
    title: 'Ngày chuyển',
    dataIndex: 'delivery_time',
    key: 'delivery_time',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'create_date',
    key: 'create_date',
  },
  {
    title: 'Nhân viên tạo',
    dataIndex: '_creator',
    key: '_creator',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Hành động',
    key: 'action',
  },
]

export default columns
