import React, { useEffect, useRef, useState } from 'react'

// style
import styles from './brand.module.scss'

// moment

// antd

import { Button, Input, message, Form, Steps, Col } from 'antd'

// api

// html react parser

export default function Brand() {
  const [current, setCurrent] = React.useState(0)
  const { Step } = Steps

  const next = () => {
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const Step1Form = () => {
    return (
      <div style={{marginTop: '40px'}}>
        <p>
          Để tạo cửa hàng thành công vui lòng thực hiện thành công 2 bước:
          <div>
            <p>1. Thông tin cửa hàng</p>
            <p>2. Xác thực thông tin</p>
          </div>
        </p>
      </div>
    )
  }

  const Step2Form = () => {
    return (
      <div className={styles['step2']}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        
      </div>
    )
  }
  const Step3Form = () => {
    return (
      <>
          <div className={styles['step2']}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="field2"
            //  label="Field2"
          >
            <Input
              type="number"
              allowClear
              style={{ width: '60%' }}
              size="large"
              placeholder="Tên cửa hàng"
            />
          </Form.Item>
        </Col>
        </div>
      </>
    )
  }

  const steps = [
    {
      title: 'Hướng dẫn đăng ký cửa hàng',
      content: <Step1Form />,
    },
    {
      title: 'Thông tin cửa hàng',
      content: <Step2Form />,
    },
    {
      title: 'Xác thực thông tin',
      content: <Step3Form />,
    },
  ]

  return (
    <div className={styles['body_brand']}>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <div className={styles['button']}>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Tiếp theo
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Xong
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Quay lạy
          </Button>
        )}
      </div>
    </div>
  )
}
