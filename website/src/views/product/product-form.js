import React, { useState, useEffect, useRef } from 'react'
import styles from './product.module.scss'

import { ACTION, ROUTES, PERMISSIONS } from 'consts'
import { removeAccents } from 'utils'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CKEditor } from 'ckeditor4-react'
import parse from 'html-react-parser'
import delay from 'delay'

//components
import NotSupportMobile from 'components/not-support-mobile'
import TitlePage from 'components/title-page'
import SupplierForm from 'views/supplier/supplier-form'
import Permission from 'components/permission'
import CreateCategory from 'views/category'

//antd
import {
  Button,
  Table,
  Input,
  Form,
  Row,
  Col,
  InputNumber,
  Select,
  Upload,
  Checkbox,
  notification,
  Popconfirm,
  Tooltip,
  Space,
  Modal,
  Affix,
  Switch,
  Tabs,
  TreeSelect,
  Badge,
  Drawer,
} from 'antd'

//icons
import {
  ArrowLeftOutlined,
  InboxOutlined,
  CloseOutlined,
  PlusOutlined,
  EditOutlined,
  FileImageOutlined,
  DollarOutlined,
  ReloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
  PlusCircleFilled,
  LoadingOutlined,
  CloseCircleFilled,
} from '@ant-design/icons'

//apis
import { getCategories } from 'apis/category'
import { getSuppliers } from 'apis/supplier'
import { uploadFiles, uploadFile } from 'apis/upload'
import { getWarranties, addWarranty } from 'apis/warranty'
import { updateProduct, addProduct } from 'apis/product'

export default function ProductAdd() {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()
  const [form] = Form.useForm()
  const [formGuarantee] = Form.useForm()
  const typingTimeoutRef = useRef(null)
  const dataUser = useSelector((state) => state.login.dataUser)
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [visibleListProduct, setVisibleListProduct] = useState(false)
  const [keyTab, setKeyTab] = useState('1')
  const [isRenderFirst, setIsRenderFirst] = useState(false)
  const [files, setFiles] = useState([])
  const [idsWarranty, setIdsWarranty] = useState([''])
  const [warranties, setWarranties] = useState([])
  const [attributes, setAttributes] = useState([{ option: '', values: [] }])
  const [variants, setVariants] = useState([])
  const [selectRowKeyVariant, setSelectRowKeyVariant] = useState([])
  const [imagesPreviewProduct, setImagesPreviewProduct] = useState([]) //url image
  const [isMobile, setIsMobile] = useState(false)
  const [description, setDescription] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [supplier, setSupplier] = useState('') // dung o variant
  const [imagesProduct, setImagesProduct] = useState([])
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [isGeneratedSku, setIsGeneratedSku] = useState(false)
  const [valueGeneratedSku, setValueGeneratedSku] = useState('')
  const [skuProductWithEdit, setSkuProductWithEdit] = useState('')
  const [bulkPrices, setBulkPrices] = useState([
    { min_quantity_apply: 1, max_quantity_apply: 999, price: 0 },
  ]) //giá sỉ

  const toggleDrawerListProduct = () => {
    setVisibleListProduct(!visibleListProduct)
  }

  const addAttribute = () => {
    let attributesNew = [...attributes]
    attributesNew.push({ option: '', values: [] })
    setAttributes([...attributesNew])
  }

  const removeAttribute = (index) => {
    let attributesNew = [...attributes]
    attributesNew.splice(index, 1)
    setAttributes([...attributesNew])
  }

  const addValueVariant = () => {
    let variantsNew = []

    const dataForm = form.getFieldsValue()
    console.log(dataForm)

    const initVariant = {
      image: imagesProduct || [],
      price: dataForm.price || 0,
      bulk_prices: [...bulkPrices],
      enable_bulk_price: true,
    }

    if (attributes.length !== 0) {
      //trường hợp chỉ có 1 attribute
      if (attributes.length === 1) {
        attributes[0].values.map((value) => {
          variantsNew.push({
            title: `${(
              dataForm.name || ''
            ).toUpperCase()} ${attributes[0].option.toUpperCase()} ${value.toUpperCase()}`,
            sku: `${
              valueGeneratedSku || ''
            }-${attributes[0].option.toUpperCase()}-${value.toUpperCase()}`,
            options: [{ name: attributes[0].option, value: value }],
            ...initVariant,
          })
        })
      } else {
        //trường hợp có 2 attribute
        if (!attributes[0].values.length)
          attributes[1].values.map((value) => {
            variantsNew.push({
              title: `${(
                dataForm.name || ''
              ).toUpperCase()} ${attributes[1].option.toUpperCase()} ${value.toUpperCase()}`,
              sku: `${
                valueGeneratedSku || ''
              }-${attributes[1].option.toUpperCase()}-${value.toUpperCase()}`,
              options: [{ name: attributes[1].option, value: value }],
              ...initVariant,
            })
          })

        if (!attributes[1].values.length)
          attributes[0].values.map((value) => {
            variantsNew.push({
              title: `${(
                dataForm.name || ''
              ).toUpperCase()} ${attributes[0].option.toUpperCase()} ${value.toUpperCase()}`,
              sku: `${
                valueGeneratedSku || ''
              }-${attributes[0].option.toUpperCase()}-${value.toUpperCase()}`,
              options: [{ name: attributes[0].option, value: value }],
            })
          })

        if (attributes[0].values.length && attributes[1].values.length)
          attributes[0].values.map((v0) => {
            attributes[1].values.map((v1) => {
              variantsNew.push({
                title: `${(
                  dataForm.name || ''
                ).toUpperCase()} ${attributes[0].option.toUpperCase()} ${v0} ${attributes[1].option.toUpperCase()} ${v1}`,
                sku: `${
                  valueGeneratedSku || ''
                }-${attributes[0].option.toUpperCase()}-${v0}-${attributes[1].option.toUpperCase()}-${v1}`,
                options: [
                  { name: attributes[0].option, value: v0 },
                  { name: attributes[1].option, value: v1 },
                ],
                ...initVariant,
              })
            })
          })
      }
    }

    variantsNew = variantsNew.map((e) => {
      const variantCurrent = variants.find((v) => v.title === e.title)
      if (variantCurrent) return variantCurrent
      else return e
    })

    setVariants([...variantsNew])
  }

  const _addBulkPriceOfVariant = (index) => {
    const variantsNew = [...variants]
    const bulkPrice = { min_quantity_apply: 1, max_quantity_apply: 1, price: 0 }
    variantsNew[index].bulk_prices = [...variantsNew[index].bulk_prices, { ...bulkPrice }]
    setVariants([...variantsNew])
  }

  const _enableBulkPriceOfVariant = (value, variant) => {
    const variantsNew = [...variants]
    const indexVariant = variantsNew.findIndex((e) => e.title === variant.title)
    if (indexVariant !== -1) variantsNew[indexVariant].enable_bulk_price = value
    setVariants([...variantsNew])
  }

  const _editBulkPriceOfVariant = (value, attribute = '', index, indexBulkPrice) => {
    const variantsNew = [...variants]
    variantsNew[index].bulk_prices[indexBulkPrice][attribute] = value
    setVariants([...variantsNew])
  }

  const _deleteBulkPriceOfVariant = (index, indexBulkPrice) => {
    const variantsNew = [...variants]
    variantsNew[index].bulk_prices.splice(indexBulkPrice, 1)
    setVariants([...variantsNew])
  }

  const _addBulkPrice = () => {
    const bulkPricesNew = [...bulkPrices]
    const bulkPrice = { min_quantity_apply: 1, max_quantity_apply: 999, price: 0 }
    // if (bulkPricesNew.length) {
    //   bulkPrice.min_quantity_apply = bulkPricesNew[bulkPricesNew.length - 1].max_quantity_apply + 1
    //   bulkPrice.max_quantity_apply = bulkPricesNew[bulkPricesNew.length - 1].max_quantity_apply + 10
    // }

    bulkPricesNew.push(bulkPrice)
    setBulkPrices([...bulkPricesNew])
  }

  const _editBulkPrice = (attribute = '', value = '', index = 0) => {
    const bulkPricesNew = [...bulkPrices]
    bulkPricesNew[index][attribute] = value
    setBulkPrices([...bulkPricesNew])
  }

  const _deleteBulkPrice = (index = 0) => {
    const bulkPricesNew = [...bulkPrices]
    bulkPricesNew.splice(index, 1)
    setBulkPrices([...bulkPricesNew])
  }

  const _getSuppliers = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getSuppliers()
      if (res.status === 200) {
        if (res.data.data && res.data.data.length) {
          if (!location.state) {
            let supplierDefault = res.data.data.find(
              (supplier) => supplier.active && supplier.default
            )
            if (supplierDefault) {
              form.setFieldsValue({ supplier_id: supplierDefault.supplier_id })
              setSupplier(supplierDefault.name)
            } else form.setFieldsValue({ supplier_id: res.data.data[0].supplier_id })
          }
          setSuppliers(res.data.data)
        }
      }

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const addOrUpdateProduct = async () => {
    //validated
    let isValidated = true
    try {
      await form.validateFields()
      isValidated = true
    } catch (error) {
      isValidated = false
    }

    if (!isValidated) return

    // if (variants.length === 0) {
    //   notification.error({ message: 'Vui lòng nhập ít nhất một thuộc tính' })
    //   return
    // }

    //validated, prices
    for (let i = 0; i < variants.length; ++i)
      if (!variants[i].price) {
        notification.error({ message: 'Vui lòng nhập giá bán trong thuộc tính!' })
        return
      }

    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const formProduct = form.getFieldsValue()

      //phát sinh sku nếu user ko điền sku
      let valueDefaultSku = ''
      if (!formProduct.sku) {
        const generatedItemsSku = formProduct.name.split(' ')
        valueDefaultSku = generatedItemsSku
          .map((items) => (items[0] ? removeAccents(items[0]).toUpperCase() : ''))
          .join('')
      }

      let body = {
        sku: !isGeneratedSku
          ? formProduct.sku
            ? formProduct.sku
            : valueDefaultSku
          : valueGeneratedSku,
        barcode: '',
        name: formProduct.name,
        category_id: formProduct.category_id,
        supplier_id: formProduct.supplier_id,
        length: formProduct.length || '',
        width: formProduct.width || '',
        height: formProduct.height || '',
        weight: formProduct.weight || '',
        unit: formProduct.unit || '',
        files: files || [],
        warranties: warranties,
        description: description || '',
        images: imagesProduct || [],
      }

      body.attributes = attributes

      const variantsNew = variants.map((v) => ({ ...v, supplier: supplier || '' }))
      body.variants = variantsNew

      console.log(body)

      let res
      //case update product
      if (location.state) res = await updateProduct(body, location.state.product_id)
      else res = await addProduct({ products: [body] })
      console.log(res)
      if (res.status === 200) {
        notification.success({
          message: `${location.state ? 'Cập nhật' : 'Tạo'} sản phẩm thành công!`,
        })
        history.goBack()
      } else
        notification.error({
          message: res.data.message || `${location.state ? 'Cập nhật' : 'Tạo'} sản phẩm thất bại!`,
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const [categories, setCategories] = useState([])
  const _getCategories = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getCategories()
      if (res.status === 200) {
        if (res.data.data && res.data.data.length) {
          const category = res.data.data.find((category) => category.active && category.default)
          if (!location.state) {
            if (category) form.setFieldsValue({ category_id: [category.category_id] })
            else form.setFieldsValue({ category_id: [res.data.data[0].category_id] })
          }
          setCategories(res.data.data.filter((e) => e.active))
        }
      }

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  /* list input variants */
  const uploadImage = async (file, indexVariant) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      let variantsNew = [...variants]

      const url = await uploadFile(file)
      if (url) variantsNew[indexVariant].image = [url]

      setVariants([...variantsNew])
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const UploadImageWithEditProduct = () => {
    return (
      <Upload.Dragger
        name="files"
        listType="picture"
        multiple
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        onChange={(info) => {
          if (info.file.status !== 'done') info.file.status = 'done'

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
          typingTimeoutRef.current = setTimeout(async () => {
            let files = []
            let urls = []
            info.fileList.map((f) => {
              if (f.originFileObj) files.push(f.originFileObj)
              else urls.push(f.url)
            })
            dispatch({ type: ACTION.LOADING, data: true })
            const images = await uploadFiles(files)
            dispatch({ type: ACTION.LOADING, data: false })
            setImagesPreviewProduct([...images, ...urls])
          }, 350)
        }}
        fileList={imagesPreviewProduct.map((e, index) => {
          let nameFile = ['image']
          if (typeof e === 'string') nameFile = e.split('/')
          return {
            uid: index,
            name: nameFile[nameFile.length - 1] || 'image',
            status: 'done',
            url: e,
            thumbUrl: e,
          }
        })}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
        <p className="ant-upload-hint">Hỗ trợ định dạng .PNG, .JPG, .TIFF, .EPS</p>
      </Upload.Dragger>
    )
  }

  const UploadImageProduct = ({ variant }) => (
    <Upload
      name="avatar"
      listType="picture-card"
      className="upload-variant-image"
      showUploadList={false}
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      data={(file) => {
        const indexVariant = variants.findIndex((ob) => ob.title === variant.title)
        if (indexVariant !== -1) uploadImage(file, indexVariant)
      }}
    >
      {variant.image && variant.image.length ? (
        <img src={variant.image[0] || ''} alt="" style={{ width: '100%' }} />
      ) : (
        <PlusOutlined />
      )}
    </Upload>
  )

  const ModalAddGuarantee = () => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)

    const _addGuarantee = async () => {
      try {
        await formGuarantee.validateFields()
        const body = formGuarantee.getFieldsValue()
        const res = await addWarranty(body)
        if (res.status === 200) {
          if (res.data.success) {
            _getWarranties()
            notification.success({ message: 'Thêm chính sách bảo hành thành công' })
            toggle()
            formGuarantee.resetFields()
          } else
            notification.error({
              message: res.data.message || 'Thêm chính sách bảo hành thất bại, vui lòng thử lại',
            })
        } else
          notification.error({
            message: res.data.message || 'Thêm chính sách bảo hành thất bại, vui lòng thử lại',
          })
      } catch (e) {
        console.log(e)
      }
    }

    return (
      <>
        <Tooltip title="Thêm chính sách bảo hành">
          <Button
            onClick={toggle}
            style={{ marginLeft: 10 }}
            size="large"
            icon={<PlusOutlined />}
            type="primary"
          />
        </Tooltip>

        <Modal
          onOk={_addGuarantee}
          width="60%"
          cancelText="Đóng"
          okText="Tạo"
          title="Thêm chính sách bảo hành"
          onCancel={toggle}
          visible={visible}
        >
          <Form form={formGuarantee} layout="vertical">
            <Row style={{ width: '100%', justifyContent: 'space-between', marginTop: 15 }}>
              <Col span={11}>
                <Form.Item
                  label="Tên bảo hành"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên bảo hành' }]}
                >
                  <Input size="large" placeholder="Nhập tên bảo hành" />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  label="Thời hạn bảo hành (tháng)"
                  name="time"
                  rules={[{ required: true, message: 'Vui lòng nhập thời hạn bảo hành' }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="Nhập thời hạn bảo hành"
                    style={{ width: '100%' }}
                    size="large"
                    className="br-15__input"
                  />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  label="Loại bảo hành"
                  name="type"
                  rules={[{ required: true, message: 'Vui lòng nhập loại bảo hành' }]}
                >
                  <Input size="large" placeholder="Nhập tên bảo hành" />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={5} placeholder="Nhập mô tả" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </>
    )
  }

  const InputSku = ({ value, variant }) => {
    const [valueSku, setValueSku] = useState(value)

    return (
      <Input
        disabled={location.state ? true : false}
        placeholder="Nhập sku"
        size="large"
        defaultValue={value}
        onBlur={() => {
          let variantsNew = [...variants]
          const index = variantsNew.findIndex((e) => e.title === variant.title)
          variantsNew[index].sku = valueSku
          setVariants([...variantsNew])
        }}
        onChange={(e) => setValueSku(e.target.value)}
        style={{ width: '100%' }}
      />
    )
  }

  const InputSalePrice = ({ value, variant }) => {
    const [valueSalePrice, setValueSalePrice] = useState(value)

    return (
      <InputNumber
        placeholder="Nhập giá bán"
        className="br-15__input"
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
        size="large"
        defaultValue={value}
        min={0}
        onBlur={() => {
          let variantsNew = [...variants]
          const index = variantsNew.findIndex((e) => e.title === variant.title)
          variantsNew[index].price = valueSalePrice
          setVariants([...variantsNew])
        }}
        onChange={(value) => setValueSalePrice(value)}
        style={{ width: '100%' }}
      />
    )
  }

  const UploadAllVariant = () => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)
    const [image, setImage] = useState('')
    const [loading, setLoading] = useState(false)

    const upload = () => {
      const variantsNew = [...variants]

      selectRowKeyVariant.map((key) => {
        const indexVariant = variantsNew.findIndex((ob) => ob.title === key)
        variantsNew[indexVariant].image = [image]
      })

      setVariants([...variantsNew])

      toggle()
    }

    //reset
    useEffect(() => {
      if (!visible) setImage('')
    }, [visible])

    return (
      <>
        <Button size="large" onClick={toggle} icon={<FileImageOutlined />}>
          Chỉnh sửa ảnh
        </Button>
        <Modal
          visible={visible}
          title="Chọn ảnh"
          onCancel={toggle}
          onOk={upload}
          footer={
            <Row justify="end">
              <Space>
                <Button onClick={() => setVisible(false)}>Đóng</Button>
                <Button loading={loading} type="primary" onClick={upload}>
                  Lưu
                </Button>
              </Space>
            </Row>
          }
        >
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            data={async (file) => {
              setLoading(true)
              const url = await uploadFile(file)
              if (url) setImage(url || '')
              setLoading(false)
            }}
          >
            {image ? <img src={image} alt="" style={{ width: '100%' }} /> : <PlusOutlined />}
          </Upload>
        </Modal>
      </>
    )
  }

  const EditSku = () => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)
    const [valueSku, setValueSku] = useState('')

    const edit = () => {
      if (valueSku) {
        let variantsNew = [...variants]

        selectRowKeyVariant.map((key) => {
          const indexVariant = variantsNew.findIndex((ob) => ob.title === key)
          variantsNew[indexVariant].sku = valueSku
        })

        setVariants([...variantsNew])
      }

      toggle()
    }

    //reset
    useEffect(() => {
      if (!visible) setValueSku('')
    }, [visible])

    return (
      <>
        <Button size="large" onClick={toggle} icon={<EditOutlined />}>
          Chỉnh sửa sku
        </Button>
        <Modal visible={visible} onCancel={toggle} onOk={edit} title="Nhập sku">
          <Input
            placeholder="Nhập sku"
            size="large"
            value={valueSku}
            onChange={(e) => setValueSku(e.target.value)}
            style={{ width: '100%' }}
          />
        </Modal>
      </>
    )
  }

  const EditPrice = () => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)

    const [valueSalePrice, setValueSalePrice] = useState('')

    const edit = () => {
      let variantsNew = [...variants]

      selectRowKeyVariant.map((key) => {
        const indexVariant = variantsNew.findIndex((ob) => ob.title === key)

        variantsNew[indexVariant].price = valueSalePrice
      })

      setVariants([...variantsNew])

      toggle()
    }

    //reset
    useEffect(() => {
      if (!visible) {
        setValueSalePrice('')
      }
    }, [visible])

    return (
      <>
        <Button size="large" onClick={toggle} icon={<DollarOutlined />}>
          Chỉnh sửa giá
        </Button>
        <Modal visible={visible} onCancel={toggle} onOk={edit} title="Nhập giá">
          <Space size="middle" direction="vertical">
            <div>
              <span style={{ marginBottom: 0 }}>Giá bán</span>
              <InputNumber
                placeholder="Nhập giá bán"
                className="br-15__input"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                size="large"
                min={0}
                onChange={(value) => setValueSalePrice(value)}
                style={{ width: '100%' }}
              />
            </div>
          </Space>
        </Modal>
      </>
    )
  }

  const BulkPricesOfVariant = ({ variant }) => {
    const indexVariant = variants.findIndex((e) => e.title === variant.title)
    return (
      <Space direction="vertical">
        {variant.bulk_prices &&
          variant.bulk_prices.map((bulkPrice, indexBulkPrice) => {
            const InputMin = () => (
              <InputNumber
                onMouseOut={(e) => {
                  const value = e.target.value.replaceAll(',', '')
                  if (indexVariant !== -1)
                    _editBulkPriceOfVariant(
                      +value,
                      'min_quantity_apply',
                      indexVariant,
                      indexBulkPrice
                    )
                }}
                style={{ width: '100%' }}
                defaultValue={bulkPrice.min_quantity_apply}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                placeholder="Nhập số lượng tối thiểu áp dụng"
              />
            )
            const InputMax = () => (
              <InputNumber
                onMouseOut={(e) => {
                  const value = e.target.value.replaceAll(',', '')
                  if (indexVariant !== -1)
                    _editBulkPriceOfVariant(
                      +value,
                      'max_quantity_apply',
                      indexVariant,
                      indexBulkPrice
                    )
                }}
                style={{ width: '100%' }}
                defaultValue={bulkPrice.max_quantity_apply}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập số lượng tối đa áp dụng"
              />
            )
            const InputPrice = () => (
              <InputNumber
                onMouseOut={(e) => {
                  const value = e.target.value.replaceAll(',', '')
                  if (indexVariant !== -1)
                    _editBulkPriceOfVariant(+value, 'price', indexVariant, indexBulkPrice)
                }}
                style={{ width: '100%' }}
                defaultValue={bulkPrice.price}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá sỉ áp dụng"
              />
            )

            return (
              <Space size="middle">
                <div>
                  <div>Số lượng tối thiểu</div>
                  <InputMin />
                </div>
                <div>
                  <div>Số lượng tối đa</div>
                  <InputMax />
                </div>
                <div>
                  <div>Giá sỉ áp dụng</div>
                  <InputPrice />
                </div>
                <div>
                  <DeleteOutlined
                    onClick={() => _deleteBulkPriceOfVariant(indexVariant, indexBulkPrice)}
                    style={{ color: 'red', fontSize: 17, cursor: 'pointer', marginTop: 26 }}
                  />
                </div>
              </Space>
            )
          })}
      </Space>
    )
  }

  const columnsVariant = [
    {
      width: 90,
      title: 'Hình ảnh',
      render: (text, record) => <UploadImageProduct variant={record} />,
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'title',
    },
    {
      title: 'SKU',
      render: (text, record) => <InputSku value={record.sku} variant={record} />,
    },
    {
      title: 'Giá bán',
      render: (text, record) => <InputSalePrice value={record.price} variant={record} />,
    },
    {
      title: 'Giá bán sỉ',
      render: (text, record) => {
        return (
          <Space direction="vertical">
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  const indexVariant = variants.findIndex((e) => e.title === record.title)
                  if (indexVariant !== -1) _addBulkPriceOfVariant(indexVariant)
                }}
              >
                Thêm bán giá sỉ
              </Button>
            </Space>
            <BulkPricesOfVariant variant={record} />
          </Space>
        )
      },
    },
  ]

  const _getWarranties = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getWarranties({ branch_id: branchIdApp })
      if (res.status === 200) {
        setWarranties(res.data.data)
      }

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const initProductWithEditProduct = async () => {
    setKeyTab('2')
    if (location.state) {
      const product = location.state
      console.log(product)
      delete product.sumBasePrice
      delete product.sumImportPrice
      delete product.sumQuantity
      delete product.sumSalePrice

      form.setFieldsValue({ ...product })

      setImagesPreviewProduct(product.variants[0].image || [])
      form.setFieldsValue({
        ...product.variants[0],
        enable_bulk_price: product.variants[0].enable_bulk_price || false,
      })
      setSkuProductWithEdit(product.variants[0].sku)
      setBulkPrices(product.variants[0].bulk_prices || [])
      setAttributes([
        ...product.attributes.map((e) => {
          return { option: e.option, values: e.values }
        }),
      ])
      setVariants([...product.variants])

      setImagesProduct(product.images || [])

      setDescription(product.description || 0)
      setIsGeneratedSku(true)
      setValueGeneratedSku(product.sku)
      setFiles(product.files)

      //check bao hanh
      if (product.warranties.length) {
        setIdsWarranty([...product.warranties.map((e) => e !== null && e.warranty_id)])
      }
    } else {
      form.setFieldsValue({ unit: 'Cái' })
    }

    await delay(100)
    setIsRenderFirst(true)
    setKeyTab('3')
    await delay(100)
    setKeyTab('1')
  }

  useEffect(() => {
    _getWarranties()
  }, [branchIdApp])

  useEffect(() => {
    _getSuppliers()
    _getCategories()
  }, [])
  // cập nhật giá trị tạo mã sản phẩm/sku tự động
  useEffect(() => {
    form.setFieldsValue({ sku: valueGeneratedSku })
  }, [valueGeneratedSku])

  //get width device
  useEffect(() => {
    if (window.innerWidth < 768) setIsMobile(true)
    else setIsMobile(false)
  }, [])

  useEffect(() => {
    if (isRenderFirst) addValueVariant()
  }, [attributes])

  //update product
  useEffect(() => {
    initProductWithEditProduct()
  }, [])

  return !isMobile ? (
    <div className="card">
      <TitlePage
        isAffix={true}
        title={
          <Row
            wrap={false}
            align="middle"
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(ROUTES.PRODUCT)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            <div>{location.state ? 'Cập nhật sản phẩm' : 'Thêm mới sản phẩm'}</div>
          </Row>
        }
      >
        <Space>
          <Button
            icon={<ReloadOutlined />}
            style={{ display: !location.state && 'none' }}
            size="large"
            onClick={() => history.go(0)}
          >
            Tải lại
          </Button>
          <Button icon={<EditOutlined />} size="large" type="primary" onClick={addOrUpdateProduct}>
            {location.state ? 'Cập nhật' : 'Thêm'}
          </Button>
        </Space>
      </TitlePage>

      <Form form={form} layout="vertical" style={{ width: '100%', marginTop: 15 }}>
        <Tabs activeKey={keyTab} type="card" onChange={setKeyTab}>
          <Tabs.TabPane tab="Thông tin sản phẩm" key="1">
            <Row gutter={[25, 25]} align="middle">
              <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Form.Item
                  label="Tên sản phẩm"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập tên sản phẩm"
                    onBlur={(e) => {
                      const generatedItemsSku = e.target.value.split(' ')
                      const valueSku = generatedItemsSku
                        .map((items) => (items[0] ? removeAccents(items[0]).toUpperCase() : ''))
                        .join('')

                      if (isGeneratedSku) form.setFieldsValue({ sku: valueSku })

                      setValueGeneratedSku(valueSku)
                    }}
                  />
                </Form.Item>
                {/* <div style={{ position: 'absolute', bottom: -17 }}>
                  <Checkbox
                    checked={isGeneratedSku}
                    onChange={(e) => {
                      if (e.target.checked) form.setFieldsValue({ sku: valueGeneratedSku })

                      setIsGeneratedSku(e.target.checked)
                    }}
                  >
                    Tự động tạo mã sản phẩm/sku
                  </Checkbox>
                </div> */}
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Row wrap={false} align="middle">
                  <Form.Item
                    rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                    label="Nhà cung cấp"
                    name="supplier_id"
                    style={{ marginRight: 10, width: '100%' }}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      size="large"
                      style={{ width: '100%' }}
                      placeholder="Chọn nhà cung cấp"
                      onChange={(value) => {
                        const supplier = suppliers.find((s) => s.supplier_id === value)
                        supplier && setSupplier(supplier.name)
                      }}
                    >
                      {suppliers.map((values, index) => {
                        return (
                          <Select.Option value={values.supplier_id} key={index}>
                            {values.name}
                          </Select.Option>
                        )
                      })}
                    </Select>
                  </Form.Item>
                  <SupplierForm reloadData={_getSuppliers}>
                    <Permission permissions={[PERMISSIONS.them_nha_cung_cap]}>
                      <Tooltip title="Tạo nhà cung cấp">
                        <Button size="large" type="primary" icon={<PlusOutlined />} />
                      </Tooltip>
                    </Permission>
                  </SupplierForm>
                </Row>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Row wrap={false} align="middle">
                  <Form.Item
                    rules={[{ required: true, message: 'Vui lòng chọn nhóm sản phẩm' }]}
                    label="Nhóm sản phẩm"
                    name="category_id"
                    style={{ marginRight: 10, width: '100%' }}
                  >
                    <TreeSelect
                      showCheckedStrategy={TreeSelect.SHOW_ALL}
                      size="large"
                      style={{ width: '100%' }}
                      treeNodeFilterProp="title"
                      maxTagCount="responsive"
                      placeholder="Chọn nhóm sản phẩm"
                      allowClear
                      multiple
                      treeDefaultExpandAll
                    >
                      {categories.map((category) => (
                        <TreeSelect.TreeNode value={category.category_id} title={category.name}>
                          {category.children_category.map((child) => (
                            <TreeSelect.TreeNode value={child.category_id} title={child.name}>
                              {child.children_category.map((e) => (
                                <TreeSelect.TreeNode value={e.category_id} title={e.name}>
                                  {e.name}
                                </TreeSelect.TreeNode>
                              ))}
                            </TreeSelect.TreeNode>
                          ))}
                        </TreeSelect.TreeNode>
                      ))}
                    </TreeSelect>
                  </Form.Item>
                  <Tooltip title="Tạo nhóm sản phẩm">
                    <Button
                      size="large"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={toggleDrawerListProduct}
                    />
                  </Tooltip>
                </Row>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Form.Item
                  label="Mã sản phẩm/SKU"
                  name="sku"
                  rules={[{ message: 'Vui lòng nhập mã sản phẩm/SKU', required: true }]}
                >
                  <Input size="large" placeholder="Nhập mã sản phẩm/sku" />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={24}
                xl={24}
                style={{ marginTop: 2, marginBottom: 15 }}
              >
                <div>Mô tả sản phẩm</div>
                <CKEditor
                  initData={location.state && parse(location.state.description)}
                  onChange={(e) => setDescription(e.editor.getData())}
                />
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Hình ảnh" key="2">
            <h3 style={{ marginBottom: 20 }}>Danh sách hình ảnh sản phẩm</h3>
            <Row wrap={false}>
              {imagesProduct.map((image) => (
                <div style={{ marginRight: 30 }}>
                  <Badge
                    count={
                      <CloseCircleFilled
                        onClick={() => {
                          const indexImage = imagesProduct.findIndex((img) => img === image)
                          if (indexImage !== -1) {
                            const imagesNew = [...imagesProduct]
                            imagesNew.splice(indexImage, 1)
                            setImagesProduct([...imagesNew])
                          }
                        }}
                        style={{ fontSize: 22, color: '#ff4d4f', cursor: 'pointer' }}
                      />
                    }
                  >
                    <img
                      src={image}
                      alt=""
                      style={{ width: 130, height: 130, objectFit: 'cover' }}
                    />
                  </Badge>
                </div>
              ))}

              <Upload
                multiple
                listType="picture-card"
                showUploadList={false}
                className={styles['product-upload-image']}
                onChange={(file) => {
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current)
                  }
                  typingTimeoutRef.current = setTimeout(async () => {
                    setLoadingUpload(true)
                    const urls = await uploadFiles(file.fileList.map((e) => e.originFileObj))
                    setLoadingUpload(false)
                    if (urls) {
                      const imagesNew = [...imagesProduct, ...urls]
                      setImagesProduct([...imagesNew])
                    }
                  }, 450)
                }}
              >
                <div>
                  {loadingUpload ? (
                    <LoadingOutlined />
                  ) : (
                    <PlusCircleFilled style={{ color: 'rgba(128, 128, 128, 0.3)', fontSize: 20 }} />
                  )}
                  <div style={{ marginTop: 8, color: '#808080' }}>Tải lên</div>
                </div>
              </Upload>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Thuộc tính" key="3">
            <Row justify="space-between">
              <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                <Form.Item label="Giá bán lẻ" name="price">
                  <InputNumber
                    size="large"
                    min={0}
                    placeholder="Nhập giá bán"
                    style={{ width: '75%' }}
                    className="br-15__input"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
                <a>
                  {dataUser &&
                    dataUser.data &&
                    dataUser.data.price_recipe &&
                    `* Giá vốn được tính theo công thức ${dataUser.data.price_recipe}`}
                </a>
              </Col>

              <Col xs={24} sm={24} md={14} lg={14} xl={14}>
                <div>
                  <Row wrap={false}>
                    <Button onClick={_addBulkPrice} type="primary" icon={<PlusOutlined />}>
                      Thêm giá bán
                    </Button>
                  </Row>
                  <div style={{ marginTop: 15, marginBottom: 25 }}>
                    <Space direction="vertical" size="middle">
                      {bulkPrices.map((bulkPrice, index) => {
                        const InputMin = () => (
                          <InputNumber
                            onBlur={(e) => {
                              const value = e.target.value.replaceAll(',', '')
                              _editBulkPrice('min_quantity_apply', +value, index)
                            }}
                            style={{ width: '100%' }}
                            defaultValue={bulkPrice.min_quantity_apply}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            min={bulkPrices.length > 1 ? bulkPrice.min_quantity_apply : 1}
                            placeholder="Nhập số lượng tối thiểu áp dụng"
                          />
                        )
                        const InputMax = () => (
                          <InputNumber
                            onBlur={(e) => {
                              const value = e.target.value.replaceAll(',', '')
                              _editBulkPrice('max_quantity_apply', +value, index)
                            }}
                            style={{ width: '100%' }}
                            min={1}
                            max={999}
                            defaultValue={bulkPrice.max_quantity_apply}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập số lượng tối đa áp dụng"
                          />
                        )
                        const InputPrice = () => (
                          <InputNumber
                            onBlur={(e) => {
                              const value = e.target.value.replaceAll(',', '')
                              _editBulkPrice('price', +value, index)
                            }}
                            style={{ width: '100%' }}
                            defaultValue={bulkPrice.price}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập giá sỉ áp dụng"
                          />
                        )

                        return (
                          <Space size="middle">
                            <div>
                              <div>Số lượng tối thiểu áp dụng</div>
                              <InputMin />
                            </div>
                            <div>
                              <div>Số lượng tối đa áp dụng</div>
                              <InputMax />
                            </div>
                            <div>
                              <div>Giá sỉ áp dụng</div>
                              <InputPrice />
                            </div>
                            <div>
                              <DeleteOutlined
                                onClick={() => _deleteBulkPrice(index)}
                                style={{
                                  color: 'red',
                                  fontSize: 17,
                                  cursor: 'pointer',
                                  marginTop: 26,
                                }}
                              />
                            </div>
                          </Space>
                        )
                      })}
                    </Space>
                  </div>
                </div>
              </Col>

              <div style={{ width: '100%', marginTop: 35 }}>
                <div
                  style={{
                    marginBottom: 16,
                    border: '1px solid #f0f0f0',
                    padding: 16,
                    width: '100%',
                  }}
                >
                  {attributes.map((e, index) => {
                    const RenderInput = () => (
                      <Input
                        disabled={location.state ? true : false}
                        size="large"
                        placeholder="Nhập tên thuộc tính"
                        defaultValue={e.option}
                        onBlur={(event) => {
                          const optionName = event.target.value
                          const option = attributes.find(
                            (attr) => attr.option === optionName && optionName
                          )
                          if (option) {
                            notification.warning({ message: 'Bạn đã thêm thuộc tính này rồi' })
                            attributes[index].option = ''
                            return
                          }
                          attributes[index].option = optionName
                        }}
                        style={{ width: '100%' }}
                      />
                    )
                    return (
                      <Row
                        style={{ width: '100%', marginBottom: 15 }}
                        justify="space-between"
                        align="middle"
                      >
                        <Col xs={24} sm={24} md={9} lg={9} xl={9}>
                          <span style={{ marginBottom: 0 }}>Tên thuộc tính</span>
                          <RenderInput />
                        </Col>
                        <Col xs={24} sm={24} md={9} lg={9} xl={9}>
                          <span style={{ marginBottom: 0 }}>Giá trị</span>
                          <Select
                            disabled={location.state ? true : false}
                            mode="tags"
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="Nhập giá trị"
                            value={e.values.map((v) => v)}
                            onDeselect={(v) => {
                              //remove tag
                              let items = [...attributes]
                              const indexRemove = e.values.findIndex((f) => f === v)
                              if (indexRemove !== -1) {
                                items[index].values.splice(indexRemove, 1)
                                setAttributes([...items])
                              }
                            }}
                            onSelect={(e) => {
                              //add tag
                              let items = [...attributes]

                              // //check value add này đã tồn tại chưa
                              // for (let i = 0; i < items.length; ++i) {
                              //   for (let j = 0; j < items[i].values.length; ++j) {
                              //     if (items[i].values[j] === e) {
                              //       notification.error({ message: 'Giá trị đã có!' })
                              //       return
                              //     }
                              //   }
                              // }

                              //trường hợp nhập nhiều variant bởi dấu phẩy
                              //ví dụ: color, size, quantity
                              const splitValue = e.split(',')

                              splitValue.map((v) => {
                                if (v) items[index].values.push(v.trim())
                              })
                              setAttributes([...items])
                            }}
                            optionLabelProp="label"
                          ></Select>
                        </Col>
                        <Popconfirm
                          title="Bạn có muốn xoá thuộc tính này?"
                          onConfirm={() => removeAttribute(index)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <CloseOutlined
                            style={{
                              cursor: 'pointer',
                              color: 'red',
                              fontSize: 18,
                              marginTop: 22,
                              marginLeft: 5,
                              display: attributes.length === 1 && 'none',
                              visibility: location.state && 'hidden',
                            }}
                          />
                        </Popconfirm>
                        <Col xs={24} sm={24} md={5} lg={5} xl={5}>
                          <Tooltip title="Tối đa tạo 2 thuộc tính">
                            <Button
                              size="large"
                              style={{
                                marginTop: 17,
                                display: attributes.length === 2 && 'none',
                              }}
                              onClick={addAttribute}
                              disabled={location.state ? true : false}
                            >
                              Thêm thuộc tính khác
                            </Button>
                          </Tooltip>
                        </Col>
                      </Row>
                    )
                  })}
                </div>

                <div style={{ marginBottom: 16, border: '1px solid #f0f0f0', width: '100%' }}>
                  <div style={{ borderBottom: '1px solid #f0f0f0', width: '100%' }}>
                    <div style={{ width: '100%', padding: 16 }}>
                      <h3 style={{ marginBottom: 0, fontWeight: 700 }}>Thuộc tính</h3>
                    </div>
                  </div>
                  <div
                    style={{
                      marginLeft: 10,
                      marginTop: 10,
                      marginBottom: 20,
                      display: !selectRowKeyVariant.length && 'none',
                    }}
                  >
                    <Space wrap>
                      <UploadAllVariant />
                      {!location.state && <EditSku />}
                      <EditPrice />
                    </Space>
                  </div>
                  <Table
                    rowKey="title"
                    columns={columnsVariant}
                    dataSource={variants}
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: selectRowKeyVariant,
                      onChange: (selectedRowKeys, selectedRows) => {
                        setSelectRowKeyVariant(selectedRowKeys)
                      },
                    }}
                    size="small"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Thông tin cơ bản" key="4">
            <Row justify="space-between" align="middle">
              <Row
                justify="space-between"
                align="middle"
                style={{ width: '100%', marginBottom: 15 }}
              >
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item label="Chiều dài" name="length">
                    <InputNumber
                      style={{ width: '100%' }}
                      className="br-15__input"
                      size="large"
                      placeholder="Chiều dài (cm)"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item label="Chiều rộng" name="width">
                    <InputNumber
                      style={{ width: '100%' }}
                      className="br-15__input"
                      size="large"
                      placeholder="Chiều rộng (cm)"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item label="Chiều cao" name="height">
                    <InputNumber
                      style={{ width: '100%' }}
                      className="br-15__input"
                      size="large"
                      placeholder="Chiều cao (cm)"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item label="Cân nặng" name="weight">
                    <InputNumber
                      style={{ width: '100%' }}
                      className="br-15__input"
                      size="large"
                      placeholder="Cân nặng (kg)"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item label="Đơn vị" name="unit">
                    <Input size="large" placeholder="Đơn vị" />
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ width: '100%', marginTop: 20 }}>
                <Col xs={24} sm={24} md={9} lg={9} xl={9}>
                  <div>Thêm chính sách bảo hành (không bắt buộc)</div>
                  <Row wrap={false}>
                    <Select
                      size="large"
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Chọn chính sách bảo hành"
                      onChange={(value) => setIdsWarranty(value)}
                      value={idsWarranty}
                    >
                      <Select.Option value={''}>Không áp dụng chính sách bảo hành</Select.Option>
                      {warranties.map((values, index) => (
                        <Select.Option value={values.warranty_id} key={index}>
                          {values.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <ModalAddGuarantee />
                  </Row>
                </Col>
              </Row>
            </Row>
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab="File đính kèm" key="5">
            <div style={{ minHeight: 250 }}>
              <Upload
                fileList={files.map((file, index) => {
                  const fileSplit = file.split('/')
                  const nameFile = fileSplit[fileSplit.length - 1]
                  return {
                    uid: index,
                    name: nameFile ? nameFile : 'file',
                    status: 'done',
                    url: file,
                  }
                })}
                onRemove={(file) => {
                  const indexRemove = files.findIndex((url) => url === file)
                  if (indexRemove) {
                    const filesNew = [...files]
                    filesNew.splice(indexRemove, 1)
                    setFiles([...filesNew])
                  }
                }}
                data={async (file) => {
                  setLoadingFile(true)
                  const url = await uploadFile(file)
                  setLoadingFile(false)
                  const filesNew = [...files]
                  filesNew.push(url)
                  setFiles([...filesNew])
                }}
                onChange={(info) => {
                  if (info.file.status !== 'done') info.file.status = 'done'
                }}
              >
                <Button
                  loading={loadingFile}
                  style={{ width: 140 }}
                  size="large"
                  icon={<UploadOutlined />}
                >
                  Chọn file
                </Button>
              </Upload>
            </div>
          </Tabs.TabPane> */}
        </Tabs>
      </Form>
      <Drawer
        width="70%"
        title="Tạo nhóm sản phẩm"
        placement="right"
        onClose={toggleDrawerListProduct}
        visible={visibleListProduct}
      >
        <CreateCategory
          title="product-form"
          toggle={toggleDrawerListProduct}
          reload={_getCategories}
        />
      </Drawer>
    </div>
  ) : (
    <NotSupportMobile />
  )
}
