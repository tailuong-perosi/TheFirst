import React, { useEffect, useRef, useState } from 'react'
import styles from './../brand-create/brand-create.module.scss'
// antd
import { ArrowLeftOutlined, InfoCircleOutlined, InboxOutlined } from '@ant-design/icons'
import {
  Button,
  Input,
  Select,
  Upload,
  notification,
  InputNumber,
  DatePicker,
  Spin,
  Form,
} from 'antd'
import { useLocation, useHistory } from 'react-router-dom'

// ckeditor
import { CKEditor } from 'ckeditor4-react'
// html react parser
import parse from 'html-react-parser'

// api
import { createBrand, updateBrand } from 'apis/brand'
import { uploadFile, uploadFiles } from 'apis/upload'
import { IMAGE_DEFAULT } from 'consts'
import { getCountries } from 'apis/address'

// moment
import moment from 'moment'

const { Dragger } = Upload

export default function BrandCreate() {
  const history = useHistory()
  const location = useLocation()
  const [form] = Form.useForm()
  const [name, setName] = useState('')
  const [loadingSelect, setLoadingSelect] = useState(true)
  const [content, setContent] = useState('')
  const [image, setImage] = useState([])
  const [idBrand, setIdBrand] = useState('')
  const [country, setCountry] = useState('')
  // const [viewCountry, setViewCountry] = useState('Chọn quốc gia')
  const [foundedYear, setFoundedYear] = useState('')
  const [priority, setPriority] = useState('')
  const [countryList, setCountryList] = useState([])
  const typingTimeoutRef = useRef()

  const handleChangeNoiDung = (e) => {
    const value = e.editor.getData()
    setContent(value)
  }

  const handleChangeCountry = (code, name) => {
    // console.log(value)
    setCountry(code)
    // setViewCountry(name)
  }

  const handleChangeYear = (info) => {
    const year = moment(info._d).format('YYYY')
    console.log(year)
    setFoundedYear(year)
    console.log(info)
  }

  const handleChangePrio = (value) => {
    // console.log(value)
    setPriority(value)
  }

  const UploadImageWithEditBrand = () => (
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
          setImage([...listUrl, ...imgUrls])
          // console.log(info.fileList)
        }, 350)
        // console.log(info)
      }}
      fileList={image?.map((item, index) => {
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

  const _actionBrand = async () => {
    try {
      await form.validateFields()
      const formData = form.getFieldsValue()
      const body = {
        name: formData.name,
        content: content,
        images: image,
        country_code: country,
        founded_year: foundedYear,
        priority: priority,
      }
      // console.log(body)
      let res
      if (location.state) {
        res = await updateBrand(idBrand, body)
      } else {
        res = await createBrand(body)
      }
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          history.goBack()
          notification.success({
            message: `${location.state ? 'Cập nhật' : 'Tạo'} thương hiệu thành công`,
          })
        } else {
          notification.success({
            message:
              res.data.message || `${location.state ? 'Cập nhật' : 'Tạo'} thương hiệu thành công`,
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const _getCountries = async () => {
    try {
      setLoadingSelect(true)
      const res = await getCountries()
      // console.log(res)
      setCountryList(res.data.data)
    } catch (err) {
      console.log(err)
    }
  }

  const DatePickerData = () => {
    return (
      <DatePicker
        onChange={handleChangeYear}
        placeholder="Chọn năm thành lập"
        style={{ width: '85%' }}
        picker="year"
        defaultValue={moment(foundedYear ? foundedYear : '2021')}
        allowClear
      />
    )
  }

  useEffect(() => {
    if (location.state) {
      setIdBrand(location.state.brand_id)
      setContent(location.state.content)
      // setName(location.state.name)
      setImage(location.state.images)
      setCountry(location.state.country_code)
      setPriority(location.state.priority)
      setFoundedYear(location.state.founded_year)
      form.setFieldsValue({ name: location.state.name })
      form.setFieldsValue({ country: location.state._country[0]?.name })
      // console.log(location.state.founded_year)
    }
    _getCountries()
  }, [])

  return (
    <div className={styles['body_brand']}>
      <div className={styles['body_brand_header']}>
        <div className={styles['body_brand_header_title']}>
          <ArrowLeftOutlined
            onClick={() => history.goBack()}
            style={{ fontSize: '20px', paddingRight: '10px' }}
          />
          <span className={styles['body_brand_header_list_text']}>
            {location.state ? 'Cập nhật thương hiệu' : 'Tạo thương hiệu'}
          </span>
          <a>
            <InfoCircleOutlined />
          </a>
        </div>
        <Button onClick={_actionBrand} style={{ width: '90px' }} type="primary">
          {location.state ? 'Cập nhật' : 'Tạo'}
        </Button>
      </div>
      <hr />
      <div className={styles['body_brand_content']}>
        <div style={{ marginTop: 20 }}>
          <h3>Hình ảnh</h3>
          {location.state ? (
            <UploadImageWithEditBrand />
          ) : (
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
                  let imageBlog = []
                  info.fileList.map((item) => imageBlog.push(item.originFileObj))
                  // const imgUrl=await uploadFile(info.file.originFileObj)
                  const imgUrl = await uploadFiles(imageBlog)
                  setImage(imgUrl)
                  // console.log(imgUrl)
                }, 350)
                // console.log(info)
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
              <p className="ant-upload-hint">Hỗ trợ định dạng .PNG,.JPG,.TIFF,.EPS</p>
            </Dragger>
          )}
        </div>
        <div style={{ paddingTop: 20 }}>
          <Form className={styles['body_brand_content_header']} form={form}>
            <div>
              <h3>Tên thương hiệu</h3>
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
              >
                <Input
                  // value={name}
                  // onChange={handleChangeName}
                  style={{ width: '85%' }}
                  placeholder="Nhập tên thương hiệu"
                ></Input>
              </Form.Item>
            </div>

            <div>
              <h3>Quốc gia</h3>
              <Form.Item name="country">
                <Select
                  notFoundContent={loadingSelect ? <Spin size="small" /> : ''}
                  showSearch
                  // onChange={handleChangeCountry}
                  style={{ width: '85%' }}
                  placeholder="Chọn quốc gia"
                  allowClear
                >
                  {countryList?.map((data) => (
                    <Select.Option value={data.name} key={data.code}>
                      <p onClick={() => handleChangeCountry(data.code, data.name)}>{data.name}</p>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div>
              <h3>Năm thành lập</h3>
              <DatePickerData />
            </div>
            <div>
              <h3>Độ ưu tiên</h3>
              <InputNumber
                min={1}
                max={1000}
                style={{ width: '85%' }}
                placeholder="Nhập độ ưu tiên"
                onChange={handleChangePrio}
                value={priority}
              ></InputNumber>
            </div>
          </Form>
        </div>
        <h3 style={{ padding: '20px 0' }}>Mô tả</h3>
        <CKEditor
          initData={location.state ? parse(location.state.content) : ''}
          onChange={handleChangeNoiDung}
        />
      </div>
    </div>
  )
}
