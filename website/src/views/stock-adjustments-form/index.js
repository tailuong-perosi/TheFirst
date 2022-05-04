import React, { useEffect, useState } from 'react'
import { useHistory, Link, useLocation } from 'react-router-dom'
import { ROUTES, IMAGE_DEFAULT } from 'consts'
import { formatCash } from 'utils'
import { useDispatch } from 'react-redux'

//components
import TitlePage from 'components/title-page'

//antd
import {
  Row,
  Col,
  Input,
  Button,
  Table,
  InputNumber,
  Form,
  Select,
  Spin,
  Modal,
  notification,
  Checkbox,
  Collapse,
} from 'antd'

//icons
import { ArrowLeftOutlined, CloseOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'

//apis
import { getProducts } from 'apis/product'
import { getAllBranch } from 'apis/branch'
import { getUsers } from 'apis/users'
import { getCategories } from 'apis/category'
import { createCheckInventoryNote, updateCheckInventoryNote } from 'apis/inventory'

const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse
export default function CreateReport() {
  const history = useHistory()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const formData = form.getFieldsValue()
  const location = useLocation()

  const [loadingProduct, setLoadingProduct] = useState(false)
  const [isModalQuickAddProduct, setIsModalQuickAddProduct] = useState(false)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [listProduct, setListProduct] = useState([])
  console.log(listProduct)
  const [selectedKeys, setSelectedKeys] = useState([])

  function getSelectedKeys(checkedValues) {
    setSelectedKeys(checkedValues)
  }

  const getDataToCreate = async (data, variant) => {
    console.log("data",data)
    await form.validateFields()
    const dataForm = form.getFieldsValue()
    data.variants.map(item => {
      item.locations.map(location => {
        dataForm.branch_id === location.branch_id &&
          // const body = {
          //   variant_id: variant.variant_id,
          //   sku: variant.sku,
          //   title: variant.title,
          //   unit: data.unit,
          //   total_quantity: dataForm.branch_id === location.branch_id ? location.quantity : location.quantity,
          //   real_quantity: 1,
          // }
          // console.log(body)
          setListProduct(
            [...listProduct,{
            product_id: data.product_id,
            variant_id: variant.variant_id,
            sku: variant.sku,
            title: variant.title,
            unit: data.unit,
            total_quantity: dataForm.branch_id === location.branch_id ? location.quantity : location.quantity,
            real_quantity: 1,
            diff_reason: ""
            
          }]
          

          )
      })
    }
    )
  }

  const deleteDataToCreate = (id) => {
    const cloneData = [...listProduct]
    const indexCloneData = cloneData.findIndex((item) => item.variant_id === id)
    if (indexCloneData !== -1) cloneData.splice(indexCloneData, 1)
    setListProduct(cloneData)
  }

  const _createOrUpdateCheckInventoryNote = async () => {
    try {
      if (listProduct.length === 0) {
        notification.warning({ message: 'Vui lòng thêm sản phẩm vào phiếu kiểm' })
        return
      }
      
      dispatch({ type: 'LOADING', data: true })
      await form.validateFields()
      const dataForm = form.getFieldsValue()
      const body = { ...dataForm, products: listProduct, status: "DRAFT",balance: false,}
      console.log(body)
      let res
      if (!location.state) res = await createCheckInventoryNote(body)
      else res = await updateCheckInventoryNote(body, location.state.inventory_note_id)
      console.log(res)

      if (res.status === 200) {
        if (res.data.success) {
          notification.success({
            message: `${location.state ? 'Cập nhật' : 'Thêm'} phiếu kiểm hàng thành công`,
          })
          history.push({ pathname: ROUTES.STOCK_ADJUSTMENTS })
        } else
          notification.error({
            message:
              res.data.message ||
              `${location.state ? 'Cập nhật' : 'Thêm'} phiếu kiểm hàng thất bại, vui lòng thử lại!`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${location.state ? 'Cập nhật' : 'Thêm'} phiếu kiểm hàng thất bại, vui lòng thử lại!`,
        })

      dispatch({ type: 'LOADING', data: false })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'LOADING', data: false })
    }
  }
  const _createOrUpdateCheckInventoryNoteBalance = async () => {
    try {
      if (listProduct.length === 0) {
        notification.warning({ message: 'Vui lòng thêm sản phẩm vào phiếu kiểm' })
        return
      }
      
      dispatch({ type: 'LOADING', data: true })
      await form.validateFields()
      const dataForm = form.getFieldsValue()
      const body = { ...dataForm, products: listProduct, status: "BALANCED",balance: true,}
      console.log(body)
      let res
      if (!location.state) res = await createCheckInventoryNote(body)
      else res = await updateCheckInventoryNote(body, location.state.inventory_note_id)
      console.log(res)

      if (res.status === 200) {
        if (res.data.success) {
          notification.success({
            message: `${location.state ? 'Cập nhật' : 'Thêm'} phiếu kiểm hàng thành công`,
          })
          history.push({ pathname: ROUTES.STOCK_ADJUSTMENTS })
        } else
          notification.error({
            message:
              res.data.message ||
              `${location.state ? 'Cập nhật' : 'Thêm'} phiếu kiểm hàng thất bại, vui lòng thử lại!`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${location.state ? 'Cập nhật' : 'Thêm'} phiếu kiểm hàng thất bại, vui lòng thử lại!`,
        })

      dispatch({ type: 'LOADING', data: false })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'LOADING', data: false })
    }
  }

  const _getProducts = async () => {
    try {
      setLoadingProduct(true)
      const res = await getProducts()
      if (res.status === 200) {
        setProducts(res.data.data)
      }
      setLoadingProduct(false)
    } catch (err) {
      console.log(err)
      setLoadingProduct(false)
    }
  }

  const _getProductsByCategories = async (query) => {
    try {
      dispatch({ type: 'LOADING', data: true })
      const res = await getProducts(query)
      if (res.status === 200) {
        let cloneData = []
        res.data.data.map((item) => item.variants?.map((e) => cloneData.push(e)))
        setListProduct(cloneData)
        setIsModalQuickAddProduct(false)
        setSelectedKeys([])
      }
      dispatch({ type: 'LOADING', data: false })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'LOADING', data: false })
    }
  }

  const _getCategories = async () => {
    try {
      const res = await getCategories()
      console.log(res)
      if (res.status === 200) {
        const categoriesNew = []
        res.data.data.map((e) => categoriesNew.push(e))
        res.data.data.map((e) => e.children_category.map((c) => categoriesNew.push(c)))
        res.data.data.map((e) =>
          e.children_category.map((c) => c.children_category.map((k) => categoriesNew.push(k)))
        )
        setCategories(categoriesNew)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      console.log(res)
      if (res.status === 200) {
        setBranches(res.data.data)
        if (!location.state) {
          const branchId = res.data.data.length ? res.data.data[0].branch_id : ''
          form.setFieldsValue({ branch_id: branchId })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const _getUsers = async () => {
    try {
      const res = await getUsers()
      if (res.status === 200) {
        setUsers(res.data.data)
        if (!location.state)
          form.setFieldsValue({
            inventorier_id: res.data.data.length ? res.data.data[0].user_id : '',
          })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: 60,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
    },
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'title',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
    },
    {
      title: 'Số lượng hệ thống',
      // render: (text, record) => console.log(record.total_quantity),
      render: (text, record) => formatCash(record.total_quantity || 0),
    },
    {
      title: 'Số lượng thực tế',
      render: (text, record, index) => (
        <InputNumber
          style={{ width: 150 }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          min={1}
          value={record.real_quantity || 1}
          onChange={(value) => {
            const listProductNew = [...listProduct]
            listProductNew[index].real_quantity = value
            setListProduct([...listProductNew])
          }}
        />
      ),
    },
    {
      title: 'Lý do chênh lệt',
      
      render: (text, record, index) => (
        <Input
          style={{ width: 150 }}
          value={record.diff_reason}
          onChange={(value) => {
            const listProductNew = [...listProduct]
            listProductNew[index].diff_reason = value.target.value
            setListProduct([...listProductNew])
          }}
        />
      ),
    },
    {
      title: 'Hành động',
      width: 100,
      render: (text, record) => (
        <Button
          onClick={() => deleteDataToCreate(record.variant_id)}
          type="primary"
          danger
          icon={<DeleteOutlined />}
        />
      ),
    },
  ]

  useEffect(() => {
    _getBranches()
    _getProducts()
    _getUsers()
    _getCategories()
  }, [])

  useEffect(() => {
    if (location.state) {
      console.log(location.state)
      form.setFieldsValue({
        ...location.state,
        note_creator_id: location.state.creator,
      })
      setListProduct(location.state.products)
    } else {
      form.resetFields()
      setListProduct([])
    }
  }, [])

  useEffect(() => {

  }, [])

  return (
    <div className="card">
      <Form layout="vertical" form={form} >
        <TitlePage
          isAffix={true}
          title={
            <Link to={ROUTES.STOCK_ADJUSTMENTS}>
              <Row
                align="middle"
                style={{
                  fontSize: 18,
                  color: 'black',
                  fontWeight: 600,
                  width: 'max-content',
                }}
              >
                <ArrowLeftOutlined style={{ marginRight: 5 }} />
                {location.state ? 'Cập nhật' : 'Tạo'} phiếu kiểm hàng
              </Row>
            </Link>
          }
        >
          <div>
          <Button
            type="primary"
            size="large" 
            htmlType="submit"
            onClick={_createOrUpdateCheckInventoryNote}
          >
           Tạo 
          </Button>
          <Button style={{ minWidth: 100 ,marginLeft:5}} size="large" type="primary" htmlType="submit" onClick={_createOrUpdateCheckInventoryNoteBalance}>
            {location.state ? 'Lưu' : 'Tạo và cân bằng'}
          </Button>
          </div>
        
        </TitlePage>

        <Row>
          <h3>Thông tin phiếu kiểm hàng</h3>
        </Row>
        <Row gutter={16} style={{ marginTop: 15 }}>
          <Col span={6}>
            <Form.Item
              label="Chi nhánh phiếu kiểm"
              name="branch_id"
              rules={[{ required: true, message: 'Vui lòng chọn chi nhánh phiếu kiểm!' }]}
            >
              <Select
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Chọn chi nhánh"
                optionFilterProp="children"
                onChange={e => console.log(e)}
              >
                {branches.map((branch, index) => (
                  <Option key={index} value={branch.branch_id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Nhân viên kiểm"
              name="inventorier_id"
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên kiểm!' }]}
            >
              <Select
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder="Chọn nhân viên"
                optionFilterProp="children"
              >
                {users.map((user, index) => (
                  <Option key={index} value={user.user_id}>
                    {user.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ghi chú" name="note">
              <TextArea placeholder="Nhập ghi chú" rows={1} style={{ maxWidth: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <div>
          <h3>Danh sách sản phẩm</h3>
          <Row>
            <Col span={8}>
              <Button
                onClick={() => setIsModalQuickAddProduct(true)}
                style={{ width: '90%' }}
                type="primary"
              >
                Thêm nhóm hàng
              </Button>
            </Col>
            <Col span={16}>
              <Select
                notFoundContent={loadingProduct ? <Spin size="small" /> : null}
                dropdownClassName="dropdown-select-search-product"
                allowClear
                showSearch
                clearIcon={<CloseOutlined style={{ color: 'black' }} />}
                suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
                style={{ width: '100%', marginBottom: 15 }}
                placeholder="Thêm sản phẩm vào phiếu kiểm"
                dropdownRender={(menu) => <div>{menu}</div>}
              >
                {products.map(
                  (data) =>
                    data.variants &&
                    data.variants.map((variant, index) => (
                      <Select.Option value={variant.title} key={variant.variant_id}>
                        <Row
                          key={index}
                          align="middle"
                          wrap={false}
                          style={{ padding: '7px 13px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            const findProduct = listProduct.find(
                              (item) => item.variant_id === variant.variant_id
                            )
                            if (findProduct) {
                              notification.warning({
                                message: 'Bạn đã chọn sản phẩm này rồi!',
                              })
                              return
                            }
                            getDataToCreate(data, variant, index)
                            // console.log([...body])
                          }}
                        >
                          <img
                            src={variant.image[0] ? variant.image[0] : IMAGE_DEFAULT}
                            alt={variant.title}
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
                                {variant.title}
                              </span>
                              <p style={{ marginBottom: 0, fontWeight: 500 }}>
                                {formatCash(variant.price)}
                              </p>
                            </Row>
                          </div>
                        </Row>
                      </Select.Option>
                    ))
                )}
              </Select>
            </Col>
          </Row>
          <Table
            scroll={{ y: 400 }}
            pagination={false}
            columns={columns}
            size="small"
            dataSource={listProduct}
          />
        </div>
      </Form>

      <Modal
        title="Chọn nhiều sản phẩm"
        visible={isModalQuickAddProduct}
        onOk={() => _getProductsByCategories({ category_id: selectedKeys.join('---') })}
        okText="Thêm vào đơn"
        onCancel={() => {
          setIsModalQuickAddProduct(false)
          setSelectedKeys([])
        }}
        width="70%"
      >
        <Checkbox
          onChange={(e) => {
            if (e.target.checked)
              setSelectedKeys(categories.map((category) => category.category_id))
            else setSelectedKeys([])
          }}
        >
          Tất cả sản phẩm
        </Checkbox>

        <Collapse accordion bordered={false} defaultActiveKey="1">
          <Panel className="edit-collapse-panel" header="Theo nhóm sản phẩm" key="1">
            <Checkbox.Group
              value={selectedKeys}
              style={{ width: '100%' }}
              onChange={getSelectedKeys}
            >
              <Row gutter={[0, 15]}>
                {categories.map((category) => (
                  <Col span={6}>
                    <Checkbox value={category.category_id}>{category.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Panel>
        </Collapse>
      </Modal>
    </div>
  )
}
