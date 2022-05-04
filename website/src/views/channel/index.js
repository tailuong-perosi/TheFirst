import React, { useEffect, useRef, useState } from 'react'

// style
import styles from './channel.module.scss'

// moment
import moment from 'moment'

// antd
import {
  DeleteOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  message,
  Select,
  Table,
  Popconfirm,
  Switch,
  Modal,
  DatePicker,
  Form,
  Badge,
  notification,
} from 'antd'
import { Link } from 'react-router-dom'
import { IMAGE_DEFAULT, PERMISSIONS, POSITION_TABLE, ROUTES } from 'consts'
import Permission from 'components/permission'

// api
import { createChannel, deleteChannel, getChannels, getPlatform, updateChannel } from 'apis/channel'

// html react parser
import parse from 'html-react-parser'

const { Option } = Select
const { RangePicker } = DatePicker

export default function Channel() {
  const [form] = Form.useForm()
  const [loadingTable, setLoadingTable] = useState(false)
  const [channelList, setChannelList] = useState([])
  const [platformList, setPlatformList] = useState([])
  const [countPage, setCountPage] = useState('')
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 5 })
  const [attributeDate, setAttributeDate] = useState(undefined)
  const [attributeStatus, setAttributeStatus] = useState(undefined)
  const [attributePlatform, setAttributePlatform] = useState(undefined)
  const [valueSearch, setValueSearch] = useState('')
  const [valueDateSearch, setValueDateSearch] = useState(null)
  const [connect, setConnect] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [openSelect, setOpenSelect] = useState(false)
  const [platform, setPlatform] = useState('')
  const [idChannel, setIdChannel] = useState('')
  // console.log(base)
  const typingTimeoutRef = useRef(null)

  const handleChange = (checked) => {
    // console.log(checked)
    setConnect(checked)
  }
  const toggleModal = () => {
    setModalVisible(!modalVisible)
    form.resetFields()
    setPlatform('')
    setIdChannel('')
  }

  const toggleOpenSelect = () => {
    setOpenSelect(!openSelect)
  }

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      width: '15%',
      align: 'center',
      sorter: (a, b) => a.name.length - b.name.length,
      // render: (text, record) => (
      //   <Link to={{ pathname: ROUTES.BLOG_CREATE, state: record }}>{text}</Link>
      // ),
    },
    {
      title: 'Url',
      dataIndex: 'url',
      width: '15%',
      align: 'center',
      render: (text) => (
        <a target="_blank" href={text}>
          {text}
        </a>
      ),
    },
    {
      title: 'Nền tảng',
      dataIndex: '_platform',
      width: '15%',
      align: 'center',
      render: (text, record) => <span>{text[0].name}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: '15%',
      align: 'center',
      render: (text) =>
        text === 'WORKING' ? (
          <Badge status="success" text="Hoạt động" />
        ) : (
          <Badge status="error" text="Không hoạt động" />
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'create_date',
      width: '10%',
      align: 'center',
      render: (text) => moment(text).format('DD/MM/YYYY h:mm:ss'),
    },
    {
      title: 'Hành động',
      dataIndex: '',
      width: '15%',
      align: 'center',
      render: (text, record) => (
        <div className={styles['body_channel_table_action']}>
          <Button type="primary" onClick={() => _updateChannel(record)} style={{ width: 100 }}>
            Cập nhật
          </Button>
          <Button
            type="danger"
            onClick={() => _delelteChannel(record.channel_id)}
            style={{ width: 100, margin: '10px 0' }}
          >
            Xóa
          </Button>
          <Button type="primary" style={{ width: 100, backgroundColor: '#70BE4B', border: 'none' }}>
            Kết nối lại
          </Button>
        </div>
      ),
    },
    {
      title: 'Kết nối',
      dataIndex: 'active',
      width: '20%',
      align: 'center',
      render: (text) => (
        <div>
          <Switch defaultChecked={text} onChange={handleChange} />
        </div>
      ),
    },
  ]

  const _updateChannel = (record) => {
    // console.log(record)
    form.setFieldsValue({ name: record.name, url: record.url })
    setIdChannel(record.channel_id)
    setModalVisible(!modalVisible)
  }

  const _getChannel = async () => {
    try {
      setLoadingTable(true)
      const res = await getChannels(paramsFilter)
      setChannelList(res.data.data)
      setCountPage(res.data.count)
      console.log(res)
      setLoadingTable(false)
    } catch (err) {
      console.log(err)
    }
  }

  const _getPlatForm = async () => {
    try {
      const res = await getPlatform()
      // console.log(res)
      if (res.status === 200) {
        if (res.data.success === true) {
          setPlatformList(res.data.data)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const _actionChannel = async () => {
    try {
      await form.validateFields()
      const formData = form.getFieldsValue()
      let res
      const body = {
        name: formData.name,
        url: formData.url,
        platform_id: formData.platform,
        client_id: formData.client_id,
        secret_key: formData.secret_key,
      }
      console.log(body)
      if (idChannel) {
        res = await updateChannel(idChannel, body)
      } else {
        res = await createChannel(body)
      }
      console.log(res)
      if (res.status === 200) {
        if (res.data.success === true) {
          _getChannel(paramsFilter)
          notification.success({ message: `${idChannel ? 'Cập nhật' : 'Tạo'} kênh thành công` })
          setModalVisible(false)
        }
      } else {
        notification.error({ message: `${idChannel ? 'Cập nhật' : 'Tạo'} kênh thất bại` })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const _delelteChannel = async (idChannel) => {
    const id = {
      channel_id: [idChannel],
    }
    console.log(id)
    try {
      const res = await deleteChannel(id)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          message.success('Xóa kênh thành công')
          _getChannel(paramsFilter)
        } else {
          message.error(res.data.message || 'Xóa kênh không thành công')
        }
      } else {
        message.error('Xóa kênh không thành công')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const onChangeOptionSearchDate = (value) => {
    delete paramsFilter[attributeDate]
    if (value) paramsFilter[value] = true
    else delete paramsFilter[value]
    setAttributeDate(value)
    setParamsFilter({ ...paramsFilter })
    if (openSelect) toggleOpenSelect()
  }

  const onChangeOptionSearchStatus = (value) => {
    delete paramsFilter[attributeStatus]
    if (value) paramsFilter.active = value
    else delete paramsFilter.active
    setAttributeStatus(value)
    setParamsFilter({ ...paramsFilter })
  }

  const onChangeOptionSearchPlatform = (value) => {
    delete paramsFilter[attributePlatform]
    if (value) paramsFilter.platform_id = value
    else delete paramsFilter.platform_id
    setAttributePlatform(value)
    setParamsFilter({ ...paramsFilter })
  }

  const _search = (e) => {
    setValueSearch(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(async () => {
      const value = e.target.value

      //khi search hoặc filter thi reset page ve 1
      paramsFilter.page = 1

      if (value) paramsFilter.name = value
      else delete paramsFilter.name

      setParamsFilter({ ...paramsFilter })
    }, 450)
  }

  const _resetFilter = () => {
    // console.log(paramsFilter)
    setAttributeDate(undefined)
    setAttributeStatus(undefined)
    setAttributePlatform(undefined)
    setValueSearch('')
    setValueDateSearch(null)
    setParamsFilter({ page: 1, page_size: 5 })
  }

  const title = `${idChannel ? 'Cập nhật' : 'Thêm mới'}  kênh bán hàng`

  useEffect(() => {
    _getChannel(paramsFilter)
    _getPlatForm()
  }, [paramsFilter])

  return (
    <div className={styles['body_channel']}>
      <Modal
        title={title}
        visible={modalVisible}
        centered={true}
        onCancel={toggleModal}
        footer={[
          <div style={{ textAlign: 'center' }}>
            <Button onClick={_actionChannel} type="primary">
              Kết nối
            </Button>
          </div>,
        ]}
      >
        <Form form={form}>
          <h3>Tên hiển thị</h3>
          <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập tên kênh' }]}>
            <Input
              // value={dataUpdate.name ? dataUpdate.name : ''}
              // onChange={handleChangeChannelName}
              placeholder="Nhập tên hiển thị"
            />
          </Form.Item>
          <h3>Url trang web</h3>
          <Form.Item name="url" rules={[{ required: true, message: 'Vui lòng nhập url kênh' }]}>
            <Input
              // value={dataUpdate.url ? dataUpdate.url : ''}
              // onChange={handleChangeChannelUrl}
              placeholder="Nhập url trang web"
            />
          </Form.Item>
          <h3>Nền tảng</h3>
          <Form.Item
            name="platform"
            rules={[{ required: true, message: 'Vui lòng chọn nền tảng' }]}
          >
            <Select
              style={{ width: '100%' }}
              // value={attributePlatform}
              onChange={(value) => setPlatform(value)}
              placeholder="Chọn nền tảng"
              allowClear
            >
              {platformList.map((item) => (
                <Option value={item.platform_id}>{item.name}</Option>
              ))}
            </Select>
          </Form.Item>
          {platform ? (
            <>
              <h3>Key</h3>
              <Form.Item
                name="client_id"
                rules={[{ required: true, message: 'Vui lòng nhập key' }]}
              >
                <Input
                  // value={dataUpdate.url ? dataUpdate.url : ''}
                  // onChange={handleChangeChannelUrl}
                  placeholder="Nhập key"
                />
              </Form.Item>
              <h3>Key Secret</h3>
              <Form.Item
                name="secret_key"
                rules={[{ required: true, message: 'Vui lòng nhập key secret' }]}
              >
                <Input
                  // value={dataUpdate.url ? dataUpdate.url : ''}
                  // onChange={handleChangeChannelUrl}
                  placeholder="Nhập key secret"
                />
              </Form.Item>
            </>
          ) : (
            ''
          )}
        </Form>
      </Modal>
      <div className={styles['body_channel_header']}>
        <div className={styles['body_channel_header_title']}>
          <span className={styles['body_channel_header_list_text']}>Quản lý kênh</span>
        </div>
        <Permission permissions={[PERMISSIONS.tao_kenh_ban_hang]}>
          <Button onClick={toggleModal} type="primary">
            Thêm kênh bán hàng
          </Button>
        </Permission>
      </div>
      <hr />
      <div className={styles['body_channel_filter']}>
        <Input.Group compact>
          <Input
            style={{ width: '20%' }}
            placeholder="Tìm kiếm theo tên"
            allowClear
            prefix={<SearchOutlined />}
            onChange={_search}
            value={valueSearch}
          />
          <Select
            style={{ width: '15%' }}
            value={attributeStatus}
            onChange={onChangeOptionSearchStatus}
            placeholder="Tất cả (trạng thái)"
            allowClear
          >
            <Option value="true">Hoạt động</Option>
            <Option value="false">Không hoạt động</Option>
          </Select>
          <Select
            style={{ width: '18%' }}
            value={attributePlatform}
            onChange={onChangeOptionSearchPlatform}
            placeholder="Tất cả (nền tảng)"
            allowClear
          >
            {platformList.map((item) => (
              <Option value={item.platform_id}>{item.name}</Option>
            ))}
          </Select>
          <Select
            style={{ width: '25%' }}
            value={attributeDate}
            onChange={onChangeOptionSearchDate}
            placeholder="Thời gian"
            allowClear
            open={openSelect}
            onBlur={() => {
              if (openSelect) toggleOpenSelect()
            }}
            onClick={() => {
              if (!openSelect) toggleOpenSelect()
            }}
            dropdownRender={(menu) => (
              <>
                <RangePicker
                  style={{ width: '100%' }}
                  onFocus={() => {
                    if (!openSelect) toggleOpenSelect()
                  }}
                  onBlur={() => {
                    if (openSelect) toggleOpenSelect()
                  }}
                  value={valueDateSearch}
                  onChange={(dates, dateStrings) => {
                    //khi search hoac filter thi reset page ve 1
                    paramsFilter.page = 1

                    if (openSelect) toggleOpenSelect()

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
                      setAttributeDate()
                    } else {
                      const dateFirst = dateStrings[0]
                      const dateLast = dateStrings[1]
                      setValueDateSearch(dates)
                      setAttributeDate(`${dateFirst} -> ${dateLast}`)

                      dateFirst.replace(/-/g, '/')
                      dateLast.replace(/-/g, '/')

                      paramsFilter.from_date = dateFirst
                      paramsFilter.to_date = dateLast
                    }

                    setParamsFilter({ ...paramsFilter })
                  }}
                />
                {menu}
              </>
            )}
          >
            <Option value="today">Hôm nay</Option>
            <Option value="yesterday">Hôm qua</Option>
            <Option value="this_week">Tuần này</Option>
            <Option value="last_week">Tuần trước</Option>
            <Option value="this_month">Tháng này</Option>
            <Option value="last_month">Tháng trước</Option>
            <Option value="this_year">Năm này</Option>
            <Option value="last_year">Năm trước</Option>
          </Select>
        </Input.Group>
      </div>
      <div className={styles['body_channel_delete_filter']}>
        <Button onClick={_resetFilter} type="danger" icon={<FilterOutlined />}>
          Xóa bộ lọc
        </Button>
      </div>
      <Table
        rowKey="channel_id"
        size="small"
        loading={loadingTable}
        columns={columns}
        dataSource={channelList}
        // rowSelection={{
        //   selectedRowKeys: selectKeys,
        //   onChange: (keys, records) => {
        //     // console.log('keys', keys)
        //     setSelectKeys(keys)
        //   },
        // }}
        pagination={{
          position: POSITION_TABLE,
          total: countPage,
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          onChange(page, pageSize) {
            setParamsFilter({
              ...paramsFilter,
              page: page,
              page_size: pageSize,
            })
          },
        }}
      />
    </div>
  )
}
