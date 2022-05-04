class CreateWarehouseData {
    /**
     *
     * @param {CreateWarehouseData} data
     * @returns
     */
    constructor(data) {
        this.name = data.name;
        this.phone = data.phone;
        this.address = data.address;
        this.ward_code = data.ward_code;
        this.district_id = data.district_id;
    }
}

module.exports = { CreateWarehouseData };
