import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ACTION, IMAGE_DEFAULT, ROUTES } from 'consts'
import { Link } from 'react-router-dom'
import { compare, compareCustom, formatCash } from 'utils'
import moment from 'moment'

//components
import TitlePage from 'components/title-page'

//antd
import {
  Row,
  Form,
  Upload,
  Input,
  Button,
  notification,
  Radio,
  Space,
  Select,
  Table,
  Tag,
  Switch,
  Modal,
  Tooltip,
  Col,
} from 'antd'

//icons
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

//apis
import { uploadFile } from 'apis/upload'
import { addCategory, updateCategory } from 'apis/category'
import { getProducts, updateProduct } from 'apis/product'

export default function Category({ title, toggle, reload }) {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const [fileUpload, setFileUpload] = useState(null)
  const [imageView, setImageView] = useState('')
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [products, setProducts] = useState([])
  const [productsUpdate, setProductsUpdate] = useState([])
  const [loading, setLoading] = useState(false)
  const [countProduct, setCountProduct] = useState(0)

  const [match, setMatch] = useState(
    location.state && location.state.condition ? location.state.condition.must_match : 'all'
  )
  const [conditions, setConditions] = useState(
    location.state && location.state.condition
      ? location.state.condition.function
      : [{ name: 'name', operator: 'is_equal_to', value: '' }]
  )

  const columnsProduct = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 50,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name-product',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Nhóm sản phẩm',
      key: 'category',
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
    },
    {
      title: 'Ngày tạo',
      key: 'create_date',
    },
    {
      title: 'Hành động',
      width: 90,
      render: (text, record) => (
        <Button
          icon={<DeleteOutlined />}
          type="primary"
          danger
          onClick={() => _removeProductToCategory(record)}
        />
      ),
    },
  ]

  const _removeProductToCategory = (product) => {
    const productsNew = [...products]
    const productsUpdateNew = [...productsUpdate]

    const indexProduct = productsNew.findIndex((p) => p.product_id === product.product_id)

    if (indexProduct !== -1) {
      productsNew.splice(indexProduct, 1)
      productsUpdateNew.push(product)
    }

    setProductsUpdate([...productsUpdateNew])
    setProducts([...productsNew])
  }

  const columnsVariant = [
    {
      title: 'Hình ảnh',
      key: 'image',
      render: (text, record) =>
        record.image && record.image.length ? (
          <img
            src={record.image[0] || IMAGE_DEFAULT}
            alt=""
            style={{ width: 75, height: 75, objectFit: 'contain' }}
          />
        ) : (
          <img src={IMAGE_DEFAULT} alt="" style={{ width: 75, height: 75 }} />
        ),
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'title',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
  ]

  const PRODUCT_TYPES = [
    { name: 'Tên sản phẩm' },
    { description: 'Mô tả' },
    { sku: 'SKU' },
    { weight: 'Cân nặng' },
    { height: 'Chiều cao' },
    { width: 'Chiều rộng' },
    { quantity: 'Số lượng' },
    { price_import: 'Giá nhập' },
    { price_sale: 'Giá bán' },
  ]

  const ARCHIVES = [
    {
      name: { is_equal_to: 'giống' },
      actives: [],
    },
    {
      name: { is_not_equal_to: 'không giống' },
      actives: [],
    },
    {
      name: { is_greater_than: 'nhiều hơn' },
      actives: [],
    },
    {
      name: { is_less_than: 'ít hơn' },
      actives: [],
    },
    {
      name: { contains: 'chứa' },
      actives: [],
    },
    {
      name: { does_not_contains: 'không chứa' },
      actives: [],
    },
    {
      name: { is_not_empty: 'trống' },
      actives: [],
    },
    {
      name: { is_empty: 'không trống' },
      actives: [],
    },
  ]

  function getBase64(img, callback) {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  const _updateProducts = async () => {
    try {
      const listPromise = productsUpdate.map(async (product) => {
        const indexCategory = product.category_id.findIndex((c) => c == location.state.category_id)
        if (indexCategory !== -1) product.category_id.splice(indexCategory, 1)
        const res = await updateProduct({ category_id: product.category_id }, product.product_id)
        return res
      })
      await Promise.all(listPromise)
    } catch (error) {
      console.log(error)
    }
  }

  const _addOrUpdateCategory = async () => {
    try {
      await form.validateFields()
      let checkCondition = false
      conditions.map((item) => {
        if (item.value) {
          checkCondition = true
        } else {
          checkCondition = false
        }
      })
      if (!checkCondition) {
        notification.error({ message: 'Từ khóa ở bộ điều kiện ko đc để trống' })
        return
      }
      dispatch({ type: ACTION.LOADING, data: true })
      const dataForm = form.getFieldsValue()

      const image = await uploadFile(fileUpload)
      const body = {
        ...dataForm,
        parent_id: -1,
        image: image || imageView || '',
        default: dataForm.default || false,
        description: dataForm.description || '',
        condition: {
          must_match: match,
          function: conditions,
        },
      }

      let res

      if (location.state) {
        await _updateProducts()
        res = await updateCategory(body, location.state.category_id)
      } else res = await addCategory(body)

      if (res.status === 200) {
        if (res.data.success) {
          notification.success({
            message: `${location.state ? 'Cập nhật' : 'Tạo'} nhóm sản phẩm thành công!`,
          })
          if (title === 'product-form') {
            toggle()
            reload()
          } else {
            history.push(ROUTES.CATEGORIES)
          }

        } else
          notification.error({
            message:
              res.data.mess ||
              res.data.message ||
              `${location.state ? 'Cập nhật' : 'Tạo'} nhóm sản phẩm thất bại!`,
          })
      } else
        notification.error({
          message:
            res.data.mess ||
            res.data.message ||
            `${location.state ? 'Cập nhật' : 'Tạo'} nhóm sản phẩm thất bại!`,
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const getProductsByCategory = async () => {
    try {
      setLoading(true)
      if (location.state && location.state.category_id) {
        const res = await getProducts({ ...paramsFilter, category_id: location.state.category_id })
        console.log(res)
        setProducts(res.data.data)
        setCountProduct(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }
  useEffect(() => {
    getProductsByCategory()
  }, [])

  useEffect(() => {
    if (location.state) {
      form.setFieldsValue({ ...location.state })
      setImageView(location.state.image || '')
    }
  }, [])

  return (
    <div className="card">
      <div style={{ display: title === 'product-form' && 'none' }}>
        <TitlePage
          isAffix={true}
          title={
            <Row
              align="middle"
              onClick={() => history.push(ROUTES.CATEGORIES)}
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeftOutlined />
              <div style={{ marginLeft: 8 }}>{location.state ? 'Cập nhật' : 'Tạo'} nhóm sản phẩm</div>
            </Row>
          }
        >
          <Button size="large" type="primary" onClick={_addOrUpdateCategory}>
            {location.state ? 'Cập nhật' : 'Tạo'} nhóm sản phẩm
          </Button>
        </TitlePage>
      </div>
      <Form layout="vertical" form={form}>
        <Row style={{ margin: '25px 0px' }}>
          <div style={{ width: '60%' }}>
            {/* <Form.Item valuePropName="checked" name="default">
              <Checkbox>Chọn làm mặc định</Checkbox>
            </Form.Item> */}
            <div>Hình ảnh</div>
            <Upload
              name="avatar"
              listType="picture-card"
              className="upload-category-image"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              onChange={(info) => {
                if (info.file.status !== 'done') info.file.status = 'done'
                getBase64(info.file.originFileObj, (imageUrl) => setImageView(imageUrl))
                setFileUpload(info.file.originFileObj)
              }}
            >
              {imageView ? (
                <img src={imageView} alt="avatar" style={{ width: '100%' }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <div style={{ width: '100%', padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 15, fontWeight: 500, marginBottom: 7 }}>
                  Các điều kiện
                </span>
                <Row>
                  <p style={{ marginBottom: 0, marginRight: 18 }}>Các sản phẩm phải phù hợp:</p>
                  <Radio.Group value={match} onChange={(e) => setMatch(e.target.value)}>
                    <Space>
                      <Radio value="all">Tất cả điều kiện</Radio>
                      <Radio value="any">Bất kì điều kiện nào</Radio>
                    </Space>
                  </Radio.Group>
                </Row>
                {conditions.map((condition, index) => (
                  <>
                    <Row
                      gutter={[10, 10]}
                      wrap={false}
                      justify="space-between"
                      style={{ marginTop: 20 }}
                    >
                      <Col span={7}>
                        <Select
                          style={{ width: '100%' }}
                          value={condition.name}
                          onChange={(value) => {
                            const conditionsNew = [...conditions]
                            conditionsNew[index].name = value
                            const labelFind = ARCHIVES.find((e) => e.actives.includes(value))
                            if (labelFind)
                              conditionsNew[index].operator = Object.keys(labelFind.name)[0]
                            setConditions([...conditionsNew])
                          }}
                        >
                          {PRODUCT_TYPES.map((objectType, index) => {
                            const type = Object.keys(objectType)

                            return (
                              <Select.Option key={index} value={type[0]}>
                                {objectType[type[0]]}
                              </Select.Option>
                            )
                          })}
                        </Select>
                      </Col>
                      <Col span={7}>
                        <Select
                          style={{ width: '100%' }}
                          value={condition.operator}
                          onChange={(value) => {
                            const conditionsNew = [...conditions]
                            conditionsNew[index].operator = value
                            setConditions([...conditionsNew])
                          }}
                        >
                          {ARCHIVES.map((archive, index) => (
                            <Select.Option key={index} value={Object.keys(archive.name)[0]}>
                              {archive.name[Object.keys(archive.name)[0]]}
                            </Select.Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={7}>
                        <div>
                          <Input
                            placeholder="Từ khóa"
                            defaultValue={condition.value}
                            onBlur={(e) => {
                              const conditionsNew = [...conditions]
                              conditionsNew[index].value = e.target.value || ''
                              setConditions([...conditionsNew])
                            }}
                            style={{ width: '100%' }}
                          />
                          <div
                            style={{
                              color: 'red',
                              fontSize: 12,
                              display: condition.value && 'none',
                              marginTop: 5,
                            }}
                          >
                            * Không được để trống
                          </div>
                        </div>
                      </Col>
                      <Col span={3}>
                        <Button
                          onClick={() => {
                            const conditionsNew = [...conditions]
                            conditionsNew.splice(index, 1)
                            setConditions([...conditionsNew])
                          }}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Col>
                    </Row>
                    {/* <Row
                    style={{
                      width: '100%',
                      marginTop: 5,
                      color: 'red',
                      display: condition.value.length && 'none',
                    }}
                    align="middle"
                  >
                    <ExclamationCircleFilled style={{ marginRight: 9 }} />
                    <span>
                      {!condition.value && 'Enter some text for Variant’s title contains.'}
                    </span>
                  </Row> */}
                  </>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}>
                  <Button
                    style={{ borderRadius: 6, width: 'max-content' }}
                    type="primary"
                    onClick={() => {
                      const conditionsNew = [...conditions]
                      conditionsNew.push({ name: 'name', operator: 'is_equal_to', value: '' })
                      setConditions([...conditionsNew])
                    }}
                  >
                    Thêm điều kiện khác
                  </Button>
                  <Tooltip
                    placement="rightTop"
                    title="Điều kiện nhóm sản phẩm giúp bạn tự động ghép nhóm cho sản phẩm khi nhập file hàng loạt sản phẩm"
                  >
                    <a>
                      <QuestionCircleOutlined style={{ fontSize: 20, marginLeft: 8 }} />
                    </a>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: '40%' }}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập tên nhóm sản phẩm' }]}
              name="name"
              label="Tên nhóm sản phẩm"
            >
              <Input placeholder="Nhập tên nhóm sản phẩm" style={{ width: '100%' }} />
            </Form.Item>
            {/* <Form.Item
              rules={[{ required: true, message: 'Vui lòng nhập độ ưu tiên' }]}
              name="priority"
              label="Độ ưu tiên"
            >
              <InputNumber placeholder="Nhập độ ưu tiên" style={{ width: '100%' }} />
            </Form.Item> */}
            {/* <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={4} placeholder="Nhập mô tả" style={{ width: '100%' }} />
            </Form.Item> */}
          </div>
        </Row>
      </Form>
      <div style={{ display: !location.state && 'none' }}>
        <Row>
          <h3>Danh sách sản phẩm</h3>
          <Table
            loading={loading}
            style={{ width: '100%' }}
            expandable={{
              expandedRowRender: (record) => {
                return (
                  <div style={{ marginTop: 25, marginBottom: 25 }}>
                    <Table
                      style={{ width: '100%' }}
                      pagination={false}
                      columns={columnsVariant}
                      dataSource={record.variants}
                      size="small"
                    />
                  </div>
                )
              },
            }}
            columns={columnsProduct.map((column) => {
              if (column.key === 'stt')
                return {
                  ...column,
                  width: 50,
                  render: (text, record, index) =>
                    (paramsFilter.page - 1) * paramsFilter.page_size + index + 1,
                }
              if (column.key === 'name-product')
                return {
                  ...column,
                  render: (text, record) => text,
                  sorter: (a, b) => compare(a, b, 'name'),
                }

              if (column.key === 'sku')
                return {
                  ...column,
                  sorter: (a, b) => compare(a, b, 'sku'),
                }

              if (column.key === 'category')
                return {
                  ...column,
                  sorter: (a, b) =>
                    compareCustom(
                      a._categories && a._categories.length ? a._categories[0].name : '',
                      b._categories && b._categories.length ? b._categories[0].name : ''
                    ),
                  render: (text, record) =>
                    record._categories &&
                    record._categories.map((category, index) => (
                      <Tag key={index} closable={false}>
                        {category.name}
                      </Tag>
                    )),
                }

              if (column.key === 'supplier')
                return {
                  ...column,
                  sorter: (a, b) =>
                    compareCustom(
                      a.supplier_info ? a.supplier_info.name : '',
                      b.supplier_info ? b.supplier_info.name : ''
                    ),
                  render: (text, record) => record.supplier_info && record.supplier_info.name,
                }
              if (column.key === 'create_date')
                return {
                  ...column,
                  sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),

                  render: (text, record) =>
                    record.create_date && moment(record.create_date).format('DD-MM-YYYY HH:mm'),
                }

              return column
            })}
            dataSource={products}
            size="small"
            pagination={{
              position: ['bottomLeft'],
              current: paramsFilter.page,
              pageSize: paramsFilter.page_size,
              pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
              showQuickJumper: true,
              onChange: (page, pageSize) =>
                setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
              total: countProduct,
            }}
          />
        </Row>
        <Row>
          <div style={{ color: '#f56767' }}>
            Ghi chú: Nhóm sản phẩm chỉ hiệu quả khi doanh nghiệp có triển khai bán hàng online và
            bán hàng trên thương mại điện tử
          </div>
        </Row>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button size="large" type="primary" onClick={_addOrUpdateCategory} style={{ display: title === 'product-form' ? 'block' : 'none', width: '30%' }}>
          Tạo nhóm sản phẩm
        </Button>
      </div>
    </div>
  )
}
