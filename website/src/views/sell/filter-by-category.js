import React, { useEffect, useState } from 'react'

//antd
import { Drawer, Row, Button, Input, Checkbox, Space, Spin, Tooltip } from 'antd'

//icons
import { SearchOutlined, UnorderedListOutlined } from '@ant-design/icons'

//apis
import { getCategories } from 'apis/category'

export default function FilterProductsByCategory({ setParamsFilter, paramsFilter }) {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [valueSearch, setValueSearch] = useState('')
  const [listCategory, setListCategory] = useState([])

  const _getCategories = async () => {
    try {
      setLoading(true)
      const res = await getCategories()
      if (res.status === 200) setCategories(res.data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    if (visible)
      setListCategory(paramsFilter.category_id ? paramsFilter.category_id.split('---') : [])
  }, [visible])

  useEffect(() => {
    _getCategories()
  }, [])

  return (
    <>
      <Tooltip title="Lọc theo nhóm sản phẩm">
        <UnorderedListOutlined style={{ cursor: 'pointer' }} onClick={toggle} />
      </Tooltip>
      <Drawer
        width={450}
        visible={visible}
        title="Lọc theo nhóm sản phẩm"
        onClose={toggle}
        placement="left"
        footer={
          <Row justify="end">
            <Button
              onClick={() => {
                if (listCategory.length) paramsFilter.category_id = listCategory.join('---')
                else delete paramsFilter.category_id
                setParamsFilter({ ...paramsFilter })
                toggle()
              }}
              type="primary"
              style={{
                backgroundColor: '#0877DE',
                borderColor: '#0877DE',
                borderRadius: 8,
              }}
            >
              Xác nhận
            </Button>
          </Row>
        }
      >
        <Row justify="end" style={{ marginBottom: 15 }}>
          <a onClick={() => setListCategory([])}>Xoá chọn tất cả</a>
        </Row>
        <Input
          allowClear
          value={valueSearch}
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm nhóm sản phẩm"
          onChange={(e) => setValueSearch(e.target.value)}
        />

        {loading ? (
          <div
            style={{
              width: '100%',
              height: '60%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Spin />
          </div>
        ) : (
          <Space direction="vertical" style={{ marginTop: 20 }}>
            {categories.map((category) => (
              <Checkbox
                checked={
                  listCategory.filter((e) => e == category.category_id).length ? true : false
                }
                onChange={(e) => {
                  const checked = e.target.checked
                  const listCategoryNew = [...listCategory]

                  if (checked) listCategoryNew.push(category.category_id)
                  else {
                    const indexRemove = listCategoryNew.findIndex((c) => c == category.category_id)
                    listCategoryNew.splice(indexRemove, 1)
                  }

                  setListCategory([...listCategoryNew])
                }}
              >
                {valueSearch && category.name.toLowerCase().includes(valueSearch.toLowerCase()) ? (
                  <mark style={{ backgroundColor: 'yellow' }}>{category.name}</mark>
                ) : (
                  category.name
                )}
              </Checkbox>
            ))}
          </Space>
        )}
      </Drawer>
    </>
  )
}
