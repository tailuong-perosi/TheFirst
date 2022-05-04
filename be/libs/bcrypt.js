const bcrypt = require(`bcrypt`);

let hash = (data) => {
    return bcrypt.hashSync(data, bcrypt.genSaltSync());
};

let compare = (data, hashData) => {
    return bcrypt.compareSync(data, hashData);
};

module.exports = { hash, compare };
