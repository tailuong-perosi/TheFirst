const _ = require("lodash");
var sumOutput = [];

const TienThoi = (sumTong) => {
  if (sumTong <= 500000 && sumTong > 200000) {
    sum500k(sumTong, sumTong);
  } else if (sumTong <= 200000 && sumTong > 100000) {
    sum200k(sumTong, sumTong);
  } else if (sumTong <= 100000 && sumTong > 50000) {
    sum100k(sumTong, sumTong);
  } else if (sumTong <= 50000 && sumTong > 20000) {
    sum50k(sumTong, sumTong);
  } else if (sumTong <= 20000 && sumTong >= 10000) {
    sum20k(sumTong, sumTong);
  }
  sumOutput.push(sumTong);
  return locTrung();
};

const sum500k = (sumTong, sumRemain) => {
  var sum = 0;
  var number500 = 0;
  if (sumRemain % 500000 == 0) {
    number500 = parseInt(sumRemain / 500000);
  } else {
    number500 = parseInt(sumRemain / 500000) + 1;
  }
  for (var i = number500; i >= 0; i--) {
    if (sumRemain - i * 500000 <= 0) {
      sum = i * 500000;
      sumOutput.push(sumTong - sumRemain + sum);
    } else {
      sum200k(sumTong, sumRemain - i * 500000);
    }
  }
};

const sum200k = (sumTong, sumRemain) => {
  var sum = 0;
  var number200 = 0;
  if (sumRemain % 200000 == 0) {
    number200 = parseInt(sumRemain / 200000);
  } else {
    number200 = parseInt(sumRemain / 200000) + 1;
  }
  for (var i = number200; i >= 0; i--) {
    if (sumRemain - i * 200000 <= 0) {
      sum = i * 200000;
      sumOutput.push(sumTong - sumRemain + sum);
    } else {
      sum100k(sumTong, sumRemain - i * 200000);
    }
  }
};

const sum100k = (sumTong, sumRemain) => {
  var sum = 0;
  var number100 = 0;
  if (sumRemain % 100000 == 0) {
    number100 = parseInt(sumRemain / 100000);
  } else {
    number100 = parseInt(sumRemain / 100000) + 1;
  }
  for (var i = number100; i >= 0; i--) {
    if (sumRemain - i * 100000 <= 0) {
      sum = i * 100000;
      sumOutput.push(sumTong - sumRemain + sum);
    } else {
      sum50k(sumTong, sumRemain - i * 100000);
    }
  }
};

const sum50k = (sumTong, sumRemain) => {
  var sum = 0;
  var number50 = 0;
  if (sumRemain % 50000 == 0) {
    number50 = parseInt(sumRemain / 50000);
  } else {
    number50 = parseInt(sumRemain / 50000) + 1;
  }
  for (var i = number50; i >= 0; i--) {
    if (sumRemain - i * 50000 <= 0) {
      sum = i * 50000;
      sumOutput.push(sumTong - sumRemain + sum);
    } else {
      sum20k(sumTong, sumRemain - i * 50000);
    }
  }
};

const sum20k = (sumTong, sumRemain) => {
  var sum = 0;
  var number20 = 0;
  if (sumRemain % 20000 == 0) {
    number20 = parseInt(sumRemain / 20000);
  } else {
    number20 = parseInt(sumRemain / 20000) + 1;
  }
  for (var i = number20; i >= 0; i--) {
    if (sumRemain - i * 20000 <= 0) {
      sum = i * 20000;
      sumOutput.push(sumTong - sumRemain + sum);
    } else {
      sum10k(sumTong, sumRemain - i * 20000);
    }
  }
};

const sum10k = (sumTong, sumRemain) => {
  var sum = 0;
  var number10 = 0;
  if (sumRemain % 10000 == 0) {
    number10 = parseInt(sumRemain / 10000);
  } else {
    number10 = parseInt(sumRemain / 10000) + 1;
  }
  for (var i = number10; i > 0; i--) {
    if (sumRemain - i * 10000 <= 0) {
      sum = i * 10000;
      sumOutput.push(sumTong - sumRemain + sum);
    } else {
    }
  }
};

const locTrung = () => {
  var min = 1000000;
  sumOutput.map((i) => {
    if (i < min) min = i;
  });

  var lst = [10000, 20000, 50000, 100000, 200000, 500000];

  lst.map((i) => {
    if (i > min) sumOutput.push(i);
  });

  var result = [];
  for (var i = 0; i < sumOutput.length; i++) {
    var isHave = false;
    for (var j = 0; j < result.length; j++) {
      if (result[j] == sumOutput[i]) isHave = true;
    }

    if (!isHave) result.push(sumOutput[i]);
  }
  result = _.sortBy(result, (o) => {
    return o;
  });

  return result;
};

// IF React
export default TienThoi;

// If Nodejs
// module.exports = { TienThoi };
