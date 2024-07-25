let helpers = {};

/**
 * Converts JSON to encoded uri
 * @param {object} input object to be converted
 * @returns {string} encoded uri string
 */
helpers.convertJSONtoURI = (input) => {
    return encodeURIComponent(JSON.stringify(input));
};

/**
 * Formats string to camelCase string
 * @param {string} string input string
 * @returns {string} formatted string
 */
helpers.toCamelCase = (string) => {
    let output = '';
    
    let words = string.split(' ');

    if (words.length === 1) {
        let word = words[0];
        return word[0].toLowerCase() + word.slice(1);
    }

    words.forEach(function (el, i) {
        let word = el.toLowerCase();
        output += (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1));
    });

    return output;
};

/**
 * Checks that string starts with the required prefix
 * @param {string} string string to check
 * @param {string} prefix expected start of the string
 * @returns 
 */
helpers.strStartsFrom = (string, prefix) => {
    return string.startsWith(prefix);
};

/**
 * Validates user config
 * @param {{[key: string]: any}} config config object
 * @returns 
 */
helpers.validateInputConfig = (config) => {
    const checks = [];

    const isString = (v) => typeof config.merchantLogin === 'string' && v.length > 0;
    
    checks.push(isString(config.merchantLogin) || 'merchantLogin');
    checks.push(isString(config.password1) || 'password1');
    checks.push(isString(config.password2) || 'password2');
    checks.push(isString(config.testPassword1) || 'testPassword1');
    checks.push(isString(config.testPassword2) || 'testPassword2');

    const failedChecks = checks.filter(e => typeof e === 'string');
    
    if (failedChecks.length) {
        throw new Error('Check config params: ' + failedChecks.join(', '));
    }

    return true;
};

export default helpers;