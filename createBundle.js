require('dotenv').config();
const rq = require('request-promise');
const fs = require('fs');

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const EMAIL = process.env.EMAIL;
const BIRTH_DATE=process.env.BIRTH_DATE;
const FIRST_NAME=process.env.FIRST_NAME;
const LAST_NAME=process.env.LAST_NAME;
const IMAGE_FILE_NAME=process.env.IMAGE_FILE_NAME;
const STREET=process.env.STREET;
const CITY=process.env.CITY;
const REGION=process.env.REGION;
const POSTAL_CODE=process.env.POSTAL_CODE;
const ISO_COUNTRY=process.env.ISO_COUNTRY;

const now = new Date();

let bundleSid = null;   // BUxxxxxx
let addressSid = null;  // ADxxxxxx
let userSid = null;     // ITxxxxxx
let documentSid = null; // RDxxxxxx

// 住所の作成
const twilioClient = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
twilioClient.addresses.create({
    customerName: `${LAST_NAME} ${FIRST_NAME}`,
    friendlyName: `${LAST_NAME} ${FIRST_NAME}`,
    street: STREET,
    city: CITY,
    region: REGION,
    postalCode: POSTAL_CODE,
    isoCountry: ISO_COUNTRY,
})
.then(body => {
    addressSid = body.sid;
    console.log(`>>> AddressSid:${addressSid} created.`);

    // Bundleオブジェクトの作成
    const options = {
        url: 'https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles',
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN,
        },
        form: {
            EndUserType: 'individual',
            IsoCountry: 'jp',
            NumberType: 'national',
            FriendlyName: `Auto Regist at ${now}`,
            Email: EMAIL,
        },
    };
    return rq(options);
})
.then(body => {
    bundleSid = JSON.parse(body).sid;
    console.log(`>>> BundleSid:${bundleSid} created.`);
    // console.dir(JSON.parse(body));

    // エンドユーザの作成
    const formData = {
        Type: 'individual',
        FriendlyName: `Auto Regist at ${now}`,
        Attributes: JSON.stringify({
            birth_date: BIRTH_DATE,
            first_name: FIRST_NAME,
            last_name: LAST_NAME,
        }),
    };
    
    const options = {
        url: 'https://numbers.twilio.com/v2/RegulatoryCompliance/EndUsers',
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN,
        },
        formData: formData,
    };
    return rq(options);
})
.then(body => {
    userSid = JSON.parse(body).sid;
    console.log(`>>> UserSid:${userSid} created.`);
    // console.dir(JSON.parse(body));
    
    // ドキュメントの作成
    const formData = {
        Type: 'drivers_license',
        MimeType: 'image/jpeg',
        Attributes: JSON.stringify({
            address_sids: [ addressSid ],
            birth_date: BIRTH_DATE,
            first_name: FIRST_NAME,
            last_name: LAST_NAME,
        }),
        FriendlyName: `Auto Regist at ${now}`,
        File: fs.createReadStream(`./images/${IMAGE_FILE_NAME}`),
    };
    
    const options = {
        url: 'https://numbers-upload.twilio.com/v2/RegulatoryCompliance/SupportingDocuments',
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN,
        },
        formData: formData,
    };
    
    return rq(options);
})
.then(body => {
    documentSid = JSON.parse(body).sid;
    console.log(`>>> DocumentSid:${documentSid} created.`);
    // console.dir(JSON.parse(body));
    
    // ドキュメントのアサイン
    const options = {
        url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}/ItemAssignments`,
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN
        },
        form: {
            ObjectSid: documentSid,    // ドキュメント
        },
    };
    return rq(options);
})
.then(body => {
    // ユーザのアサイン
    const options = {
        url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}/ItemAssignments`,
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN
        },
        form: {
            ObjectSid: userSid,    // ユーザ
        },
    };
    return rq(options);
})
.then(body => {
    console.log(`>>> Assign completed.`);

    // 申請
    const options = {
        url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}`,
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN,
        },
        form: {
            Status: 'pending-review',
        },
    };
    return rq(options);
})
.then(body => {
    console.log(`>>> Submitted.`);
})
.catch(err => {
    console.error(err);
});