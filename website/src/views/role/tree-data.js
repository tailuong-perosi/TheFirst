import { PERMISSIONS } from 'consts'

const foo = [
  {
    title: 'Tổng quan',
    key: PERMISSIONS.tong_quan,
  },
  {
    title: 'Bán hàng',
    key: PERMISSIONS.ban_hang,
  },
  {
    title: 'Danh sách đơn hàng',
    key: PERMISSIONS.danh_sach_don_hang,
    children: [
      {
        title: 'Tạo đơn hàng',
        key: PERMISSIONS.tao_don_hang,
      },
    ],
  },
  {
    title: 'Nhập hàng',
    key: PERMISSIONS.nhap_hang,
  },
  {
    title: PERMISSIONS.giao_dien_nhap_hang_vao_vi_tri,
    key: PERMISSIONS.giao_dien_nhap_hang_vao_vi_tri,
    children: [
      {
        title: PERMISSIONS.cap_nhat_nhap_hang_vao_vi_tri,
        key: PERMISSIONS.cap_nhat_nhap_hang_vao_vi_tri,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_quan_ly_doanh_nghiep,
    key: PERMISSIONS.giao_dien_quan_ly_doanh_nghiep,
    children: [
      {
        title: PERMISSIONS.tao_doanh_nghiep,
        key: PERMISSIONS.tao_doanh_nghiep,
      },
      {
        title: PERMISSIONS.cap_nhat_doanh_nghiep,
        key: PERMISSIONS.cap_nhat_doanh_nghiep,
      },
      {
        title: PERMISSIONS.xoa_doanh_nghiep,
        key: PERMISSIONS.xoa_doanh_nghiep,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_danh_sach_xuat_hang,
    key: PERMISSIONS.giao_dien_danh_sach_xuat_hang,
    children: [
      {
        title: PERMISSIONS.tao_danh_sach_xuat_hang,
        key: PERMISSIONS.tao_danh_sach_xuat_hang,
      },
      {
        title: PERMISSIONS.cap_nhat_danh_sach_xuat_hang,
        key: PERMISSIONS.cap_nhat_danh_sach_xuat_hang,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_dong_goi,
    key: PERMISSIONS.giao_dien_dong_goi,
    children: [
      {
        title: PERMISSIONS.cap_nhat_dong_goi,
        key: PERMISSIONS.cap_nhat_dong_goi,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_ban_giao_van_chuyen,
    key: PERMISSIONS.giao_dien_ban_giao_van_chuyen,
    children: [
      {
        title: PERMISSIONS.cap_nhat_ban_giao_van_chuyen,
        key: PERMISSIONS.cap_nhat_ban_giao_van_chuyen,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_da_ban_giao_van_chuyen,
    key: PERMISSIONS.giao_dien_da_ban_giao_van_chuyen,
  },
  {
    title: PERMISSIONS.giao_dien_kho_hang,
    key: PERMISSIONS.giao_dien_kho_hang,
    children: [
      {
        title: PERMISSIONS.tao_kho_hang,
        key: PERMISSIONS.tao_kho_hang,
      },
      {
        title: PERMISSIONS.cap_nhat_kho_hang,
        key: PERMISSIONS.cap_nhat_kho_hang,
      },
      {
        title: PERMISSIONS.xoa_kho_hang,
        key: PERMISSIONS.xoa_kho_hang,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_o_chua_hang,
    key: PERMISSIONS.giao_dien_o_chua_hang,
    children: [
      {
        title: PERMISSIONS.cap_nhat_o_chua_hang,
        key: PERMISSIONS.cap_nhat_o_chua_hang,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_thung_dung,
    key: PERMISSIONS.giao_dien_thung_dung,
    children: [
      {
        title: PERMISSIONS.tao_thung_dung,
        key: PERMISSIONS.tao_thung_dung,
      },
      {
        title: PERMISSIONS.cap_nhat_thung_dung,
        key: PERMISSIONS.cap_nhat_thung_dung,
      },
      {
        title: PERMISSIONS.xoa_thung_dung,
        key: PERMISSIONS.xoa_thung_dung,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_danh_sach_phu_lieu,
    key: PERMISSIONS.giao_dien_danh_sach_phu_lieu,
    children: [
      {
        title: PERMISSIONS.tao_phu_lieu,
        key: PERMISSIONS.tao_phu_lieu,
      },
      {
        title: PERMISSIONS.cap_nhat_phu_lieu,
        key: PERMISSIONS.cap_nhat_phu_lieu,
      },
      {
        title: PERMISSIONS.xoa_phu_lieu,
        key: PERMISSIONS.xoa_phu_lieu,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_chi_phi_kho,
    key: PERMISSIONS.giao_dien_chi_phi_kho,
    children: [
      {
        title: PERMISSIONS.tao_chi_phi_kho,
        key: PERMISSIONS.tao_chi_phi_kho,
      },
      {
        title: PERMISSIONS.cap_nhat_chi_phi_kho,
        key: PERMISSIONS.cap_nhat_chi_phi_kho,
      },
      {
        title: PERMISSIONS.xoa_chi_phi_kho,
        key: PERMISSIONS.xoa_chi_phi_kho,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_bang_ke_chi_phi,
    key: PERMISSIONS.giao_dien_bang_ke_chi_phi,
  },
  {
    title: PERMISSIONS.giao_dien_don_vi_van_chuyen,
    key: PERMISSIONS.giao_dien_don_vi_van_chuyen,
    children: [
      {
        title: PERMISSIONS.tao_don_vi_van_chuyen,
        key: PERMISSIONS.tao_don_vi_van_chuyen,
      },
      {
        title: PERMISSIONS.cap_nhat_don_vi_van_chuyen,
        key: PERMISSIONS.cap_nhat_don_vi_van_chuyen,
      },

      {
        title: PERMISSIONS.xoa_don_vi_van_chuyen,
        key: PERMISSIONS.xoa_don_vi_van_chuyen,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_quan_ly_nhan_vien,
    key: PERMISSIONS.giao_dien_quan_ly_nhan_vien,
    children: [
      {
        title: PERMISSIONS.tao_nhan_vien,
        key: PERMISSIONS.tao_nhan_vien,
      },
      {
        title: PERMISSIONS.cap_nhat_nhan_vien,
        key: PERMISSIONS.cap_nhat_nhan_vien,
      },
      {
        title: PERMISSIONS.xoa_nhan_vien,
        key: PERMISSIONS.xoa_nhan_vien,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_quan_ly_phan_quyen,
    key: PERMISSIONS.giao_dien_quan_ly_phan_quyen,
    children: [
      {
        title: PERMISSIONS.tao_phan_quyen,
        key: PERMISSIONS.tao_phan_quyen,
      },
      {
        title: PERMISSIONS.cap_nhat_phan_quyen,
        key: PERMISSIONS.cap_nhat_phan_quyen,
      },
      {
        title: PERMISSIONS.xoa_phan_quyen,
        key: PERMISSIONS.xoa_phan_quyen,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_lich_su_thao_tac,
    key: PERMISSIONS.giao_dien_lich_su_thao_tac,
  },
  {
    title: PERMISSIONS.giao_dien_quan_ly_xuat_nhap,
    key: PERMISSIONS.giao_dien_quan_ly_xuat_nhap,
  },
  {
    title: PERMISSIONS.giao_dien_quan_ly_thiet_bi_in,
    key: PERMISSIONS.giao_dien_quan_ly_thiet_bi_in,
    children: [
      {
        title: PERMISSIONS.cap_nhat_thiet_bi_in,
        key: PERMISSIONS.cap_nhat_thiet_bi_in,
      },
    ],
  },
  {
    title: PERMISSIONS.giao_dien_bao_cao_ton_kho_tong_hop,
    key: PERMISSIONS.giao_dien_bao_cao_ton_kho_tong_hop,
  },
  {
    title: PERMISSIONS.giao_dien_bao_cao_nhap_kho,
    key: PERMISSIONS.giao_dien_bao_cao_nhap_kho,
  },
  {
    title: PERMISSIONS.giao_dien_bao_cao_xuat_kho,
    key: PERMISSIONS.giao_dien_bao_cao_xuat_kho,
  },
  {
    title: PERMISSIONS.giao_dien_bao_cao_ton_kho_chi_tiet,
    key: PERMISSIONS.giao_dien_bao_cao_ton_kho_chi_tiet,
  },
]
export default foo
