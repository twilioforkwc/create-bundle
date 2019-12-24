require('dotenv').config();
const rq = require('request-promise');

const options = {
    url: 'https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles',
    method: 'GET',
    auth: {
        user: process.env.ACCOUNT_SID,
        password: process.env.AUTH_TOKEN,
    },
};

rq(options)
.then(body => {
    console.dir(JSON.parse(body));
})
.catch(err => {
    console.error(err);
})