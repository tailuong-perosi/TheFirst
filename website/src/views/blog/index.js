import React, { useEffect, useRef, useState } from 'react'

// style
import styles from './blog.module.scss'

// moment
import moment from 'moment'

// antd
import {
  DeleteOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Input, message, Select, Table, Popconfirm, DatePicker, Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import { IMAGE_DEFAULT, PERMISSIONS, POSITION_TABLE, ROUTES } from 'consts'
import Permission from 'components/permission'

// api
import { deleteBlog, getBlogs } from 'apis/blog'
import { getEmployees } from 'apis/employee'

// html react parser
import parse from 'html-react-parser'

import { compare } from 'utils'

const { Option } = Select
const { RangePicker } = DatePicker

export default function Blog() {
  const [selectKeys, setSelectKeys] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [blogList, setBlogList] = useState([])
  const [countPage, setCountPage] = useState('')
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 5 })
  const [attributeDate, setAttributeDate] = useState(undefined)
  const [valueDateSearch, setValueDateSearch] = useState(null)
  const [valueSearch, setValueSearch] = useState('')
  const [openSelect, setOpenSelect] = useState(false)
  const typingTimeoutRef = useRef(null)
  const [userList, setUserList] = useState([])
  const [userFilterValue, setUserFilterValue] = useState(null)

  const toggleOpenSelect = () => {
    setOpenSelect(!openSelect)
  }

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      width: '20%',
      align: 'center',
      render: (text, record) => (
        <img src={text ? text[0] : IMAGE_DEFAULT} alt="" style={{ width: 80, height: 80 }} />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      width: '20%',
      align: 'center',
      sorter: (a, b) => compare(a, b, 'title'),

      render: (text, record) => (
        <Link to={{ pathname: ROUTES.BLOG_CREATE, state: record }}>{text}</Link>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      width: '30%',
      align: 'center',
      sorter: (a, b) => a.content.length - b.content.length,
      render: (text, record) => (!text ? '' : parse(text)),
    },
    {
      title: 'Người đăng bài',
      dataIndex: `_creator`,
      align: 'center',
      width: '15%',
      sorter: (a, b) =>
        (a._creator && a._creator.first_name + ' ' + a._creator.last_name).length -
        (b._creator && b._creator.first_name + ' ' + b._creator.last_name).length,
      render: (text, record) =>
        // const creator = userList.find((e) => e.user_id == record.creator_id)
        // if (creator) return `${creator.first_name} ${creator.last_name}`
        // return ''
        `${text.first_name} ${text.last_name}`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'create_date',
      width: '15%',
      align: 'center',
      sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
      render: (text) => moment(text).format('DD/MM/YYYY HH:mm:ss'),
    },
  ]

  const _getBlog = async () => {
    try {
      setLoadingTable(true)
      const res = await getBlogs({ ...paramsFilter, _creator: true })
      setBlogList(res.data.data)
      setCountPage(res.data.count)
      console.log(res)
      setLoadingTable(false)
    } catch (err) {
      console.log(err)
    }
  }

  const _delelteBlog = async () => {
    const id = {
      blog_id: selectKeys,
    }
    // console.log(id)
    try {
      const res = await deleteBlog(id)
      // console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          message.success('Xóa bài viết thành công')
          _getBlog(paramsFilter)
          setSelectKeys([])
        } else {
          message.error(res.data.message || 'Xóa bài viết không thành công')
        }
      } else {
        message.error('Xóa bài viết không thành công')
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

  const onChangeCreatorFilter = (value) => {
    setUserFilterValue(value)
    if (value) paramsFilter.creator_id = value
    else delete paramsFilter.creator_id
    setParamsFilter({ ...paramsFilter })
  }

  const _getUserList = async () => {
    try {
      const res = await getEmployees({ page: 1, page_size: 1000 })
      console.log(res)
      if (res.data.success) {
        setUserList(res.data.data)
      }
    } catch (err) {
      console.log(err)
    }
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

      if (value) paramsFilter.title = value
      else delete paramsFilter.title

      setParamsFilter({ ...paramsFilter })
    }, 450)
  }

  const _resetFilter = () => {
    setAttributeDate(undefined)
    setValueSearch('')
    setValueDateSearch(null)
    setUserFilterValue(null)
    setParamsFilter({ page: 1, page_size: 5 })
  }
  useEffect(() => {
    _getUserList()
  }, [])

  useEffect(() => {
    _getBlog(paramsFilter)
  }, [paramsFilter])

  return (
    <div className={styles['body_blog']}>
      <div className={styles['body_blog_header']}>
        <div className={styles['body_blog_header_title']}>
          <span className={styles['body_blog_header_list_text']}>Quản lý bài viết</span>
          <a>
            <InfoCircleOutlined />
          </a>
        </div>
        <Permission permissions={[PERMISSIONS.tao_bai_viet]}>
          <Link to={ROUTES.BLOG_CREATE}>
            <Button type="primary">Tạo bài viết</Button>
          </Link>
        </Permission>
      </div>
      <hr />
      <Row style={{ marginTop: 20 }} gutter={30}>
        <Col span={6}>
          <Input
            size="large"
            placeholder="Tìm kiếm theo tên"
            allowClear
            prefix={<SearchOutlined />}
            onChange={_search}
            value={valueSearch}
          />
        </Col>
        <Col span={6}>
          <Select
            size="large"
            style={{ width: '100%' }}
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
        </Col>
        <Col span={6}>
          <Select
            style={{ width: '100%' }}
            value={userFilterValue}
            onChange={onChangeCreatorFilter}
            placeholder="Người đăng"
            size="large"
            allowClear
            showSearch
          >
            {userList.map((item) => (
              <Option value={item.user_id}>
                {item.first_name} {item.last_name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div className={styles['body_blog_delete_filter']}>
        <div>
          {selectKeys.length !== 0 ? (
            <>
              <Popconfirm
                placement="rightTop"
                title={'Bạn có chắc chắn muốn xóa bài viết này không ?'}
                okText="Yes"
                cancelText="No"
                onConfirm={_delelteBlog}
              >
                <Button type="danger" icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          ) : (
            <div></div>
          )}
        </div>
        <Button onClick={_resetFilter} type="danger" icon={<FilterOutlined />}>
          Xóa bộ lọc
        </Button>
      </div>
      <Table
        rowKey="blog_id"
        size="small"
        loading={loadingTable}
        columns={columns}
        dataSource={blogList}
        rowSelection={{
          selectedRowKeys: selectKeys,
          onChange: (keys, records) => {
            // console.log('keys', keys)
            setSelectKeys(keys)
          },
        }}
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
