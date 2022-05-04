import React, { useEffect, useState } from 'react'

//antd
import { Drawer, Row, Button, Space, Spin, Collapse, Input, Tooltip } from 'antd'

//icons
import { FunnelPlotFilled, SearchOutlined } from '@ant-design/icons'

//apis
import { getAttributes } from 'apis/product'

export default function FilterProductsBySku({ setParamsFilter, paramsFilter }) {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(false)
  const [valueSearch, setValueSearch] = useState('')
  const [activeKey, setActiveKey] = useState([])
  const [attributesActive, setAttributesActive] = useState([])

  const _getAttributes = async (params) => {
    try {
      setLoading(true)
      const res = await getAttributes(params)
      if (res.status === 200) {
        setAttributes(res.data.data)
        setActiveKey(res.data.data.map((e, index) => index))
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const fromFormatString = (string) => {
    let object = {}
    let nameField = string.slice(0, string.indexOf(':'))
    string = string.replace(`${nameField}:`, '')
    string = string.replace(/\|\|/g, ',')
    let element = []
    let temp = ''
    for (var i = 0; i < string.length; i++) {
      if (string[i] != ',') {
        temp += string[i]
      } else {
        if (temp != '') {
          element.push(temp)
        }
        temp = ''
      }
    }
    if (temp != '') {
      element.push(temp)
    }

    object[nameField] = element
    return object
  }

  useEffect(() => {
    if (visible)
      setAttributesActive(
        paramsFilter.attribute
          ? paramsFilter.attribute.split('---').map((e) => fromFormatString(e))
          : []
      )
  }, [visible])

  useEffect(() => {
    _getAttributes()
  }, [])

  return (
    <>
      <Tooltip title="Lọc theo thuộc tính">
        <FunnelPlotFilled style={{ cursor: 'pointer' }} onClick={toggle} />
      </Tooltip>
      <Drawer
        width={450}
        visible={visible}
        title="Lọc theo thuộc tính"
        onClose={toggle}
        placement="left"
        footer={
          <Row justify="end">
            <Button
              onClick={() => {
                if (attributesActive.length)
                  paramsFilter.attribute = attributesActive
                    .map((e) => `${Object.keys(e)[0]}:${e[Object.keys(e)[0]].join('||')}`)
                    .join('---')
                else delete paramsFilter.attribute

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
          <a onClick={() => setAttributesActive([])}>Xoá chọn tất cả</a>
        </Row>
        <Input
          allowClear
          value={valueSearch}
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm tên thuộc tính hoặc giá trị thuộc tính"
          onChange={(e) => setValueSearch(e.target.value)}
        />
        <br />

        {loading ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Spin />
          </div>
        ) : (
          <Collapse
            ghost
            activeKey={activeKey}
            expandIconPosition="right"
            onChange={(keys) => setActiveKey([...keys])}
          >
            {attributes.map((attribute, index) => (
              <Collapse.Panel
                header={
                  <span style={{ fontWeight: 700, marginBottom: 0 }}>
                    {valueSearch &&
                      attribute.option.toLowerCase().includes(valueSearch.toLowerCase()) ? (
                      <mark style={{ backgroundColor: 'yellow' }}>{attribute.option}</mark>
                    ) : (
                      attribute.option
                    )}
                  </span>
                }
                key={index}
              >
                <Space wrap={true}>
                  {attribute.values.map((value) => (
                    <Button
                      type={
                        attributesActive.find(
                          (e) =>
                            Object.keys(e)[0] === attribute.option &&
                            e[Object.keys(e)[0]].includes(value)
                        ) && 'primary'
                      }
                      onClick={() => {
                        const attributesActiveNew = [...attributesActive]

                        const findIndex = attributesActiveNew.findIndex(
                          (e) => Object.keys(e)[0] === attribute.option
                        )

                        if (findIndex !== -1) {
                          const findIndexChild = attributesActiveNew[findIndex][
                            Object.keys(attributesActiveNew[findIndex])[0]
                          ].findIndex((l) => l === value)

                          if (findIndexChild !== -1) {
                            attributesActiveNew[findIndex][
                              Object.keys(attributesActiveNew[findIndex])[0]
                            ].splice(findIndexChild, 1)

                            if (
                              attributesActiveNew[findIndex][
                                Object.keys(attributesActiveNew[findIndex])[0]
                              ].length === 0
                            )
                              attributesActiveNew.splice(findIndex, 1)
                          } else
                            attributesActiveNew[findIndex][
                              Object.keys(attributesActiveNew[findIndex])[0]
                            ].push(value)
                        } else {
                          let b = {}
                          b[attribute.option] = [value]
                          attributesActiveNew.push(b)
                        }

                        setAttributesActive([...attributesActiveNew])
                      }}
                    >
                      {valueSearch && value.toLowerCase().includes(valueSearch.toLowerCase()) ? (
                        <mark style={{ backgroundColor: 'yellow' }}>{value}</mark>
                      ) : (
                        value
                      )}
                    </Button>
                  ))}
                </Space>
              </Collapse.Panel>
            ))}
          </Collapse>
        )}
      </Drawer>
    </>
  )
}
