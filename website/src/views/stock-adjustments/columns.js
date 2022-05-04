import { Link, useHistory } from 'react-router-dom'
import { ROUTES } from 'consts'

const columns = [
  {
    title: 'STT',
    dataIndex: 'stt',
    key: 'stt',
    width: 50,
  },
  {
    title: 'Mã phiếu',
    key: 'code',
  },
  {
    title: 'Chi nhánh kiểm hàng',
    key: 'branch',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
  },
  {
    title: 'Ngày tạo',
    key: 'create_date',
  },
  {
    title: 'Ngày kiểm',
    key: 'inventory_date',
  },
  {
    title: 'Nhân viên tạo',
    key: 'creator_info',
  },
  {
    title: 'Ghi chú',
    key: 'note',
    dataIndex: 'note',
  },
]

export default columns
