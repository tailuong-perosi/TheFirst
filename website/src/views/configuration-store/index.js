import styles from './configuration-store.module.scss'
import React from 'react'
import { Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import { PERMISSIONS, ROUTES } from 'consts'

//components
import Permission from 'components/permission'

//antd
import {
  FileExcelOutlined,
  FormOutlined,
  DollarOutlined,
  TeamOutlined,
  CreditCardOutlined,
  ClusterOutlined,
  PartitionOutlined,
  AlertOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons'

export default function ConfigurationStore() {
  return (
    <div className={styles['configuration']}>
      <Permission permissions={[PERMISSIONS.quan_li_phan_quyen, PERMISSIONS.quan_li_nhan_su]}>
        <div className={`${styles['configuration_content']} ${styles['card']}`}>
          <div
            style={{ marginBottom: 10, color: '#1A3873', fontSize: '1.25rem', fontWeight: '700' }}
          >
            Thông tin về cửa hàng
          </div>

          <Row gutter={[16, 16]}>
            <Permission permissions={[PERMISSIONS.quan_li_phan_quyen]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.ROLE}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCDFEF',
                        border: '1px solid #F060AE',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <TeamOutlined style={{ color: '#F060AE' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', color: '#0015CD' }}>Quản lý phân quyền</div>
                      <div style={{ color: 'black', fontSize: '0.75rem' }}>
                        Tạo và quản lý quyền của tất cả tài khoản
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>

            <Permission permissions={[PERMISSIONS.quan_li_nhan_su]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.EMPLOYEE}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCDFEF',
                        border: '1px solid #F060AE',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <PartitionOutlined style={{ color: '#F060AE' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', color: '#0015CD' }}>Quản lý nhân viên</div>
                      <div style={{ color: 'black', fontSize: '0.75rem' }}>
                        Tạo và quản lý tất cả tài khoản của nhân viên
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
          </Row>
        </div>
      </Permission>

      <Permission
        permissions={[
          PERMISSIONS.quan_li_bao_hanh,
          PERMISSIONS.quan_li_thue,
          PERMISSIONS.quan_li_thanh_toan,
          PERMISSIONS.quan_li_doi_tac_van_chuyen,
          PERMISSIONS.tich_diem,
          PERMISSIONS.khuyen_mai,
        ]}
      >
        <div className={`${styles['configuration_content']} ${styles['card']}`}>
          <div
            style={{ marginBottom: 10, color: '#1A3873', fontSize: '1.25rem', fontWeight: '700' }}
          >
            Thông tin bán hàng
          </div>
          <Row gutter={[16, 16]}>
            <Permission permissions={[PERMISSIONS.quan_li_bao_hanh]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.GUARANTEE}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCF7EB',
                        border: '1px solid #EFC76E',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <DollarOutlined style={{ color: '#EFC76E' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Quản lý bảo hành
                      </div>
                      <div
                        style={{
                          color: 'black',
                          fontSize: '0.75rem',
                        }}
                      >
                        Thiết lập quản lý bảo hành
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
            <Permission permissions={[PERMISSIONS.quan_li_thue]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.TAX}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCF7EB',
                        border: '1px solid #EFC76E',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <DollarOutlined style={{ color: '#EFC76E' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Quản lý thuế
                      </div>
                      <div
                        style={{
                          color: 'black',
                          fontSize: '0.75rem',
                        }}
                      >
                        Thiết lập thuế nhập và bán hàng
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
            <Permission permissions={[PERMISSIONS.quan_li_thanh_toan]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.PAYMENT}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCF7EB',
                        border: '1px solid #EFC76E',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <CreditCardOutlined style={{ color: '#EFC76E' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Quản lý thanh toán
                      </div>
                      <div
                        style={{
                          color: 'black',
                          fontSize: '0.75rem',
                        }}
                      >
                        Thiết lập các hình thức thanh toán
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
            <Permission permissions={[PERMISSIONS.quan_li_doi_tac_van_chuyen]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.SHIPPING}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCF7EB',
                        border: '1px solid #EFC76E',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <ClusterOutlined style={{ color: '#EFC76E' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Quản lý đối tác vận chuyển
                      </div>
                      <div style={{ color: 'black', fontSize: '0.75rem' }}>
                        Thiết lập và quản lý các đối tác vận chuyển
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
            <Permission permissions={[PERMISSIONS.tich_diem]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.POINT}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCF7EB',
                        border: '1px solid #EFC76E',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <AlertOutlined style={{ color: '#EFC76E' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Tích điểm
                      </div>
                      <div style={{ color: 'black', fontSize: '0.75rem' }}>
                        Thiết lập và cấu hình tích điểm
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
            <Permission permissions={[PERMISSIONS.khuyen_mai]}>
              <Col xs={24} sm={24} md={11} lg={8} xl={8}>
                <Link to={ROUTES.PROMOTION}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#FCF7EB',
                        border: '1px solid #EFC76E',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <FieldTimeOutlined style={{ color: '#EFC76E' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Khuyến mãi
                      </div>
                      <div style={{ color: 'black', fontSize: '0.75rem' }}>
                        Thiết lập và cấu hình chương trình khuyến mãi
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
          </Row>
        </div>
      </Permission>

      <Permission permissions={[PERMISSIONS.nhap_xuat_file, PERMISSIONS.nhat_ki_hoat_dong]}>
        <div className={`${styles['configuration_content']} ${styles['card']}`}>
          <div style={{ color: '#1A3873', fontSize: '1.25rem', fontWeight: '700' }}>Nhật ký</div>
          <Row gutter={[16, 16]}>
            <Permission permissions={[PERMISSIONS.nhap_xuat_file]}>
              <Col xs={24} sm={11} md={11} lg={8} xl={8}>
                <Link to={ROUTES.IMPORT_REPORT_FILE}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#D7E9DB',
                        border: '1px solid #388F4D',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <FileExcelOutlined style={{ color: '#388F4D' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', color: '#0015CD' }}>Nhập/xuất file</div>
                      <div style={{ color: 'black', fontSize: '0.75rem' }}>
                        Theo dõi và quản lý nhập xuất file
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
            <Permission permissions={[PERMISSIONS.nhat_ki_hoat_dong]}>
              <Col xs={24} sm={11} md={11} lg={8} xl={8}>
                <Link to={ROUTES.ACTIVITY_DIARY}>
                  <Row wrap={false}>
                    <div
                      className={styles['wrap-icon']}
                      style={{
                        backgroundColor: '#E9D4D5',
                        border: '1px solid #8F292F',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <FormOutlined style={{ color: '#8F292F' }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: '#0015CD',
                        }}
                      >
                        Nhật ký hoạt động
                      </div>
                      <div
                        style={{
                          color: 'black',
                          fontSize: '0.75rem',
                        }}
                      >
                        Quản lý toàn bộ thao tác, nhật ký hoạt động trong cửa hàng
                      </div>
                    </div>
                  </Row>
                </Link>
              </Col>
            </Permission>
          </Row>
        </div>
      </Permission>
    </div>
  )
}
