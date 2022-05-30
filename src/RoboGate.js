import crypto from 'crypto';
import url from 'url';

import helpers from './helpers.js';

/**
* @param { Object } config configuration object
* @returns { String } paymentURL
*/
function RoboGate(config) {
    this.config = {
        merchantLogin: config.merchantLogin,
        hashingAlgorithm: config.hashingAlgorithm,

        password1: config.password1,
        password2: config.password2,

        testMode: config.testMode,
        testPassword1: config.testPassword1,
        testPassword2: config.testPassword2,
        
        resultUrlRequestMethod: config.resultUrlRequestMethod,

        paymentUrlTemplate: 'https://auth.robokassa.ru/Merchant/Index.aspx',
        customDataKeyPrefix: 'Shp_', // Custom params must start from Shp, SHP, shp.

        // Required keys for result response from Robokassa
        resultURLKeys: {
            OutSum: true,
            InvId: true,
            SignatureValue: true
        },

        receipt: config.receipt || null
    };

    // Check required keys
    for (let key in this.config) {
        if (this.config[key] === undefined || this.config[key] === '') {
            throw new Error('Missing required key ' + key);
        }
    }

    // TODO: POST result page is not working properly
    if (this.config.resultUrlRequestMethod !== 'GET') {
        throw new Error('Only GET method supported as resultUrlRequestMethod');
    }

    /**
     * Function to generate unique payment URL
     * @param  { Object } options { invSumm, invDescr, invId, invSummCurrency, email, encoding, items, customData }
     * 
     * @return { String } unique payment URL
     */
    this.generatePaymentURL = (options) => {
        // TODO: сделать возможность кастомные настройки чеков передать для этого заказа
        // Defaults for options
        const optionsDefaults = {
            invId: null,
            email: null,
            outSumCurrency: null,
            customData: {}
        };
        
        options = { ...optionsDefaults, ...options };
        
        let params = {
            MerchantLogin: this.config.merchantLogin,
            OutSum: options.invSumm,
            Description: options.invDescr,
            SignatureValue: this.calcURLHash(options.invSumm, this.config.merchantLogin, options),
            Encoding: (options.encoding || 'UTF-8')
        };

        if (this.config.receipt !== null && options.items && options.items.length !== 0) {
            let receipt = new this.Receipt(options.items, this.config.receipt);
            receipt = helpers.convertJSONtoURI(receipt);
            options.receipt = receipt;

            params.Receipt = receipt;
            params.SignatureValue = this.calcURLHash(options.invSumm, this.config.merchantLogin, options);
        };

        // Invoice ID
        if (options.invId) params.InvId = options.invId;

        // User email
        if (options.email) params.Email = options.email;

        // OutSumCurrency
        if (options.invSummCurrency) params.OutSumCurrency = options.invSummCurrency;

        // Enable/Disable test mode
        if (this.config.testMode) params.IsTest = 1;

        // Custom user data
        if (options.customData) {
            for (const [key, value] of Object.entries(options.customData)) {
                let keyRe = this.config.customDataKeyPrefix + key;
                params[keyRe] = value;
            };
        }

        const oUrl = url.parse(this.config.paymentUrlTemplate, true);

        delete oUrl.search;

        oUrl.query = { ...oUrl.query, ...params };

        let output = url.format(oUrl);

        if (output.length > 2048) throw new Error('Final payment URL exceeds limit of 2048 symbols');

        return output;
    };

    /**
     * Generates receipt object that will be converted later
     * @param  { Array } orderItems
     * @param  { Object } receiptConfig
     * @returns { Object } receipt object
     */
    this.Receipt = function(orderItems = [], receiptConfig) {
        if (!receiptConfig) throw new Error('No receiptConfig provided');
        if (!receiptConfig.sno 
            || !receiptConfig.paymentMethod
            || !receiptConfig.paymentObject
            || !receiptConfig.tax
        ) throw new Error('Missing required field in receiptConfig object');

        this.sno = receiptConfig.sno;
        this.items = [];

        orderItems.forEach( el => {
            this.items.push({
                'name': el.name,
                'quantity': el.quantity || 1,
                'sum': el.price * (el.quantity || 1),
                'payment_method': receiptConfig.paymentMethod,
                'payment_object': receiptConfig.paymentObject,
                'tax': receiptConfig.tax
            });
        });
    };

    this.calcURLHash = (invSumm, merchantLogin, options) => {
        // Attention!
        // Do not change order of values pushed
        // Order is strict for generating hash

        let values = [ merchantLogin, invSumm ];

        // Add internal invoice number
        if (options.invId) values.push(options.invId);
        else values.push('');

        // Add data necessary for generating receipt
        if (options.receipt) values.push(options.receipt);

        // Invoice currency (for non-default)
        if (options.invSummCurrency) {
            values.push(options.invSummCurrency);
        }

        // Add either test password or prod password
        if (this.config.testMode === true) values.push(this.config.testPassword1);
        else values.push(this.config.password1);

        // Prepare and add custom params if it is presented
        if (options.customData) {
            let customData = [];

            for (const [key, value] of Object.entries(options.customData)) {
                const customKey = this.config.customDataKeyPrefix + key;
                customData.push(customKey + '=' + value);
            }

            // custom params must be sorted alphabatically
            values = values.concat(customData.sort());
        }

        // Calculate hash
        let outputHash = this.calcHash(values.join(':'), this.config.hashingAlgorithm);

        return outputHash;
    };

    this.calcHash = (value, algorithm) => {
        const hash = crypto.createHash(algorithm);
        hash.update(value);
        
        let output = hash.digest('hex');

        return output;
    };
    /**
     * @param  { Object } req express req object containing either query or body
     * @param  { Object } options
     * @returns { Object } { validated: < Boolean >, details: < String > }
     */
    this.validateResult = (req, options = {}) => {
        let method = (options.requestMethod || this.config.resultUrlRequestMethod);
        method = method.toUpperCase();
    
        // Define result data object based on request method
        let data = {};
        switch (method) {
        case 'GET':
            data = req.query;
            break;
        case 'POST':
            data = req.body;
            break;
        }
    
        // Validating and parsing request
        let values = {};
        try {
            const keys = (this.config.resultURLKeys);
            
            for (const [key, isRequired] of Object.entries(keys)) {
                const value = data[key];

                if (!value && isRequired === true) {
                    throw new Error('Missing required key: ' + key);
                }

                if (value) {
                    const keyRe = helpers.toCamelCase(key);
                    values[keyRe] = value;
                }
            }
        } catch (error) {
            return { validated: false, details: error.message };
        }
    
        // Extracting user data from request
        const customData = {};

        for (const [key, value] of Object.entries(data)) {
            const keyRe = key.toLowerCase();
            if (helpers.strStartsFrom(keyRe, this.config.customDataKeyPrefix.toLowerCase())) {
                customData[key] = value;
            }
        }
    
        let isValid = this.validateResultUrlHash(
            values.signatureValue,
            values.outSum,
            values.invId,
            customData
        );

        if (isValid === true) return { validated: true, details: 'Result hash is valid' };
        else return { validated: false, details: 'Result hash is NOT valid' };
    };

    this.validateResultUrlHash = (hash, outSum, invId, customData) => {
        return (hash.toLowerCase() == this.calculateResultUrlHash(outSum, invId, customData).toLowerCase());
    };
    
    this.calculateResultUrlHash = (outSum, invId, customData) => {
        let values = [outSum];
    
        if (invId) {
            values.push(invId);
        }
        
        if (this.config.testMode === true) values.push(this.config.testPassword2);
        else values.push(this.config.password2);
    
        // Handle custom data
        if (customData) {
            let strings = [];
            
            for (const [key, value] of Object.entries(customData)) {
                strings.push(key + '=' + value);
            };

            values = values.concat(strings.sort());
        }
    
        return this.calcHash(values.join(':'), this.config.hashingAlgorithm);
    };
}

export default RoboGate;