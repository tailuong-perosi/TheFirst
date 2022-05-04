module.exports._enum = [
    { type: 'ORDER', name: 'DRAFT', label: 'Lưu nháp' },
    { type: 'ORDER', name: 'VERIFY', label: 'Đã xác nhận' },
    { type: 'ORDER', name: 'PROCESSING', label: 'Đang thực hiện' },
    { type: 'ORDER', name: 'SHIPPING', label: 'Đang vận chuyển' },
    { type: 'ORDER', name: 'COMPLETE', label: 'Hoàn thành' },
    { type: 'ORDER', name: 'CANCEL', label: 'Hủy đơn' },
    { type: 'ORDER', name: 'REFUND', label: 'Trả hàng' },
    { type: 'SHIPPING', name: 'DRAFT', label: 'Lưu nháp' },
    { type: 'SHIPPING', name: 'WAITING_FOR_SHIPPING', label: 'Đợi vận chuyển' },
    { type: 'SHIPPING', name: 'SHIPPING', label: 'Đang vận chuyển' },
    { type: 'SHIPPING', name: 'COMPARED', label: 'Đối soát hoàn tất' },
    { type: 'SHIPPING', name: 'COMPLETE', label: 'Hoàn thành' },
    { type: 'SHIPPING', name: 'CANCEL', label: 'Hủy đơn' },
    { type: 'PAYMENT', name: 'UNPAID', label: 'Chưa thanh toán' },
    { type: 'PAYMENT', name: 'PAYING', label: 'Thanh toán một phần' },
    { type: 'PAYMENT', name: 'PAID', label: 'Thanh toán hoàn tất' },
    { type: 'PAYMENT', name: 'REFUND', label: 'Hoàn tiền' },
    { type: 'IMPORT_ORDER', name: 'DRAFT', label: 'Lưu nháp' },
    { type: 'IMPORT_ORDER', name: 'VERIFY', label: 'Đã xác nhận' },
    { type: 'IMPORT_ORDER', name: 'SHIPPING', label: 'Đang vận chuyển' },
    { type: 'IMPORT_ORDER', name: 'COMPLETE', label: 'Hoàn thành' },
    { type: 'IMPORT_ORDER', name: 'CANCEL', label: 'Hủy đơn' },
    { type: 'TRANSPORT_ORDER', name: 'DRAFT', label: 'Lưu nháp' },
    { type: 'TRANSPORT_ORDER', name: 'VERIFY', label: 'Đã xác nhận' },
    { type: 'TRANSPORT_ORDER', name: 'SHIPPING', label: 'Đang vận chuyển' },
    { type: 'TRANSPORT_ORDER', name: 'COMPLETE', label: 'Hoàn thành' },
    { type: 'TRANSPORT_ORDER', name: 'CANCEL', label: 'Lưu nháp' },
];

require('dotenv').config();
const client = require('../config/mongodb');
const SDB = process.env.DATABASE;

(async () => {
    await client.db(SDB).collection('Enums').insertMany(this._enum);
    client.close();
    console.log(`Insert enum to ${SDB} database success!`);
})();
