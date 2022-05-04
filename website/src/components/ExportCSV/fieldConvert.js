export const convertFields = (data, template, reverse = false) => {
  if (reverse) {
    return Object.keys(template).reduce(
      (a, b) => ((a[template[b]] = data[b] || ''), a),
      {}
    )
  }
  return Object.keys(template).reduce(
    (a, b) => ((a[b] = data[template[b]] || ''), a),
    {}
  )
}

export const guarantee = {
  code: 'Mã phiếu (*)',
  name: 'Tên bảo hành (*)',
  type: 'Loại bảo hành (*)',
  time: 'Thời hạn bảo hành (*)',
  description: 'Mô tả',
}

export const rolesTranslate = (key) => {
  const data = {
    //tổng quan
    tong_quan: 'Tổng quan',
    //bán hàng
    ban_hang: 'Bán hàng',
    // danh sách đơn hàng
    danh_sach_don_hang: 'Danh sách đơn hàng',
    tao_don_hang: 'Tạo đơn hàng',
    //quản lý doanh nghiệp
    business_management: 'Quản lý các doanh nghiệp',

    // sản phẩm
    san_pham: 'Sản phẩm',
    quan_li_san_pham: 'Quản lý Sản phẩm',
    them_san_pham: 'Thêm sản phẩm',
    xoa_san_pham: 'Xoá sản phẩm',
    nhom_san_pham: 'Nhóm sản phẩm',
    tao_nhom_san_pham: 'Tạo nhóm sản phẩm',
    cap_nhat_nhom_san_pham: 'Cập nhật nhóm sản phẩm',
    xoa_nhom_san_pham: 'Xóa nhóm sản phẩm',
    //chi nhánh
    quan_li_chi_nhanh: 'Quản lý chi nhánh',
    them_chi_nhanh: 'Thêm chi nhánh',
    cap_nhat_chi_nhanh: 'Cập nhật chi nhánh',
    //kho
    quan_li_kho: 'Quản lý Kho',
    them_kho: 'Thêm kho',
    cap_nhat_kho: 'Cập nhật kho',
    //quản lý chuyển hàng
    quan_li_chuyen_hang: 'Quản lý giao hàng',
    tao_phieu_chuyen_hang: 'Tạo phiếu giao hàng',
    cap_nhat_trang_thai_phieu_chuyen_hang:
      'Cập nhật trạng thái phiếu giao hàng',
    //Nhà cung cấp
    quan_li_nha_cung_cap: 'Quản lý nhà cung cấp',
    them_nha_cung_cap: 'Thêm nhà cung cáp',
    cap_nhat_nha_cung_cap: 'Cập nhật nhà cung cấp',
    //Bảo hành
    quan_li_bao_hanh: 'Quản lý bảo hành',
    them_phieu_bao_hanh: 'Thêm phiếu bảo hành',
    // Khuyến mãi
    khuyen_mai: 'Khuyến mãi',
    them_khuyen_mai: 'Thêm khuyến mãi',
    // Nhập hàng
    kiem_hang_cuoi_ngay: 'Kiểm hàng cuối ngày',
    them_phieu_kiem_hang: 'Thêm phiếu kiểm hàng',
    // kiểm hàng cuối ngày
    nhap_hang: 'Nhập hàng',
    them_phieu_nhap_hang: 'Thêm phiếu nhập hàng',
    //tích điểm
    tich_diem: 'Tích điểm',
    //Phiếu chuyển hàng
    phieu_chuyen_hang: 'Phiếu chuyển hàng',
    //Quản lý khách  hàng
    quan_li_khach_hang: 'Quản lý khách hàng',
    them_khach_hang: 'Thêm khách hàng',
    cap_nhat_khach_hang: 'Cập nhật khách hàng',
    // Báo cáo đơn hàng
    bao_cao_don_hang: 'Báo cáo đơn hàng',
    // Báo cáo cuối ngày
    bao_cao_cuoi_ngay: 'Báo cáo cuối ngày',
    // Báo cáo nhập hàng
    bao_cao_nhap_hang: 'Báo cáo nhập hàng',
    // Báo cáo tồn kho
    bao_cao_ton_kho: 'Báo cáo tồn kho',
    // Báo cáo Tài chính
    bao_cao_tai_chinh: 'Báo cáo tài chính',
    // Vận chuyển
    van_chuyen: 'Vận chuyển',
    doi_soat_van_chuyen: 'Đối soát vận chuyển',
    them_phieu_doi_soat_van_chuyen: 'Thêm phiếu đối soát vận chuyển',
    quan_li_doi_tac_van_chuyen: 'Quản lý đối tác vận chuyển',
    them_doi_tac_van_chuyen: 'Thêm đối tác vận chuyển',
    cap_nhat_doi_tac_van_chuyen: 'Cập nhật đối tác vận chuyển',
    xoa_doi_tac_van_chuyen: 'Xóa đối tác vận chuyển',

    // Cấu hình thông tin
    cau_hinh_thong_tin: 'Cấu hình thông tin',
    quan_li_nguoi_dung: 'Quản lý người dùng',
    them_nguoi_dung: 'Thêm người dùng',
    quan_li_nhan_su: 'Quản lý nhân sự',
    them_nhan_su: 'Thêm nhân sự',
    cap_nhat_nhan_su: 'Cập nhật nhân sự',
    quan_li_thue: 'Quản lý thuế',
    them_thue: 'Thêm thuế',
    quan_li_thanh_toan: 'Quản lý thanh toán',
    them_hinh_thuc_thanh_toan: 'Thêm hình thức thanh toán',
    nhap_xuat_file: 'Nhập/xuất file',
    nhat_ki_hoat_dong: 'Nhật ký hoạt động',
    // Quản lý phân quyền
    quan_li_phan_quyen: 'Quản lý phân quyền',
    tao_quyen: 'Tạo quyền',
  }
  return data[key] || key
}
