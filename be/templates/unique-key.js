module.exports._createUniqueKey = async (client, databaseName) => {
    try {
        await client.db(databaseName).collection('Actions').createIndexes({ slug_type: 1 });
        await client.db(databaseName).collection('Actions').createIndexes({ slug_properties: 1 });
        await client.db(databaseName).collection('Actions').createIndexes({ slug_name: 1 });

        await client.db(databaseName).collection('AppSetting').createIndexes({ name: 1 }, { unique: true });

        await client.db(databaseName).collection('Attributes').createIndexes({ attribute_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Attributes').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Attributes').createIndexes({ product_id: 1 });

        await client.db(databaseName).collection('Branchs').createIndexes({ branch_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Branchs').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_ward: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_district: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_province: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Brands').createIndexes({ brand_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Brands').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Brands').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Brands').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Categories').createIndexes({ category_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Categories').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Categories').createIndexes({ parent_id: 1 });
        await client.db(databaseName).collection('Categories').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Categories').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('CustomerTypes').createIndexes({ type_id: 1 }, { unique: true });
        await client.db(databaseName).collection('CustomerTypes').createIndexes({ code: 1 });
        await client.db(databaseName).collection('CustomerTypes').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('CustomerTypes').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('CustomerTypes').createIndexes({ type_id: 1 }, { unique: true });
        await client.db(databaseName).collection('CustomerTypes').createIndexes({ code: 1 });
        await client.db(databaseName).collection('CustomerTypes').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('CustomerTypes').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Customers').createIndexes({ customer_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Customers').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_ward: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_district: 1 });
        await client.db(databaseName).collection('Branchs').createIndexes({ slug_province: 1 });
        await client.db(databaseName).collection('Customers').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('ImportOrders').createIndexes({ order_id: 1 }, { unique: true });
        await client.db(databaseName).collection('ImportOrders').createIndexes({ code: 1 });
        await client.db(databaseName).collection('ImportOrders').createIndexes({ status: 1 });
        await client.db(databaseName).collection('ImportOrders').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('ImportOrders').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Inventories').createIndexes({ inventory_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Inventories').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Inventories').createIndexes({ product_id: 1 });
        await client.db(databaseName).collection('Inventories').createIndexes({ variant_id: 1 });
        await client.db(databaseName).collection('Inventories').createIndexes({ branch_id: 1 });
        await client.db(databaseName).collection('Inventories').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Labels').createIndexes({ label_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Labels').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Labels').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Labels').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Locations').createIndexes({ location_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Locations').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Locations').createIndexes({ product_id: 1 });
        await client.db(databaseName).collection('Locations').createIndexes({ variant_id: 1 });
        await client.db(databaseName).collection('Locations').createIndexes({ branch_id: 1 });
        await client.db(databaseName).collection('Locations').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Orders').createIndexes({ order_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Orders').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Orders').createIndexes({ status: 1 });
        await client.db(databaseName).collection('Orders').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('PaymentMethods').createIndexes({ payment_method_id: 1 }, { unique: true });
        await client.db(databaseName).collection('PaymentMethods').createIndexes({ code: 1 });
        await client.db(databaseName).collection('PaymentMethods').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('PaymentMethods').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Products').createIndexes({ product_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Products').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Products').createIndexes({ sku: 1 });
        await client.db(databaseName).collection('Products').createIndexes({ slug: 1 });
        await client.db(databaseName).collection('Products').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Products').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Roles').createIndexes({ role_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Roles').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Roles').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Roles').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ shipping_company_id: 1 }, { unique: true });
        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ code: 1 });
        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ slug_ward: 1 });
        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ slug_district: 1 });
        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ slug_province: 1 });
        await client.db(databaseName).collection('ShippingCompanies').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Suppliers').createIndexes({ supplier_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Suppliers').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Suppliers').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Suppliers').createIndexes({ slug_ward: 1 });
        await client.db(databaseName).collection('Suppliers').createIndexes({ slug_district: 1 });
        await client.db(databaseName).collection('Suppliers').createIndexes({ slug_province: 1 });
        await client.db(databaseName).collection('Suppliers').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Taxes').createIndexes({ tax_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Taxes').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Taxes').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Taxes').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('TransportOrders').createIndexes({ order_id: 1 }, { unique: true });
        await client.db(databaseName).collection('TransportOrders').createIndexes({ code: 1 });
        await client.db(databaseName).collection('TransportOrders').createIndexes({ status: 1 });
        await client.db(databaseName).collection('TransportOrders').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('TransportOrders').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Users').createIndexes({ user_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Users').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ username: 1 }, { unique: true });
        await client.db(databaseName).collection('Users').createIndexes({ phone: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ email: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ branch_id: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ slug_ward: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ slug_district: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ slug_province: 1 });
        await client.db(databaseName).collection('Users').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Variants').createIndexes({ variant_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Variants').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Variants').createIndexes({ product_id: 1 });
        await client.db(databaseName).collection('Variants').createIndexes({ sku: 1 });
        await client.db(databaseName).collection('Variants').createIndexes({ slug_title: 1 });
        await client.db(databaseName).collection('Variants').createIndexes({ create_date: 1 });

        await client.db(databaseName).collection('Warranties').createIndexes({ warranty_id: 1 }, { unique: true });
        await client.db(databaseName).collection('Warranties').createIndexes({ code: 1 });
        await client.db(databaseName).collection('Warranties').createIndexes({ slug_name: 1 });
        await client.db(databaseName).collection('Warranties').createIndexes({ create_date: 1 });
    } catch (err) {
        throw err;
    }
};
