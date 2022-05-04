class InputString {
    constructor(text) {
        if (typeof text != 'string') {
            text = String(text || '');
            // throw new Error('Typeof input must be string!');
        }
        this.value = String(text).trim();
    }
}

class HandleOptions {
    constructor(options) {
        /**
         * Xóa dấu tiếng việt
         * @example
         *
         * Chuỗi có dấu ban đầu
         * // => Chuoi co dau ban dau
         */
        this.removeUnicode = options.removeUnicode;
        this.removeSpace = options.removeSpace;
        this.removeSpecialCharacter = options.removeSpecialCharacter;
        this.removeStringInBrackets = options.removeStringInBrackets;
        this.replaceSpaceWithHyphen = options.replaceSpaceWithHyphen;
        this.createSlug = options.createSlug;
        this.createRegexQuery = options.createRegexQuery;
        this.getFirstLetter = options.getFirstLetter;
        this.lowerCase = options.lowerCase;
        this.upperCase = options.upperCase;
    }
}

/**
 * Các phương thức xử lý chuỗi thường gặp
 * @param {InputString} text Chuỗi cần xử lý
 * @param {HandleOptions} options Các tùy chọn xử lý
 * @returns {String} Chuỗi sau khi được xử lý
 */
let stringHandle = (text, options) => {
    text = new InputString(text).value;
    options = new HandleOptions(options);
    if (options) {
        if (options.removeStringInBrackets) {
            if (options.removeStringInBrackets == 'round') {
                text = text.replace(/\((.*?)\)/gi, '');
            }
            if (options.removeStringInBrackets == 'square') {
                text = text.replace(/\[(.*?)\]/gi, '');
            }
            if (options.removeStringInBrackets == 'curly') {
                text = text.replace(/\{(.*?)\}/gi, '');
            }
            if (options.removeStringInBrackets == 'angle') {
                text = text.replace(/\<(.*?)\>/gi, '');
            }
        }
        if (options.removeUnicode) {
            text = text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D');
        }
        if (options.getFirstLetter) {
            text = text
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s{1,}/g, ' ')
                .split(' ')
                .map((e) => {
                    if (/[0-9]/g.test(e)) {
                        return e;
                    }
                    return e[0];
                });
            text = text.join('');
        }
        if (options.createSlug) {
            text = text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .replace(/[^a-zA-Z0-9]/g, ' ')
                .trim()
                .replace(/\s{1,}/g, '-')
                .toLowerCase();
        }
        if (options.createRegexQuery) {
            text = text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .replace(/[^a-zA-Z0-9]/g, '-')
                .trim()
                .replace(/-{1,}/g, '(.*?)')
                .toLowerCase();
        }
        if (options.removeSpecialCharacter) {
            text = text.replace(/[^a-zA-Z0-9\s]/g, ' ');
        }
        if (options.replaceSpaceWithHyphen) {
            text = text
                .replace(/[^a-zA-Z0-9]/g, ' ')
                .trim()
                .replace(/\s{1,}/g, '-');
        }
        if (options.removeSpace) {
            text = text.replace(/\s/g, '');
        }
        if (options.lowerCase) {
            text = text.toLowerCase();
        }
        if (options.upperCase) {
            text = text.toUpperCase();
        }
    }
    return text;
};

module.exports = { stringHandle };
