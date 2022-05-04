import React from 'react'

import { Switch, Route, Redirect, BrowserRouter } from 'react-router-dom'
import { ROUTES } from 'consts'

//base layout
import BaseLayout from 'components/layout'
import Authentication from 'components/authentication'

//views
import LoginBusiness from './login-business'
import Login from './login'
import Register from './register'
import ProductCheck from './product-check'
import OrderList from './order-list'
import SalesReport from './sales-report'
import ReportInventory from './report-inventory'
import ShippingControl from './shipping-control'
import ShippingControlForm from './shipping-control/shipping-control-form'
import Guarantee from './guarantee'
import GuaranteeForm from './guarantee/guarantee-form'
import ShippingProduct from './shipping-product'
import ClientManagement from './client-management'
import Branch from './branch'
import Reports from './reports'
import ReportVariant from './report-variant'
import ReportImportExportInventoryProduct from './report-import-export-inventory-product'
import ReportImportExportInventoryVariant from './report-import-export-inventory-variant'
import StockAdjustments from './stock-adjustments'
import StockAdjustmentsForm from './stock-adjustments-form'
import ConfigurationStore from './configuration-store'
import OTP from './otp'
import Setting from './setting'
import ReceiptsAndPayment from './receipts-and-payment'
import PaymentType from './receipts-and-payment/payment-type'
import ReceiptsType from './receipts-and-payment/receipts-type'
import PasswordNew from './password-new'
import ForgetPassword from './forget-password'
import Overview from './overview'
import Sell from './sell'
import Store from './store'
import VerifyAccount from './verify-account'
import ActivityDiary from './activity-diary'

import NotFound from './not-found/404'

import ShippingProductForm from './shipping-product/shipping-product-form'
import OrderCreate from './order-create'
import Categories from './categories'
import Category from './category'

import Inventory from './inventory'
import OfferList from './offer-list'
import Product from './product'
import ProductForm from './product/product-form'
import Payment from './payment'
import Tax from './tax'
import Employee from './employee'
import Shipping from './shipping'
import Customer from './customer'
import Supplier from './supplier'
import Promotion from './promotion'
import Role from './role'

import Point from './point'
import OfferListCreate from './offer-list-create'
import Blog from './blog'
import BlogCreate from './blog-create'
import Brand from './brand'
import SettingBill from './setting-bill'
import BrandCreate from './brand-create'
import Channel from './channel'
import Contact from './contact'
import ImportInventories from './import-inventories'
import ImportInventory from './import-inventory'
import ImportReportFile from './import-report-file'
import DeliveryControl from './delivery-control'
import ShippingForm from './shipping/shipping-form'
import ShippingFormGHTK from './shipping/shipping-ghtk'
import ShippingFormGHN from './shipping/shipping-ghn'
const DEFINE_ROUTER = [
  {
    path: ROUTES.PRODUCT_CHECK,
    Component: () => <ProductCheck />,
    title: 'Kiểm hàng cuối ngày',
    permissions: [],
    exact: true,
  },

  {
    path: ROUTES.PRODUCT_ADD,
    Component: () => <ProductForm />,
    title: 'Thêm sản phẩm',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.PRODUCT_UPDATE,
    Component: () => <ProductForm />,
    title: 'Cập nhật sản phẩm',
    permissions: [],
    exact: true,
  },

  {
    path: ROUTES.ORDER_LIST,
    Component: () => <OrderList />,
    title: 'Danh sách đơn hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SALES_REPORT,
    Component: () => <SalesReport />,
    title: 'Báo cáo bán hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.REPORT_INVENTORY,
    Component: () => <ReportInventory />,
    title: 'Báo cáo tồn kho',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.REPORTS,
    Component: () => <Reports />,
    title: 'Báo cáo tổng hợp',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.REPORT_VARIANT,
    Component: () => <ReportVariant />,
    title: 'Báo cáo tồn kho theo thuộc tính',
    permissions: [],
    exact: true,
  },

  {
    path: ROUTES.STOCK_ADJUSTMENTS,
    Component: () => <StockAdjustments />,
    title: 'Kiểm hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.STOCK_ADJUSTMENTS_CREATE,
    Component: () => <StockAdjustmentsForm />,
    title: 'Tạo phiếu kiểm hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.STOCK_ADJUSTMENTS_UPDATE,
    Component: () => <StockAdjustmentsForm />,
    title: 'Cập nhật phiếu kiểm hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.REPORT_IMPORT_EXPORT_INVENTORY_PRODUCT,
    Component: () => <ReportImportExportInventoryProduct />,
    title: 'Báo cáo xuất nhập tồn theo sản phẩm',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.REPORT_IMPORT_EXPORT_INVENTORY_VARIANT,
    Component: () => <ReportImportExportInventoryVariant />,
    title: 'Báo cáo xuất nhập tồn theo thuộc tính',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_CONTROL,
    Component: () => <ShippingControl />,
    title: 'Đối soát vận chuyển',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.DELIVERY_CONTROL,
    Component: () => <DeliveryControl />,
    title: 'Quản lý giao hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_CONTROL_ADD,
    Component: () => <ShippingControlForm />,
    title: 'Tạo phiếu đối soát vận chuyển',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.GUARANTEE,
    Component: () => <Guarantee />,
    title: 'Quản lý bảo hành',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.GUARANTEE_ADD,
    Component: () => <GuaranteeForm />,
    title: 'Thêm bảo hành',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_PRODUCT,
    Component: () => <ShippingProduct />,
    title: 'Quản lý chuyển hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CLIENT_MANAGEMENT,
    Component: () => <ClientManagement />,
    title: 'Quản lý client',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.BRANCH_MANAGEMENT,
    Component: () => <Branch />,
    title: 'Quản lý kho',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CONFIGURATION_STORE,
    Component: () => <ConfigurationStore />,
    title: 'Cấu hình thông tin cửa hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.OVERVIEW,
    Component: () => <Overview />,
    title: 'Tổng quan',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.STORE,
    Component: () => <Store />,
    title: 'Quản lý cửa hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.POINT,
    Component: () => <Point />,
    title: 'Tích điểm',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.ACTIVITY_DIARY,
    Component: () => <ActivityDiary />,
    title: 'Nhật ký hoạt động',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.ORDER_CREATE,
    Component: () => <OrderCreate />,
    title: 'Tạo đơn',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.INVENTORY,
    Component: () => <Inventory />,
    title: 'Quản lý kho',
    permissions: [],
    exact: true,
  },

  {
    path: ROUTES.PRODUCT,
    Component: () => <Product />,
    title: 'Quản lý sản phẩm',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.PAYMENT,
    Component: () => <Payment />,
    title: 'Quản lý hình thức thanh toán',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.TAX,
    Component: () => <Tax />,
    title: 'Quản lý thuế',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.EMPLOYEE,
    Component: () => <Employee />,
    title: 'Quản lý nhân viên',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.IMPORT_REPORT_FILE,
    Component: () => <ImportReportFile />,
    title: 'Nhập xuất File',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING,
    Component: () => <Shipping />,
    title: 'Quản lý đối tác vận chuyển',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_CREATE,
    Component: () => <ShippingForm />,
    title: 'Thêm đối tác vận chuyển',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_CREATE_GHTK,
    Component: () => <ShippingFormGHTK />,
    title: 'Kết nối GHTK',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_CREATE_GHN,
    Component: () => <ShippingFormGHN />,
    title: 'Kết nối GHN',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CUSTOMER,
    Component: () => <Customer />,
    title: 'Quản lý khách hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SUPPLIER,
    Component: () => <Supplier />,
    title: 'Quản lý nhà cung cấp',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.PROMOTION,
    Component: () => <Promotion />,
    title: 'Khuyến mãi',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.ROLE,
    Component: () => <Role />,
    title: 'Quản lý phân quyền',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SHIPPING_PRODUCT_ADD,
    Component: () => <ShippingProductForm />,
    title: 'Thêm phiếu chuyển hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CATEGORIES,
    Component: () => <Categories />,
    title: 'Quản lý danh mục',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CATEGORY,
    Component: () => <Category />,
    title: 'Danh mục',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SETTING,
    Component: () => <Setting />,
    title: 'Cài đặt',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.OFFER_LIST,
    Component: () => <OfferList />,
    title: 'Danh sách ưu đãi',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.OFFER_LIST_CREATE,
    Component: () => <OfferListCreate />,
    title: 'Tạo ưu đãi',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.BLOG,
    Component: () => <Blog />,
    title: 'Danh sách bài viết',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.BLOG_CREATE,
    Component: () => <BlogCreate />,
    title: 'Tạo bài viết',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.BRAND,
    Component: () => <Brand />,
    title: 'Danh sách thương hiệu',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.BRAND_CREATE,
    Component: () => <BrandCreate />,
    title: 'Tạo thương hiệu',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CHANNEL,
    Component: () => <Channel />,
    title: 'Danh sách kênh',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.IMPORT_INVENTORIES,
    Component: () => <ImportInventories />,
    title: 'Nhập hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.IMPORT_INVENTORY,
    Component: () => <ImportInventory />,
    title: 'Chi tiết đơn hàng nhập kho',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.RECEIPTS_PAYMENT,
    Component: () => <ReceiptsAndPayment />,
    title: 'Báo cáo thu chi',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SELL,
    Component: () => <Sell />,
    title: 'Bán hàng',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.SETTING_BILL,
    Component: () => <SettingBill />,
    title: 'Cài đặt máy in bill',
    permissions: [],
    exact: true,
  },
]

const AUTH_ROUTER = [
  {
    path: ROUTES.CHECK_SUBDOMAIN,
    Component: () => <LoginBusiness />,
    exact: true,
    title: 'Login business',
    permissions: [],
  },
  {
    path: ROUTES.LOGIN,
    Component: () => <Login />,
    exact: true,
    title: 'Login',
    permissions: [],
  },
  {
    path: ROUTES.REGISTER,
    Component: () => <Register />,
    exact: true,
    title: 'Register',
    permissions: [],
  },
  {
    path: ROUTES.OTP,
    Component: () => <OTP />,
    exact: true,
    title: 'OTP',
    permissions: [],
  },
  {
    path: ROUTES.VERIFY_ACCOUNT,
    Component: () => <VerifyAccount />,
    title: 'Xác thực tài khoản',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.PASSWORD_NEW,
    Component: () => <PasswordNew />,
    exact: true,
    title: 'New password',
    permissions: [],
  },
  {
    path: ROUTES.FORGET_PASSWORD,
    Component: () => <ForgetPassword />,
    exact: true,
    title: 'Forget password',
    permissions: [],
  },

  {
    path: ROUTES.PAYMENT_TYPE,
    Component: () => <PaymentType />,
    title: 'Loại phiêu chi',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.RECEIPTS_TYPE,
    Component: () => <ReceiptsType />,
    title: 'Loại phiếu thu',
    permissions: [],
    exact: true,
  },
  {
    path: ROUTES.CONTACT,
    Component: () => <Contact />,
    title: 'Liên hệ',
    permissions: [],
    exact: true,
  },
]

export default function Views() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact={true}>
          <Redirect to={ROUTES.OVERVIEW} />
        </Route>

        {DEFINE_ROUTER.map(({ Component, ...rest }, index) => (
          <Route {...rest} key={index}>
            <Authentication {...rest}>
              <BaseLayout>
                <Component />
              </BaseLayout>
            </Authentication>
          </Route>
        ))}

        {AUTH_ROUTER.map(({ Component, ...rest }, index) => (
          <Route {...rest} key={index}>
            <Component />
          </Route>
        ))}

        <Route path="*">
          <NotFound />
        </Route>

        {/* ở đây */}
      </Switch>
    </BrowserRouter>
  )
}
