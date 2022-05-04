// let arrs = [{ product_id: 1, name: 1 }, { product_id: 2, name: 2 }, { product_id: 3, name: 3 }, { name: 4 }, null];
// let _arrs = arrs.reduce((pre, cur) => ({ ...pre, ...(cur && cur.product_id && { [cur.product_id]: cur }) }), {});
// console.log(_arrs);
const moment = require('moment-timezone');
console.log(moment('2022-04-25').tz('Asia/Ho_Chi_Minh').format());
