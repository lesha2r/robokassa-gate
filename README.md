JavaScript API integration for Robokassa payment system

# Features
Everything for quick payment integration:
* Generates signed payment link
* Validates payment result
* Supports receipts
* Supports test mode (including test payments)

# Getting started
## Install package using NPM
```
npm i robokassa-gate
```

## Create Robokassa gate object 
```
import RoboGate from './src/RoboGate.js';

// Create config object
const config = {
    merchantLogin: 'myshopname',
    hashingAlgorithm: 'md5',
    password1: 'qwerty0123456789',
    password2: 'asdfgh0987654321',
    testMode: true,
    testPassword1: 'zxcvbn12345689',
    testPassword2: 'mnbvcx987654321',
    resultUrlRequestMethod: 'GET', // !ONLY ACCEPTED METHOD FOR NOW
    receipt: {
        sno: "usn_income",
        paymentMethod: "full_payment",
        paymentObject: "service",
        tax: "none"
    }
};

// Robokassa instance
const robokassa = new RoboGate(config);
```

## Generate payment link
```
// Generate payment URL link
let newOrderURL = robokassa.generatePaymentURL({
    invId: 1,
    invSumm: 700,
    invDescr: 'test payment',
    email: 'example@email.com',
    isTest: true,
    items: [{ name: 'Product 1', quantity: 2, price: 200 },{ name: 'Product 2', price: 300 }],
    customData: {
        'any key': 'custom note'
    }
});
```

## Validate payment result response
```
// Express example

app.get('/payment-result/', (req, res) => {
    const isPaymentValidated = robokassa.validateResult(req);

    if (isPaymentValidated) {
        // ... any logic for succeed validation
    } else {
        // ... any logic if payment validation fails
    }
})

```

# TODOs
- [ ] Handle POST method for payment result notifications

# Official Robokassa docs
See more on https://docs.robokassa.ru/