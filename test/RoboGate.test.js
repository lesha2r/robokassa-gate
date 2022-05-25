import RoboGate from '../src/RoboGate.js';

let roboGateConfig = {
    merchantLogin: 'myshop',
    hashingAlgorithm: 'md5',
    password1: '000',
    password2: '999',
    testMode: true,
    testPassword1: '123',
    testPassword2: '456',
    resultUrlRequestMethod: 'GET',
    paymentUrlTemplate: 'https://auth.robokassa.ru/Merchant/Index.aspx',
    debug: false,
    customDataPrefix: 'Shp_',
    receipt: {
        sno: 'usn_income',
        paymentMethod: 'full_payment',
        paymentObject: 'service',
        tax: 'none'
    }
};

test('Config object missing passwords throws error', () => {
    let config = { ...roboGateConfig };
    config.password1 = '';
    config.password2 = undefined;

    expect(() => new RoboGate(config)).toThrow();
});

test('Config object missing hashing method throws error', () => {
    let config = { ...roboGateConfig };
    config.hashingAlgorithm = undefined;
    expect(() => new RoboGate(config)).toThrow();
});

test('Receipt returns expected result', () => {
    const testRoboGate = new RoboGate(roboGateConfig);
    const products = [{ name: 'Product 1', quantity: 2, price: 2401 },{ name: 'Product 2', price: 2404 }];
    const expectedResult = {
        sno: 'usn_income',
        items: [
            {
                name: 'Product 1',
                quantity: 2,
                sum: 4802,
                payment_method: 'full_payment',
                payment_object: 'service',
                tax: 'none'
            },
            {
                name: 'Product 2',
                quantity: 1,
                sum: 2404,
                payment_method: 'full_payment',
                payment_object: 'service',
                tax: 'none'
            }
        ]
    };

    expect(new testRoboGate.Receipt(products, roboGateConfig.receipt)).toEqual(expectedResult);
});

