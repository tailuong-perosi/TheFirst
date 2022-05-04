import React, { useState } from 'react'
import styles from './contact.module.scss'

// antd
import { Menu, Button, Modal } from 'antd'
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  HomeOutlined,
  SettingOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useHistory } from 'react-router'

export default function Contact() {
  const history = useHistory()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  return (
    <div className={styles['body_contact']}>
      <Modal
        title="Cài đặt tin nhắn nhanh"
        visible={isModalVisible}
        onOk={toggleModal}
        onCancel={toggleModal}
        footer={[
          <div style={{ textAlign: 'center' }}>
            <Button type="primary">Lưu</Button>
          </div>,
        ]}
      ></Modal>
      <div className={styles['body_contact_content']}>
        <div className={styles['body_contact_content_menu']}>
          <div className={styles['body_contact_content_menu_header']}>
            <Button
              shape="round"
              onClick={() => history.goBack()}
              type="primary"
              icon={<HomeOutlined />}
              style={{ marginRight: 15, padding: '0px 40px' }}
            >
              Trang chủ
            </Button>
            <Button
              onClick={toggleModal}
              shape="circle"
              type="danger"
              style={{ backgroundColor: '#FF821E', border: 'none' }}
              icon={<SettingOutlined />}
            />
          </div>
          <hr style={{ width: '100%', backgroundColor: 'black', margin: '10px 0' }} />
          <Menu defaultSelectedKeys={['1']} mode="inline" theme="light" style={{ width: 320 }}>
            <Menu.Item key="1" style={{ padding: '20px 10px' }}>
              <div className={styles['body_contact_content_menu_item']}>
                <h4 className={styles['body_contact_content_menu_avatar']}>Avatar</h4>
                <div className={styles['body_contact_content_menu_info']}>
                  <h4 style={{ height: '15px' }}>Nguyễn Văn A <span style={{fontSize:12,marginLeft:25,color:"#6CAFFE"}}>5 phút trước</span></h4>
                  <h5>Bạn : Vâng mình cảm ơn bạn</h5>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item key="2" style={{ padding: '20px 0px' }}>
              <div className={styles['body_contact_content_menu_item']}>
                <h4 className={styles['body_contact_content_menu_avatar']}>Avatar</h4>
                <div className={styles['body_contact_content_menu_info']}>
                  <h4 style={{ height: '15px' }}>Nguyễn Văn A <span style={{fontSize:12,marginLeft:25,color:"#6CAFFE"}}>5 phút trước</span></h4>
                  <h5>Bạn : Vâng mình cảm ơn bạn</h5>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item key="3" style={{ padding: '20px 10px' }} icon={''}>
              <div className={styles['body_contact_content_menu_item']}>
                <h4 className={styles['body_contact_content_menu_avatar']}>Avatar</h4>
                <div className={styles['body_contact_content_menu_info']}>
                  <h4 style={{ height: '15px' }}>Nguyễn Văn A <span style={{fontSize:12,marginLeft:25,color:"#6CAFFE"}}>5 phút trước</span></h4>
                  <h5>Bạn : Vâng mình cảm ơn bạn</h5>
                </div>
              </div>
            </Menu.Item>
          </Menu>
        </div>
        <div className={styles['body_contact_content_chatbox']}>
         <div className={styles['body_contact_content_chatbox_header']}>
           <div className={styles['body_contact_content_chatbox_header_left']}>
           <span className={styles['body_contact_content_chatbox_header_avatar']}>Avatar</span>
           <div style={{marginLeft:15}}>
             <h5>Nguyễn Văn A</h5>
             <p style={{fontSize:12,color:"#6CAFFE"}}>Truy cập 2 phút trước</p>
           </div>
           </div>
           <div className={styles['body_contact_content_chatbox_header_right']}>
             <Button type="primary">Đóng phiên trò chuyện</Button>
           </div>
         </div>
        </div>
      </div>
    </div>
  )
}
