import helpers from '../src/helpers.js';

let JSONtoURI = {
    sample: {
        sno: 'usn_income',
        items: [
            {
                name: 'test',
                quantity: 1,
                sum: 100,
                payment_method: 'full_payment',
                payment_object: 'service',
                tax: 'none'
            }
        ]
    },
    expected: '%7B%22sno%22%3A%22usn_income%22%2C%22items%22%3A%5B%7B%22name%22%3A%22test%22%2C%22quantity%22%3A1%2C%22sum%22%3A100%2C%22payment_method%22%3A%22full_payment%22%2C%22payment_object%22%3A%22service%22%2C%22tax%22%3A%22none%22%7D%5D%7D'
};

test('JSON to be converted to encoded URI string', () => {
    expect(helpers.convertJSONtoURI(JSONtoURI.sample)).toBe(JSONtoURI.expected);
});

test('White spaced string to become camelcased', () => {
    expect(helpers.toCamelCase('camel case str')).toBe('camelCaseStr');
});

test('Camel cased string to remain camelcased', () => {
    expect(helpers.toCamelCase('camelCaseStr')).toBe('camelCaseStr');
});

test('Camel cased string with first char uppered to become camelcased', () => {
    expect(helpers.toCamelCase('CamelCaseStr')).toBe('camelCaseStr');
});

test('String started with specified prefix returns true', () => {
    expect(helpers.strStartsFrom('Shp_anything', 'Shp_')).toBe(true);
});

test('Config validation helper works as expected', () => {
    // config.merchantLogin === 'string' || 'merchantLogin');
    // checks.push(typeof config.password1 === 'string' || 'password1');
    // checks.push(typeof config.password2 === 'string' || 'password2');
    // checks.push(typeof config.testMode === 'boolean' || 'testMode');
    // checks.push(typeof config.testPassword1 === 'string' || 'testPassword1');
    // checks.push(typeof config.testPassword2
    const okConfig = {
        merchantLogin: 'test',
        password1: '111',
        password2: '333',
        testMode: true,
        testPassword1: '444',
        testPassword2: '555'
    };
    
    const badConfig1 = {
        merchantLogin: '',
        password1: '',
        password2: '',
        testMode: true,
        testPassword1: '',
        testPassword2: ''
    };

    const badConfig2 = {
        merchantLogin: '',
        password1: '',
        password2: '',
        testPassword1: '',
        testPassword2: ''
    };

    expect(helpers.validateInputConfig(okConfig)).toBe(true);
    expect(() => helpers.validateInputConfig(badConfig1)).toThrow('Check config params: merchantLogin, password1, password2, testPassword1, testPassword2');
    expect(() => helpers.validateInputConfig(badConfig2)).toThrow('Check config params: merchantLogin, password1, password2, testPassword1, testPassword2');
});