import moment from 'moment'
import {
  Select,
  Row,
  Col,
  notification,
  Button,
  Input,
  Form,
  InputNumber,
  Checkbox,
  Radio,
  Space,
  Upload,
  message,
  DatePicker,
} from 'antd'
import { PlusOutlined, LoadingOutlined, InboxOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import styles from './add.module.scss'

// Apis
import { addPromotion, updatePromotion, getPromotions } from 'apis/promotion'
import { getAllStore } from 'apis/store'
import { getAllBranch } from 'apis/branch'
import { removeAccents } from 'utils'
import { uploadFile } from 'apis/upload'

//components
import exportToCSV from 'components/ExportCSV/export'

//language
import { useTranslation } from 'react-i18next'
const { Option } = Select
const { Dragger } = Upload

export default function PromotionAdd(props) {
  console.log(props.state)
  const [storeList, setStoreList] = useState([])
  const [showVoucher, setShowVoucher] = useState('show')
  const [isChooseAllStore, setIsChooseAllStore] = useState(false)
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [checkedCustom, setCheckedCustom] = useState(false)
  const [checkedVoucher, setCheckedVoucher] = useState(false)
  const [selectAppCustomer, setSelectAppCustomer] = useState()
  const openNotification = () => {
    notification.success({
      message: 'Thêm khuyến mãi thành công',
    })
  }

  const _getPromotionsToExport = async () => {
    try {
      const res = await getPromotions()
      if (res.status === 200) {
        let dataExport = []
        res.data.data.map((e) => {
          dataExport.push({
            'Mã khuyến mãi': e.promotion_code || '',
            'Tên khuyến mãi': e.name || '',
            'Điều kiện áp dụng': e.order_value_require || '',
            'Loại khuyến mãi': e.type === 'VALUE' ? 'Giá trị' : 'Phần trăm',
            'Giá trị khuyến mãi': e.value,
            'Số lượng khuyến mãi': e.limit_quantity === 0 ? 'Không giới hạn số lượng' : e.limit_quantity,
            'Thời hạn khuyến mãi': e.end_date,
          })
        })
        exportToCSV(dataExport, 'Danh sách khuyến mãi')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onFinish = async (values) => {
    try {
      const obj = {
        name: values.name,
        promotion_code: values.promotion_code,
        type: values.type,
        value: values.value,
        has_voucher: showVoucher === 'show',
        limit: {
          amount: values.amount ? parseInt(values.amount) : 0,
          stores: values.store ? values.store : [],
        },
        order_value_require: values.discount_condition || '',
        max_discount_value: values.max_discount || '',
        description: values.description || '',
        start_date: moment(values.start_date).format('YYYY-MM-DD'),
        end_date: moment(values.end_date).format('YYYY-MM-DD'),
      }
      console.log(obj)
      let res
      if (props.state.length === 0) res = await addPromotion(obj)
      else res = await updatePromotion(props.state.promotion_id, obj)

      if (res.status === 200) {
        openNotification()
        props.reload()
        props.close()
        form.resetFields()
        setIsChooseAllStore(false)
        if (checkedVoucher === true) {
          _getPromotionsToExport()
        }
      } else throw res
    } catch (e) {
      console.log(e)
      notification.warning({
        message: 'Thêm khuyến mãi thất bại',
      })
    }
  }

  const generateCode = (value) => {
    let tmp = value.toUpperCase()
    tmp = tmp.replace(/\s/g, '')
    tmp = removeAccents(tmp)
    return tmp
  }

  const selectAllStore = (value) => {
    setIsChooseAllStore(value)
    value
      ? form.setFieldsValue({
        store: storeList.map((e) => {
          return e.branch_id
        }),
      })
      : form.setFieldsValue({ store: [] })
  }
  const _uploadImage = async (file) => {
    try {
      setLoading(true)
      const url = await uploadFile(file)
      setImage(url || '')
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getBranch = async (params) => {
      try {
        const res = await getAllBranch(params)
        if (res.status === 200) {
          setStoreList(res.data.data)
        } else {
          throw res
        }
      } catch (e) {
        console.log(e)
      }
    }
    getBranch()
  }, [])

  useEffect(() => {
    if (props.state) {
      form.setFieldsValue({ ...props.state })
    } else {
      form.resetFields()
    }
    if (!props.show) {
      form.resetFields()
    }
  }, [form, props.show, props.state])

  return (
    <>
      <Form onFinish={onFinish} form={form} layout="vertical">
        <Row
          gutter={10}
          style={{
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 10px 20px',
          }}
        >
          <div style={{ fontWeight: 'bold', font: '16px', marginBottom: '10px' }}>
            Hình ảnh
          </div>
          <Dragger
            style={{ margin: '0 2px' }}
            {...{
              name: 'file',
              multiple: true,
              action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
              onChange(info) {
                const { status } = info.file
                if (status !== 'uploading') {
                  console.log(info.file, info.fileList)
                }
                if (status === 'done') {
                  message.success(`${info.file.name} file uploaded successfully.`)
                } else if (status === 'error') {
                  message.error(`${info.file.name} file upload failed.`)
                }
              },
              onDrop(e) {
                console.log('Dropped files', e.dataTransfer.files)
              },
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or
              other band files
            </p>
          </Dragger>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <div className={styles['promotion-add__box']}>
              <div className={styles['promotion-add__title']}>
                Tên chương trình khuyến mãi <span style={{ color: 'red' }}>*</span>
              </div>
              <Form.Item name="name">
                <Input
                  placeholder='Nhập tên khuyến mãi'
                  size="large"
                  onChange={(e) => {
                    form.setFieldsValue({
                      promotion_code: generateCode(e.target.value),
                    })
                  }}
                />
              </Form.Item>
              <div className={styles['promotion-add__title']}>
                Mã khuyến mãi <span style={{ color: 'red' }}>*</span>
              </div>
              <Form.Item name="promotion_code">
                <Input placeholder='Nhập mã khuyến mãi' size="large" />
              </Form.Item>
              <div className={styles['promotion-add__title']}>
                Áp dụng cho khách hàng
              </div>
              <Select
                style={{ width: '100%', marginBottom: '30px' }}
                size="large"
                placeholder='Tất cả'
                showSearch
                onChange={(value) => setSelectAppCustomer(value)}
                value={selectAppCustomer || 'customer-0'}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="customer-0">Tẩt cả</Option>
                <Option value="customer-1">Vãng lai</Option>
                <Option value="customer-2">Khách mới</Option>
                <Option value="customer-3">Tiềm năng</Option>
                <Option value="customer-4">Trung thành</Option>
              </Select>
              {/* <Checkbox
                onChange={() => setCheckedCustom(!checkedCustom)}
                checked={checkedCustom}
                style={{
                  marginBottom: '30px',
                  padding: '0',
                  color: checkedCustom ? '#2463EA' : '#000',
                }}
              >
                Thêm voucher tự động cho khách hàng
              </Checkbox> */}
              <Checkbox
                onChange={() => setCheckedVoucher(!checkedVoucher)}
                checked={checkedVoucher}
                style={{
                  margin: '0 0 57px',
                  padding: '0',
                  color: checkedVoucher ? '#2463EA' : '#000',
                }}
              >
                Tải xuống voucher thủ công (file excel)
              </Checkbox>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles['promotion-add__box']}>
              <div className={styles['promotion-add__title']}>
                Tùy chọn khuyến mãi
              </div>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item name="type" initialValue="VALUE" label='Loại khuyến mãi'>
                    <Select placeholder='Chọn loại khuyến mãi' size="large">
                      <Option value="VALUE">Giá trị</Option>
                      <Option value="PERCENT">Phần trăm</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="value" label='Giá trị khuyến mãi'>
                    <InputNumber
                      placeholder='Nhập giá trị khuyến mãi'
                      size="large"
                      min={0}
                      style={{ width: '100%', borderRadius: '15px' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item name="discount_condition" label='Hạn mức áp dụng'>
                    <InputNumber
                      style={{ width: '100%', borderRadius: 15 }}
                      size="large"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="max_discount" label='Khuyến mãi tối đa'>
                    <InputNumber
                      style={{ width: '100%', borderRadius: 15 }}
                      size="large"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className={styles['promotion-add__box']}>
              <div className={styles['promotion-add__title']}>Mô tả</div>
              <Form.Item name="description" style={{ marginBottom: 0 }}>
                <Input.TextArea style={{ height: 100, margin: '15px 0' }} />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: '1px solid #B4B4B4',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '20px',
          }}
        >
          <div style={{ fontSize: '18px', color: '#394150', paddingBottom: '10px' }}>
            Thời gian áp dụng
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '50%', fontSize: '16px', marginLeft: '5px' }}>
              <div> Thời gian bắt đầu</div>
              <Form.Item name="start_date">
                <DatePicker size="large" style={{ width: '100%', marginTop: '10px' }} />
              </Form.Item>
            </div>
            <div style={{ width: '50%', fontSize: '16px', marginLeft: '10px' }}>
              {' '}
              <div> Thời gian kết thúc</div>
              <Form.Item name="end_date">
                <DatePicker size="large" style={{ width: '100%', marginTop: '10px' }} />
              </Form.Item>
            </div>
          </div>
        </Row>
        <div className={styles['promotion_add_button']}>
          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" style={{ width: '100%' }}>
              {props.state.length === 0 ? 'Thêm khuyến mãi' : 'Lưu'}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </>
  )
}
