//icons
import {
  RadarChartOutlined,
  AreaChartOutlined,
  SlidersOutlined,
  DatabaseOutlined,
  BlockOutlined,
} from '@ant-design/icons'
import { ROUTES } from 'consts'

const REPORTS = [
  {
    icon: <RadarChartOutlined style={{ fontSize: 50, color: '#4e4e4e' }} />,
    path: ROUTES.REPORT_VARIANT,
    title: 'Báo cáo tồn kho theo thuộc tính',
    permissions: [],
    subtitle: '',
  },
  {
    icon: (
      <svg
        style={{ width: 50, height: 50, color: '#4e4e4e' }}
        aria-hidden="true"
        focusable="false"
        data-prefix="fal"
        data-icon="dolly-flatbed-alt"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512"
        class="svg-inline--fa fa-dolly-flatbed-alt fa-w-20 fa-3x"
      >
        <path
          fill="currentColor"
          d="M208 352h384c8.8 0 16-7.2 16-16V208c0-8.8-7.2-16-16-16h-48V80c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16zM416 96h96v96h-96V96zm0 128h160v96H416v-96zM224 96h160v224H224V96zm408 320H128V8c0-4.4-3.6-8-8-8H8C3.6 0 0 3.6 0 8v16c0 4.4 3.6 8 8 8h88v408c0 4.4 3.6 8 8 8h58.9c-1.8 5-2.9 10.4-2.9 16 0 26.5 21.5 48 48 48s48-21.5 48-48c0-5.6-1.2-11-2.9-16H451c-1.8 5-2.9 10.4-2.9 16 0 26.5 21.5 48 48 48s48-21.5 48-48c0-5.6-1.2-11-2.9-16H632c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm-424 64c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm288 0c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z"
          class=""
        ></path>
      </svg>
    ),
    path: ROUTES.REPORT_INVENTORY,
    title: 'Báo cáo tồn kho theo sản phẩm',
    permissions: [],
    subtitle: '',
  },
  {
    icon: <DatabaseOutlined style={{ fontSize: 50, color: '#4e4e4e' }} />,
    path: ROUTES.REPORT_IMPORT_EXPORT_INVENTORY_VARIANT,
    title: 'Báo cáo xuất nhập tồn theo thuộc tính',
    permissions: [],
    subtitle: '',
  },
  {
    icon: <BlockOutlined style={{ fontSize: 50, color: '#4e4e4e' }} />,
    path: ROUTES.REPORT_IMPORT_EXPORT_INVENTORY_PRODUCT,
    title: 'Báo cáo xuất nhập tồn theo sản phẩm',
    permissions: [],
    subtitle: '',
  },
  {
    icon: (
      <svg
        style={{ width: 50, height: 50, color: '#4e4e4e' }}
        aria-hidden="true"
        focusable="false"
        data-prefix="fal"
        data-icon="sack-dollar"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="svg-inline--fa fa-sack-dollar fa-w-16 fa-3x"
      >
        <path
          fill="currentColor"
          d="M334.89 121.63l43.72-71.89C392.77 28.47 377.53 0 352 0H160.15c-25.56 0-40.8 28.5-26.61 49.76l43.57 71.88C-9.27 240.59.08 392.36.08 412c0 55.23 49.11 100 109.68 100h292.5c60.58 0 109.68-44.77 109.68-100 0-19.28 8.28-172-177.05-290.37zM160.15 32H352l-49.13 80h-93.73zM480 412c0 37.49-34.85 68-77.69 68H109.76c-42.84 0-77.69-30.51-77.69-68v-3.36c-.93-59.86 20-173 168.91-264.64h110.1C459.64 235.46 480.76 348.94 480 409zM285.61 310.74l-49-14.54c-5.66-1.62-9.57-7.22-9.57-13.68 0-7.86 5.76-14.21 12.84-14.21h30.57a26.78 26.78 0 0 1 13.93 4 8.92 8.92 0 0 0 11-.75l12.73-12.17a8.54 8.54 0 0 0-.65-13 63.12 63.12 0 0 0-34.17-12.17v-17.6a8.68 8.68 0 0 0-8.7-8.62H247.2a8.69 8.69 0 0 0-8.71 8.62v17.44c-25.79.75-46.46 22.19-46.46 48.57 0 21.54 14.14 40.71 34.38 46.74l49 14.54c5.66 1.61 9.58 7.21 9.58 13.67 0 7.87-5.77 14.22-12.84 14.22h-30.61a26.72 26.72 0 0 1-13.93-4 8.92 8.92 0 0 0-11 .76l-12.84 12.06a8.55 8.55 0 0 0 .65 13 63.2 63.2 0 0 0 34.17 12.17v17.55a8.69 8.69 0 0 0 8.71 8.62h17.41a8.69 8.69 0 0 0 8.7-8.62V406c25.68-.64 46.46-22.18 46.57-48.56.02-21.5-14.13-40.67-34.37-46.7z"
          class=""
        ></path>
      </svg>
    ),
    path: ROUTES.SALES_REPORT,
    title: 'Báo cáo bán hàng',
    permissions: [],
    subtitle: '',
  },
  {
    icon: <AreaChartOutlined style={{ fontSize: 50, color: '#4e4e4e' }} />,
    path: ROUTES.RECEIPTS_PAYMENT,
    title: 'Báo cáo thu chi',
    permissions: [],
    subtitle: '',
  },
]

export default REPORTS