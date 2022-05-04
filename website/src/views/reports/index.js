import React from 'react'
import styles from './reports.module.scss'
import { ROUTES } from 'consts'
import { Link } from 'react-router-dom'

//components
import TitlePage from 'components/title-page'
import Permission from 'components/permission'
import REPORTS from './reports'

//antd
import { Row, Col } from 'antd'

//icons
import {} from '@ant-design/icons'

export default function Reports() {
  return (
    <div className="card">
      <div style={{ minHeight: 'calc(100vh - 106px)' }}>
        <TitlePage title="Báo cáo tổng hợp"></TitlePage>
        <div style={{ marginTop: 30 }}>
          <Row gutter={[25, 25]}>
            {REPORTS.map((report) => (
              <Permission permissions={[]}>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Link to={report.path}>
                    <Row wrap={false} align="middle" className={styles['report-item']}>
                      <div style={{ marginRight: 15 }}>{report.icon}</div>
                      <div>
                        <h3 className={styles[['report-title']]}>{report.title}</h3>
                        <p>{report.subtitle}</p>
                      </div>
                    </Row>
                  </Link>
                </Col>
              </Permission>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}
