require('dotenv').config();
const rq = require('request-promise');
const fs = require('fs');

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const BUSINESS_NAME = process.env.BUSINESS_NAME;
const BUSINESS_DESCRIPTION = process.env.BUSINESS_DESCRIPTION;
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS;
const BUSINESS_CITY = process.env.BUSINESS_CITY;
const BUSINESS_REGION = process.env.BUSINESS_REGION;
const BUSINESS_POSTAL_CODE = process.env.BUSINESS_POSTAL_CODE;
const BUSINESS_ISO_COUNTRY = process.env.BUSINESS_ISO_COUNTRY;
const CORPORATE_REGISTRY_FILE = process.env.CORPORATE_REGISTRY_FILE;
const POWER_OF_ATTORNEY_FILE = process.env.POWER_OF_ATTORNEY_FILE || '';
const FIRST_NAME=process.env.FIRST_NAME;
const LAST_NAME=process.env.LAST_NAME;
const BIRTH_DATE=process.env.BIRTH_DATE;
const STREET=process.env.STREET;
const CITY=process.env.CITY;
const REGION=process.env.REGION;
const POSTAL_CODE=process.env.POSTAL_CODE;
const ISO_COUNTRY=process.env.ISO_COUNTRY;
const DRIVERS_LICENSE_FILE=process.env.DRIVERS_LICENSE_FILE;
const EMAIL = process.env.EMAIL;

const now = new Date();

let bundleSid = null;   // BUxxxxxx
let addressSid = null;  // ADxxxxxx
let businessAddressSid = null;  // ADxxxxxx
let userSid = null;     // ITxxxxxx
let corporateRegistrySid = null; // RDxxxxxx
let powerOfAttorneySid = null; // RDxxxxxx
let driversLicenseSid = null; // RDxxxxxx

// 法人の住所の作成
const twilioClient = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
twilioClient.addresses.create({
    customerName: `${BUSINESS_NAME}`,
    friendlyName: `${BUSINESS_NAME}`,
    street: BUSINESS_ADDRESS,
    city: BUSINESS_CITY,
    region: BUSINESS_REGION,
    postalCode: BUSINESS_POSTAL_CODE,
    isoCountry: BUSINESS_ISO_COUNTRY,
})
.then(body => {
    businessAddressSid = body.sid;
    console.log(`>>> BusinessAddressSid:${businessAddressSid} created.`);

    // 個人の住所を作成
    return twilioClient.addresses.create({
        customerName: `${LAST_NAME} ${FIRST_NAME}`,
        friendlyName: `${LAST_NAME} ${FIRST_NAME}`,
        street: STREET,
        city: CITY,
        region: REGION,
        postalCode: POSTAL_CODE,
        isoCountry: ISO_COUNTRY,
    });
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
            EndUserType: 'business',
            IsoCountry: 'jp',
            NumberType: 'national',
            FriendlyName: `Business Address Regist at ${now}`,
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
        Type: 'business',
        FriendlyName: `Business End User Regist at ${now}`,
        Attributes: JSON.stringify({
            business_description: BUSINESS_DESCRIPTION,
            business_name: BUSINESS_NAME,
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
    
    // ドキュメントの作成（登記簿謄本）
    const formData = {
        Type: 'corporate_registry',
        MimeType: 'application/pdf',
        Attributes: JSON.stringify({
            address_sids: [ businessAddressSid ],
            first_name: FIRST_NAME,
            last_name: LAST_NAME,
            business_name: BUSINESS_NAME,
            business_description: BUSINESS_DESCRIPTION,
        }),
        FriendlyName: `Corporate Registry Regist at ${now}`,
        File: fs.createReadStream(`./images/${CORPORATE_REGISTRY_FILE}`),
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
    corporateRegistrySid = JSON.parse(body).sid;
    console.log(`>>> CorporateRegistrySid:${corporateRegistrySid} created.`);
    // console.dir(JSON.parse(body));
    
    // ドキュメントの作成（委任状）
    if (POWER_OF_ATTORNEY_FILE.length === 0) {
        // 委任状なしの場合
        return null;
    } else {
        const formData = {
            Type: 'power_of_attorney',
            MimeType: 'application/pdf',
            Attributes: JSON.stringify({
                address_sids: [ businessAddressSid, addressSid ],
                first_name: FIRST_NAME,
                last_name: LAST_NAME,
            }),
            FriendlyName: `Power Of Attorney Regist at ${now}`,
            File: fs.createReadStream(`./images/${POWER_OF_ATTORNEY_FILE}`),
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
    }
})
.then(body => {
    powerOfAttorneySid = body ? JSON.parse(body).sid : '';
    console.log(`>>> PowerOfAttorneySid:${powerOfAttorneySid} created.`);
    // console.dir(JSON.parse(body));
    
    // ドキュメントの作成（運転免許証）
    const formData = {
        Type: 'drivers_license',
        MimeType: 'image/jpeg',
        Attributes: JSON.stringify({
            address_sids: [ addressSid ],
            birth_date: BIRTH_DATE,
            first_name: FIRST_NAME,
            last_name: LAST_NAME,
        }),
        FriendlyName: `Driver's License Regist at ${now}`,
        File: fs.createReadStream(`./images/${DRIVERS_LICENSE_FILE}`),
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
    driversLicenseSid = JSON.parse(body).sid;
    console.log(`>>> DriverLicenseSid:${driversLicenseSid} created.`);
    // console.dir(JSON.parse(body));
    
    // 登記簿謄本のアサイン
    const options = {
        url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}/ItemAssignments`,
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN
        },
        form: {
            ObjectSid: corporateRegistrySid,    // ドキュメント
        },
    };
    return rq(options);
})
.then(body => {
    console.log(`>>> Corporate Registry Assign completed.`);
    // 委任状のアサイン
    if (POWER_OF_ATTORNEY_FILE.length === 0) {
        return null;
    } else {
        const options = {
            url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}/ItemAssignments`,
            method: 'POST',
            auth: {
                user: ACCOUNT_SID,
                password: AUTH_TOKEN
            },
            form: {
                ObjectSid: powerOfAttorneySid,    // ドキュメント
            },
        };
        return rq(options);    
    }
})
.then(body => {
    if (body) console.log(`>>> Power of Attorney Assign completed.`);
    // 運転免許証のアサイン
    const options = {
        url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}/ItemAssignments`,
        method: 'POST',
        auth: {
            user: ACCOUNT_SID,
            password: AUTH_TOKEN
        },
        form: {
            ObjectSid: driversLicenseSid,    // ドキュメント
        },
    };
    return rq(options);
})
.then(body => {
    console.log(`>>> Driver's License Assign completed.`);
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
    console.log(`>>> End User Assign completed.`);

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