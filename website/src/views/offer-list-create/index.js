import React, { useEffect, useRef, useState } from 'react'
import styles from './../offer-list-create/offer-create.module.scss'
// antd
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  PlusSquareOutlined,
  CloseOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  Select,
  Table,
  Upload,
  message,
  InputNumber,
  notification,
  Row,
  Spin,
  Form,
} from 'antd'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { IMAGE_DEFAULT, POSITION_TABLE, ROUTES } from 'consts'

// ckeditor
import { CKEditor } from 'ckeditor4-react'

import { formatCash } from 'utils'

// moment
import moment from 'moment'

// react html parser
import parse from 'html-react-parser'

// api
import { apiAllProduct, getProducts } from 'apis/product'
import { getCategories, getCategoriesWithCreator } from 'apis/category'
import { uploadFiles } from 'apis/upload'
import { addDeal, updateDeal } from 'apis/deal'
import { useForm } from 'antd/lib/form/Form'

const { Option } = Select
const { Search } = Input
const { Dragger } = Upload

export default function OfferListCreate() {
  const history = useHistory()
  const location = useLocation()
  const [form] = Form.useForm()
  const [filter, setFilter] = useState('')
  const [searchStatus, setSearchStatus] = useState(false)
  // const [dealName, setDealName] = useState('')
  // const [dealPrice, setDealPrice] = useState('')
  const [description, setDescription] = useState('')
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState([])
  const [loadingSelect, setLoadingSelect] = useState(false)
  const [dataTableProduct, setDataTableProduct] = useState([])
  const [dataTableCategory, setDataTableCategory] = useState([])
  const [selectKeyProduct, setSelectKeyProduct] = useState([])
  const [selectKeyCategory, setSelectKeyCategory] = useState([])
  const [imgUpload, setImgUpload] = useState([])
  const [imageDeal, setImageDeal] = useState([])
  const [dealId, setDealId] = useState('')
  const typingTimeoutRef = useRef()

  const handleChangeMoTa = (e) => {
    const value = e.editor.getData()
    setDescription(value)
  }

  const handleChangeFilter = (value) => {
    // console.log(value)
    setFilter(value)
    if (value === 'banner') {
      setSearchStatus(true)
    } else {
      setSearchStatus(false)
    }
  }

  const _actionDeal = async () => {
    try {
      await form.validateFields()
      const formData = form.getFieldsValue()
      let body = {}
      if (filter === 'product') {
        body = {
          name: formData.deal_name,
          type: filter,
          saleoff_type: 'value',
          saleoff_value: formData.deal_price,
          product_list: dataTableProduct.map((item) => item.product_id),
          description: description,
          image: imageDeal,
        }
      } else if (filter === 'category') {
        body = {
          name: formData.deal_name,
          type: filter,
          saleoff_type: 'value',
          saleoff_value: formData.deal_price,
          category_list: dataTableCategory.map((item) => item.category_id),
          description: description,
          image: imageDeal,
        }
      } else {
        body = {
          name: formData.deal_name,
          type: filter,
          saleoff_type: 'value',
          saleoff_value: formData.deal_price,
          image_list: imgUpload,
          description: description,
          image: imageDeal,
        }
      }
      // console.log(body)
      let res
      if (location.state) {
        res = await updateDeal(body, dealId)
      } else {
        res = await addDeal(body)
      }
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          history.goBack()
          notification.success({
            message: `${location.state ? 'Cập nhật' : 'Tạo'} ưu đãi thành công`,
          })
        } else {
          notification.success({
            message: res.data.message || `${location.state ? 'Cập nhật' : 'Tạo'} ưu đãi thất bại`,
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const columnsProduct = [
    {
      title: 'Gía ưu đãi',
      dataIndex: 'base_price',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      width: '20%',
      align: 'center',
      render: (text) => (
        <img src={text ? text : IMAGE_DEFAULT} alt="" style={{ width: 80, height: 80 }} />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      width: '15%',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Gía áp dụng',
      dataIndex: 'base_price',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'create_date',
      width: '10%',
      align: 'center',
      render: (text) => moment(text).format('DD/MM/YYYY h:mm:ss'),
    },
  ]
  const columnsCategory = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      width: '15%',
      align: 'center',
      render: (text) =>
        text ? <img src={text} alt="" style={{ width: 80, height: 80 }} /> : IMAGE_DEFAULT,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: '20%',
      align: 'center',
    },
    {
      title: 'SL sản phẩm trong nhóm',
      dataIndex: '',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Người tạo',
      dataIndex: 'username',
      width: '30%',
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'create_date',
      width: '10%',
      align: 'center',
      render: (text) => moment(text).format('DD/MM/YYYY h:mm:ss'),
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      width: '10%',
      align: 'center',
    },
  ]

  const _getProduct = async () => {
    try {
      setLoadingSelect(true)
      const res = await getProducts()
      // console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          const variantsData = []
          res.data.data.map((data) => data.variants.map((variants) => variantsData.push(variants)))
          setProducts(variantsData)
        }
      }
      setLoadingSelect(false)
    } catch (err) {
      console.log(err)
      setLoadingSelect(false)
    }
  }

  const _getCategory = async () => {
    try {
      setLoadingSelect(true)
      const res = await getCategoriesWithCreator()
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          const childrenCategory = []
          res.data.data.map((data) =>
            data.children_category.map((item) => childrenCategory.push(item))
          )
          setCategory(childrenCategory)
          // console.log(childrenCategory)
        }
      }
      setLoadingSelect(false)
    } catch (err) {
      console.log(err)
      setLoadingSelect(false)
    }
  }

  const _deleteProductTable = () => {
    const dataNew = dataTableProduct.filter((item) => !selectKeyProduct.includes(item.variant_id))
    // console.log(dataNew)
    setDataTableProduct(dataNew)
    setSelectKeyProduct([])
    message.success('Xóa sản phẩm được chọn thành công')
  }

  const _deleteCategoryTable = () => {
    const dataNew = dataTableCategory.filter(
      (item) => !selectKeyCategory.includes(item.category_id)
    )
    setDataTableCategory(dataNew)
    setSelectKeyCategory([])
    message.success('Xóa danh mục được chọn thành công')
  }

  const UploadImageWithEditDeal = () => (
    <Dragger
      listType="picture"
      name="file"
      multiple
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      onChange={(info) => {
        if (info.file.status !== 'done') info.file.status = 'done'
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(async () => {
          let listUrl = []
          let listFile = []
          info.fileList.map((item) => {
            if (item.url) {
              listUrl.push(item.url)
            } else {
              listFile.push(item.originFileObj)
            }
          })
          const imgUrls = await uploadFiles(listFile)
          setImageDeal([...listUrl, ...imgUrls])
          // console.log(info.fileList)
        }, 350)
        // console.log(info)
      }}
      fileList={imageDeal?.map((item, index) => {
        return {
          uid: index,
          name: 'image',
          status: 'done',
          url: item,
          thumbUrl: item,
        }
      })}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
      <p className="ant-upload-hint">Hỗ trợ định dạng .PNG,.JPG,.TIFF,.EPS</p>
    </Dragger>
  )

  const UploadImageBanner = () => (
    <Dragger
      listType="picture"
      name="file"
      multiple
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      onChange={(info) => {
        if (info.file.status !== 'done') info.file.status = 'done'
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(async () => {
          let listUrl = []
          let listFile = []
          info.fileList.map((item) => {
            if (item.url) {
              listUrl.push(item.url)
            } else {
              listFile.push(item.originFileObj)
            }
          })
          const imgUrls = await uploadFiles(listFile)
          setImgUpload([...listUrl, ...imgUrls])
          // console.log(info.fileList)
        }, 350)
        // console.log(info)
      }}
      fileList={imgUpload?.map((item, index) => {
        return {
          uid: index,
          name: 'image',
          status: 'done',
          url: item,
          thumbUrl: item,
        }
      })}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
      <p className="ant-upload-hint">Hỗ trợ định dạng .PNG,.JPG,.TIFF,.EPS</p>
    </Dragger>
  )

  const setDataForEditOfferList = () => {
    if (location.state) {
      console.log(location.state)
      form.setFieldsValue({ deal_name: location.state.name })
      form.setFieldsValue({ deal_price: location.state.saleoff_value })
      setDescription(location.state.description)
      setDealId(location.state.deal_id)
      setImageDeal(location.state.image)
      setFilter(location.state.type.toLowerCase())
      if (location.state.type === 'PRODUCT') {
        form.setFieldsValue({ type: 'Sản phẩm' })
        const dataTableEdit = []
        location.state._products.map((item) =>
          item.variants.map((variants) => dataTableEdit.push(variants))
        )
        setDataTableProduct(dataTableEdit)
      }
      if (location.state.type === 'CATEGORY') {
        form.setFieldsValue({ type: 'Nhóm sản phẩm' })
        setDataTableCategory(location.state._categories)
      }
      if (location.state.type === 'BANNER') {
        form.setFieldsValue({ type: 'Banner' })
        setImgUpload(location.state.image_list)
      }
    }
  }

  useEffect(() => {
    _getCategory()
    _getProduct()
    setDataForEditOfferList()
  }, [])

  return (
    <div className={styles['body_offer']}>
      <div className={styles['body_offer_header']}>
        <div className={styles['body_offer_header_title']}>
          <ArrowLeftOutlined
            onClick={() => history.goBack()}
            style={{ fontSize: '20px', paddingRight: '10px' }}
          />
          <span className={styles['body_offer_header_list_text']}>
            {location.state ? 'Cập nhật' : 'Tạo'} ưu đãi
          </span>
          <a>
            <InfoCircleOutlined />
          </a>
        </div>
        <Button onClick={_actionDeal} style={{ width: '90px' }} type="primary">
          {location.state ? 'Cập nhật' : 'Tạo'}
        </Button>
      </div>
      <hr />
      <Form autoComplete="off" form={form} className={styles['body_offer_content']}>
        <div className={styles['body_offer_content_header']}>
          <div className={styles['body_offer_content_header_item_1']}>
            <h3>Tên ưu đãi</h3>
            <Form.Item
              name="deal_name"
              rules={[{ required: true, message: 'Vui lòng nhập tên ưu đãi' }]}
            >
              <Input
                // onChange={(e) => setDealName(e.target.value)}
                style={{ width: '80%' }}
                placeholder="Nhập tên ưu đãi"
              ></Input>
            </Form.Item>
          </div>
          <div className={styles['body_offer_content_header_item_2']}>
            <h3>Gía ưu đãi</h3>
            <Form.Item
              name="deal_price"
              rules={[{ required: true, message: 'Vui lòng nhập giá ưu đãi' }]}
            >
              <InputNumber
                // onChange={(value) => setDealPrice(value)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                defaultValue={0}
                min={0}
                max={100000000000}
                style={{ width: '80%' }}
                placeholder="Nhập giá ưu đãi"
              ></InputNumber>
            </Form.Item>
          </div>
        </div>
        <h3>Hình ảnh ưu đãi</h3>
        <UploadImageWithEditDeal />
        <h3 style={{ padding: '20px 0' }}>Mô tả</h3>
        <CKEditor
          initData={location.state ? parse(description) : 'Nhập mô tả tại đây'}
          onChange={handleChangeMoTa}
        />
        <h3 style={{ padding: '20px 0' }}>Loại ưu đãi</h3>
        <Input.Group compact>
          <Form.Item name="type" rules={[{ required: true, message: 'Vui lòng chọn loại ưu đãi' }]}>
            <Select
              onChange={handleChangeFilter}
              style={{ width: '100%' }}
              placeholder="Chọn loại ưu đãi"
              allowClear
            >
              <Option value="product">Sản phẩm</Option>
              <Option value="category">Nhóm sản phẩm</Option>
              <Option value="banner">Banner</Option>
            </Select>
          </Form.Item>
          {filter === 'product' ? (
            <div className="select-product-sell">
              <Select
                notFoundContent={loadingSelect ? <Spin size="small" /> : ''}
                dropdownClassName="dropdown-select-search-product"
                allowClear
                showSearch
                clearIcon={<CloseOutlined style={{ color: 'black' }} />}
                suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
                disabled={searchStatus}
                style={{ width: 200 }}
                className={styles['search-product']}
                placeholder="Tìm kiếm sản phẩm"
                dropdownRender={(menu) => (
                  <div>
                    <Row
                      wrap={false}
                      align="middle"
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.open(ROUTES.PRODUCT_ADD, '_blank')}
                    >
                      <div
                        style={{
                          paddingLeft: 15,
                          width: 45,
                          height: 50,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <PlusSquareOutlined
                          style={{
                            fontSize: 19,
                          }}
                        />
                      </div>
                      <p
                        style={{
                          marginLeft: 20,
                          marginBottom: 0,
                          fontSize: 16,
                        }}
                      >
                        Thêm mới sản phẩm
                      </p>
                    </Row>
                    {menu}
                  </div>
                )}
              >
                {products?.map((data) => (
                  <Select.Option value={data.title} key={data.title}>
                    <Row
                      align="middle"
                      wrap={false}
                      style={{ padding: '7px 13px' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const findProduct = dataTableProduct.find(
                          (item) => item.variant_id === data.variant_id
                        )
                        if (findProduct) {
                          message.error('Chỉ được chọn sản phẩm khác phân loại')
                          return
                        }
                        const dataIndex = {
                          variant_id:data.variant_id,
                          product_id: data.product_id,
                          base_price: data.base_price,
                          image: data.image,
                          title: data.title,
                          sku: data.sku,
                          supplier: data.supplier,
                          create_date: data.create_date,
                          categories: data._categories[0].name,
                        }
                        setDataTableProduct([...dataTableProduct, dataIndex])
                      }}
                    >
                      <img
                        src={data.image[0] ? data.image[0] : IMAGE_DEFAULT}
                        alt=""
                        style={{
                          minWidth: 40,
                          minHeight: 40,
                          maxWidth: 40,
                          maxHeight: 40,
                          objectFit: 'cover',
                        }}
                      />

                      <div style={{ width: '100%', marginLeft: 15 }}>
                        <Row wrap={false} justify="space-between">
                          <span
                            style={{
                              maxWidth: 200,
                              marginBottom: 0,
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              display: '-webkit-box',
                            }}
                          >
                            {data.title}
                          </span>
                          <p style={{ marginBottom: 0, fontWeight: 500 }}>
                            {formatCash(data.base_price)}
                          </p>
                        </Row>
                        <Row wrap={false} justify="space-between">
                          <p style={{ marginBottom: 0, color: 'gray' }}>{data.sku}</p>
                          <p style={{ marginBottom: 0, color: 'gray' }}>
                            Có thể bán: {formatCash(data.total_quantity)}
                          </p>
                        </Row>
                      </div>
                    </Row>
                  </Select.Option>
                ))}
              </Select>
            </div>
          ) : (
            ''
          )}
          {filter === 'category' ? (
            <div className="select-product-sell">
              <Select
                notFoundContent={loadingSelect ? <Spin size="small" /> : ''}
                dropdownClassName="dropdown-select-search-product"
                allowClear
                showSearch
                clearIcon={<CloseOutlined style={{ color: 'black' }} />}
                suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
                disabled={searchStatus}
                style={{ width: 200 }}
                className={styles['search-product']}
                placeholder="Tìm kiếm theo nhóm sản phẩm"
                dropdownRender={(menu) => (
                  <div>
                    <Row
                      wrap={false}
                      align="middle"
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.open(ROUTES.CATEGORY, '_blank')}
                    >
                      <div
                        style={{
                          paddingLeft: 15,
                          width: 45,
                          height: 50,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <PlusSquareOutlined
                          style={{
                            fontSize: 19,
                          }}
                        />
                      </div>
                      <p
                        style={{
                          marginLeft: 20,
                          marginBottom: 0,
                          fontSize: 16,
                        }}
                      >
                        Thêm mới nhóm sản phẩm
                      </p>
                    </Row>
                    {menu}
                  </div>
                )}
              >
                {category?.map((data) => (
                  <Select.Option value={data.name} key={data.name}>
                    <Row
                      align="middle"
                      wrap={false}
                      style={{ padding: '7px 13px' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const findProduct = dataTableCategory.find(
                          (item) => item.category_id === data.category_id
                        )
                        if (findProduct) {
                          message.error('Chỉ được chọn nhóm sản phẩm khác loại')
                          return
                        }
                        const dataIndex = {
                          category_id: data.category_id,
                          image: data.image,
                          name: data.name,
                          create_date: data.create_date,
                          priority: data.priority,
                          username: data._creator.username,
                        }
                        setDataTableCategory([...dataTableCategory, dataIndex])
                      }}
                    >
                      <img
                        src={data.image ? data.image : IMAGE_DEFAULT}
                        alt=""
                        style={{
                          minWidth: 40,
                          minHeight: 40,
                          maxWidth: 40,
                          maxHeight: 40,
                          objectFit: 'cover',
                        }}
                      />

                      <div style={{ width: '100%', marginLeft: 15 }}>
                        <Row wrap={false} justify="space-between">
                          <span
                            style={{
                              maxWidth: 200,
                              marginBottom: 0,
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              display: '-webkit-box',
                            }}
                          >
                            {data.name}
                          </span>
                        </Row>
                        <Row wrap={false} justify="space-between">
                          <p style={{ marginBottom: 0, color: 'gray' }}>{data.description}</p>
                        </Row>
                      </div>
                    </Row>
                  </Select.Option>
                ))}
              </Select>
            </div>
          ) : (
            ''
          )}
        </Input.Group>
        {selectKeyProduct.length !== 0 || selectKeyCategory.length !== 0 ? (
          <Button
            onClick={filter === 'product' ? _deleteProductTable : _deleteCategoryTable}
            style={{ marginTop: '20px' }}
            type="danger"
            icon={<DeleteOutlined />}
          >
            Xóa
          </Button>
        ) : (
          ''
        )}
        <div className={styles['body_offer_create_content']}>
          {filter === 'product' ? (
            <div>
              <Table
                size="small"
                rowKey="variant_id"
                columns={columnsProduct}
                dataSource={dataTableProduct}
                rowSelection={{
                  selectedRowKeys: selectKeyProduct,
                  onChange: (keys, records) => {
                    // console.log('keys', keys)
                    setSelectKeyProduct(keys)
                    // console.log(selectKeys)
                  },
                }}
                pagination={{
                  position: POSITION_TABLE,
                  page: 1,
                  pageSize: 5,
                }}
              />
            </div>
          ) : (
            ''
          )}
          {filter === 'category' ? (
            <Table
              rowKey="category_id"
              columns={columnsCategory}
              rowSelection={{
                selectedRowKeys: selectKeyCategory,
                onChange: (keys, records) => {
                  setSelectKeyCategory(keys)
                },
              }}
              dataSource={dataTableCategory}
              pagination={{
                position: POSITION_TABLE,
                page: 1,
                pageSize: 5,
              }}
            />
          ) : (
            ''
          )}
          {filter === 'banner' ? <UploadImageBanner /> : ''}
        </div>
      </Form>
    </div>
  )
}
