import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { ACTION, IMAGE_DEFAULT, ROUTES } from 'consts'
import { compare, formatCash } from 'utils'
import { useHistory } from 'react-router-dom'

//components
import TitlePage from 'components/title-page'

import {
  Select,
  Button,
  Input,
  Form,
  Row,
  Col,
  notification,
  InputNumber,
  DatePicker,
  Table,
  Space,
  Spin,
} from 'antd'
import {
  FileExcelOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

//apis
import { getAllBranch } from 'apis/branch'
import { getProducts } from 'apis/product'
import { addTransportOrder, updateTransportOrder } from 'apis/transport'

export default function ShippingProductAdd() {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const history = useHistory()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [modalImportVisible, setModalImportVisible] = useState(false)
  const [exportLocation, setExportLocation] = useState({})
  const [importLocation, setImportLocation] = useState({})
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [productsTransport, setProductsTransport] = useState([])

  const columns = [
    {
      width: 100,
      title: 'STT',
      render: (data, record, index) => index + 1,
    },
    {
      title: 'Mã hàng',
      dataIndex: 'sku',
      sorter: (a, b) => compare(a, b, 'sku'),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      sorter: (a, b) => compare(a, b, 'title'),
    },
    // {
    //   title: 'Tồn kho',
    //   width: 150,
    //   sorter: (a, b) => compare(a, b, 'available_stock_quantity'),
    //   render(data) {
    //     return data.available_stock_quantity
    //   },
    // },
    {
      title: 'Số lượng',
      render: (text, record, index) => (
        <InputNumber
          style={{ width: 200 }}
          onBlur={(e) => {
            let value = e.target.value.replaceAll(',', '')
            _editProductInTransport('quantity', +value, index)
          }}
          defaultValue={record.quantity || 1}
          min={1}
          max={record.locations && record.locations.length ? record.locations[0].quantity : 10000}
          placeholder="Nhập số lượng"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
        />
      ),
    },
    {
      width: 110,
      title: 'Hành động',
      render: (text, record, index) => (
        <DeleteOutlined onClick={() => _deleteProductInTransport(index)} style={{ color: 'red' }} />
      ),
    },
  ]

  const _editProductInTransport = (attribute = '', value = '', index = 0) => {
    const productsTransportNew = [...productsTransport]
    productsTransportNew[index][attribute] = value
    setProductsTransport([...productsTransportNew])
  }

  const _addProductToTransport = (product) => {
    const productsTransportNew = [...productsTransport]
    const productFind = productsTransportNew.find((e) => e.variant_id === product.variant_id)
    if (!productFind) {
      productsTransportNew.push(product)
      setProductsTransport([...productsTransportNew])
    }
  }

  const _deleteProductInTransport = (index) => {
    const productsTransportNew = [...productsTransport]
    productsTransportNew.splice(index, 1)
    setProductsTransport([...productsTransportNew])
  }

  const _addOrEditTransportOrder = async (status = 'DRAFT') => {
    await form.validateFields()

    try {
      const dataForm = form.getFieldsValue()

      if (productsTransport.length === 0) {
        notification.warning({ message: 'Vui lòng chọn sản phẩm cần chuyển hàng!' })
        return
      }

      if (exportLocation.branch_id === importLocation.branch_id) {
        notification.warning({
          message: 'Chi nhánh chuyển và chi nhánh nhận không thể trùng nhau!',
        })
        return
      }

      const body = {
        note: dataForm.note || '',
        tags: dataForm.tags || [],
        delivery_time: new Date(dataForm.delivery_time).toString(),
        export_location: { ...exportLocation },
        import_location: { ...importLocation },
        products: productsTransport.map((e) => ({
          product_id: e.product_id,
          variant_id: e.variant_id,
          quantity: +e.quantity,
        })),
      }

      dispatch({ type: ACTION.LOADING, data: true })

      let res
      if (history.location.state)
        res = await updateTransportOrder(body, history.location.state.order_id)
      else res = await addTransportOrder({ ...body, status: status })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({
            message: `${history.location.state ? 'Cập nhật' : 'Tạo'} phiếu chuyển hàng thành công`,
          })
          history.push(ROUTES.SHIPPING_PRODUCT)
        } else
          notification.error({
            message:
              res.data.message ||
              `${
                history.location.state ? 'Cập nhật' : 'Tạo'
              } phiếu chuyển hàng thất bại, vui lòng thử lại`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${
              history.location.state ? 'Cập nhật' : 'Tạo'
            } phiếu chuyển hàng thất bại, vui lòng thử lại`,
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) setBranches(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getProducts = async () => {
    try {
      setLoading(true)
      const res = await getProducts({
        ...exportLocation,
        merge: true,
        detach: true,
        branch_id: branchIdApp,
      })
      console.log(res)
      if (res.status === 200) setProducts(res.data.data.map((e) => e.variants))
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    _getProducts()
  }, [exportLocation])

  useEffect(() => {
    _getBranches()
  }, [])

  useEffect(() => {
    console.log(history.location.state)
    if (history.location.state) {
      form.setFieldsValue({
        note: history.location.state.note || '',
        tags: history.location.state.tags || [],
        delivery_time: history.location.state.delivery_time
          ? moment(history.location.state.delivery_time)
          : null,
        export_location: history.location.state.export_location_info.name || '',
        import_location: history.location.state.import_location_info.name || '',
      })

      setExportLocation(history.location.state.export_location)
      setImportLocation(history.location.state.import_location)

      setProductsTransport(
        history.location.state.products.map((e) => {
          return {
            ...e,
            ...e.variant_info,
          }
        })
      )
    }
  }, [])

  return (
    <div className="card">
      <TitlePage
        isAffix={true}
        title={
          <Row
            style={{ cursor: 'pointer', width: 'max-content' }}
            wrap={false}
            align="middle"
            onClick={() => history.goBack()}
          >
            <ArrowLeftOutlined style={{ marginRight: 7 }} />
            {history.location.state ? 'Cập nhật' : 'Thêm'} phiếu chuyển hàng
          </Row>
        }
      >
        <Space>
          <Button
            style={{ display: history.location.state && 'none' }}
            size="large"
            type="primary"
            onClick={() => _addOrEditTransportOrder()}
          >
            Lưu nháp
          </Button>
          <Button
            style={{ display: history.location.state && 'none' }}
            size="large"
            type="primary"
            onClick={() => _addOrEditTransportOrder('COMPLETE')}
          >
            Tạo phiếu chuyển hàng và hoàn tất
          </Button>
          <Button
            style={{ display: !history.location.state && 'none' }}
            size="large"
            type="primary"
            onClick={() => _addOrEditTransportOrder()}
          >
            Cập nhật
          </Button>
          <Button
            style={{
              display:
                history.location.state && history.location.state.status !== 'COMPLETE'
                  ? ''
                  : 'none',
            }}
            size="large"
            type="primary"
            onClick={() => _addOrEditTransportOrder('COMPLETE')}
          >
            Hoàn thành phiếu chuyển
          </Button>
        </Space>
      </TitlePage>

      <Form form={form} layout="vertical">
        <Row gutter={[15, 16]} style={{ marginTop: 15 }}>
          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng chọn nơi chuyển' }]}
              label="Nơi chuyển"
              name="export_location"
            >
              <Select
                showSearch
                onChange={(value) => {
                  let p = {}
                  if (value) {
                    const branchFind = branches.find((e) => e.name === value)
                    if (branchFind) p.branch_id = branchFind.branch_id
                  }
                  setExportLocation({ ...p })
                }}
                allowClear
                size="large"
                placeholder="Chọn nơi chuyển"
              >
                {branches.map((e, index) => (
                  <Select.Option value={e.name} key={index}>
                    {e.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng chọn nơi nhận' }]}
              label="Nơi nhận"
              name="import_location"
            >
              <Select
                onChange={(value) => {
                  let p = {}
                  if (value) {
                    const branchFind = branches.find((e) => e.name === value)
                    if (branchFind) p.branch_id = branchFind.branch_id
                  }

                  setImportLocation({ ...p })
                }}
                showSearch
                allowClear
                size="large"
                placeholder="Chọn nơi nhận"
              >
                {branches.map((e, index) => (
                  <Select.Option value={e.name} key={index}>
                    {e.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item
              rules={[{ required: true, message: 'Vui lòng chọn ngày giao' }]}
              name="delivery_time"
              label="Ngày giao"
            >
              <DatePicker
                placeholder="Chọn ngày giao"
                style={{ width: '100%' }}
                size="large"
                className="br-15__date-picker"
                showTime={{ format: 'HH:mm' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item label="Tags" name="tags">
              <Select mode="tags" allowClear size="large" placeholder="Nhập tags"></Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea size="large" rows={1} placeholder="Nhập ghi chú" />
            </Form.Item>
          </Col>
        </Row>

        <Row wrap={false} style={{ marginBottom: 20, marginTop: 25 }}>
          <Select
            size="large"
            notFoundContent={loading ? <Spin size="small" /> : null}
            dropdownClassName="dropdown-select-search-product"
            allowClear
            showSearch
            clearIcon={<CloseOutlined style={{ color: 'black' }} />}
            suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
            style={{ width: '100%', marginRight: 40 }}
            placeholder="Thêm sản phẩm vào danh sách"
            dropdownRender={(menu) => <div>{menu}</div>}
          >
            {products.map((data, index) => (
              <Select.Option value={data.title} key={index}>
                <Row
                  align="middle"
                  wrap={false}
                  style={{ padding: '7px 13px' }}
                  onClick={(e) => {
                    if (data.locations && data.locations.length) _addProductToTransport(data)
                    e.stopPropagation()
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
                      <p style={{ marginBottom: 0, fontWeight: 500 }}>{formatCash(data.price)}</p>
                    </Row>
                    <Row wrap={false} justify="space-between">
                      <p style={{ marginBottom: 0, color: 'gray' }}>{data.sku}</p>
                      <p
                        style={{
                          marginBottom: 0,
                          color: data.locations && data.locations.length ? 'gray' : 'red',
                        }}
                      >
                        Số lượng hiện tại:{' '}
                        {formatCash(
                          data.locations && data.locations.length ? data.locations[0].quantity : 0
                        )}
                      </p>
                    </Row>
                  </div>
                </Row>
              </Select.Option>
            ))}
          </Select>
          <Button
            size="large"
            icon={<FileExcelOutlined />}
            onClick={() => setModalImportVisible(true)}
            style={{ backgroundColor: '#004F88', color: 'white' }}
          >
            Nhập excel
          </Button>
        </Row>

        <Row>
          <div style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>
            Danh sách sản phẩm chuyển hàng
          </div>
        </Row>
        <Table
          style={{ width: '100%' }}
          size="small"
          pagination={false}
          columns={columns}
          dataSource={productsTransport}
          scroll={{ y: 500 }}
        />
      </Form>
    </div>
  )
}
