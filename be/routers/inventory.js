const express = require(`express`);

const router = express.Router();
const inventory = require(`../controllers/inventory`);
const { auth } = require(`../middleware/jwt`);

const multer = require('multer');
const _storage = multer.memoryStorage();
const upload = multer({ storage: _storage });

router.route(`/import/create`).post(auth, inventory._createImportOrder);
router.route(`/import/create/file`).post(auth, upload.single('file'), inventory._createImportOrderFile);
router.route(`/import/update/:order_id`).patch(auth, inventory._updateImportOrder);
router.route(`/import`).get(auth, inventory._getImportOrder);
router.route(`/import/delete`).delete(auth, inventory._deleteImportOrder);

router.route(`/transport/create`).post(auth, inventory._createTransportOrder);
router.route(`/transport/create/file`).post(auth, upload.single('file'), inventory._createTransportOrderFile);
router.route(`/transport/update/:order_id`).patch(auth, inventory._updateTransportOrder);
router.route(`/transport`).get(auth, inventory._getTransportOrder);
router.route(`/transport/delete`).delete(auth, upload.single('file'), inventory._deleteTransportOrder);

router.route(`/inventory-note/create`).post(auth, inventory._createInventoryNote);
router.route(`/inventory-note/create/file`).post(auth, upload.single('file'), inventory._createInventoryNoteFile);
router.route(`/inventory-note/update/:inventory_note_id`).patch(auth, inventory._updateInventoryNote);
router.route(`/inventory-note`).get(auth, inventory._getInventoryNote);
router.route(`/inventory-note/delete`).delete(auth, inventory._deleteInventoryNote);

module.exports = router;
