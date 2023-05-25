require("dotenv").config();
// const rq = require("request-promise");
const fs = require("fs");

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const NUMBER_TYPE = process.env.NUMBER_TYPE;
const RESELLER = process.env.RESELLER;
const BUSINESS_NAME = process.env.BUSINESS_NAME;
const BUSINESS_DESCRIPTION = process.env.BUSINESS_DESCRIPTION;
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS;
const BUSINESS_CITY = process.env.BUSINESS_CITY;
const BUSINESS_REGION = process.env.BUSINESS_REGION;
const BUSINESS_POSTAL_CODE = process.env.BUSINESS_POSTAL_CODE;
const BUSINESS_ISO_COUNTRY = process.env.BUSINESS_ISO_COUNTRY;
const BUSINESS_FIRST_NAME = process.env.BUSINESS_FIRST_NAME;
const BUSINESS_LAST_NAME = process.env.BUSINESS_LAST_NAME;
const BUNDLE_APPLICATION_FILE = process.env.BUNDLE_APPLICATION_FILE;
const CORPORATE_REGISTRY_FILE = process.env.CORPORATE_REGISTRY_FILE;
const POWER_OF_ATTORNEY_FILE = process.env.POWER_OF_ATTORNEY_FILE || "";
const FIRST_NAME = process.env.FIRST_NAME;
const LAST_NAME = process.env.LAST_NAME;
const BIRTH_DATE = process.env.BIRTH_DATE;
const STREET = process.env.STREET;
const CITY = process.env.CITY;
const REGION = process.env.REGION;
const POSTAL_CODE = process.env.POSTAL_CODE;
const ISO_COUNTRY = process.env.ISO_COUNTRY;
const MYNUMBER_CARD_FILE = process.env.MYNUMBER_CARD_FILE;
const DRIVERS_LICENSE_FILE = process.env.DRIVERS_LICENSE_FILE;
const EMAIL = process.env.EMAIL;

let requestMessage = `
メールの宛先：numbers-regulatory-review@twilio.com
件名：Please review Bundles.
本文：
Hello Twilio Regulatory Compliance Team,

Please review the following Bundles.
Best regards,

`;

const now = new Date();

const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

// サブアカウントをクロール
client.api.v2010.accounts
  .list()
  .then(async (accounts) => {
    for (let account of accounts) {
      if (account.status === "active") await execSubAccount(account);
    }
    console.log(requestMessage);
  })
  .catch((err) => {
    console.error(`*** ERROR ***\n${err}`);
  });

// サブアカウントごとに処理
const execSubAccount = async (account) => {
  console.log(`${account.friendlyName} [${account.sid}]==============`);
  const twilioClient = require("twilio")(account.sid, account.authToken);

  // すでに登録済みのBundlesを確認
  await twilioClient.numbers.v2.regulatoryCompliance.bundles
    .list()
    .then(async (bundles) => {
      // すでにtwilio-approvedのBundleがある場合は処理しない
      let fNoBundles = true;
      bundles.forEach((bundle) => {
        console.log(`${bundle.sid} => ${bundle.status}`);
        if (bundle.status === "twilio-approved") fNoBundles = false;
      });
      if (fNoBundles) await addBundles(twilioClient, account);
    })
    .catch((err) => {
      console.error(`*** ERROR ***\n${err}`);
    });
};

// 新規Bundlesを登録
const addBundles = async (twilioClient, account) => {
  let bundleSid = null; // BUxxxxxx
  let addressSid = null; // ADxxxxxx
  let businessAddressSid = null; // ADxxxxxx
  let userSid = null; // ITxxxxxx
  let bundleApplicationSid = null; // RDxxxxxx
  let corporateRegistrySid = null; // RDxxxxxx
  let powerOfAttorneySid = null; // RDxxxxxx
  let driversLicenseSid = null; // RDxxxxxx
  let myNumberCardSid = null; // RDxxxxxx
  let itemAssignment = null; // BVxxxxxxx
  let formData, options, body;

  try {
    // Create business address
    const businessAddress = await twilioClient.addresses.create({
      customerName: `${BUSINESS_NAME}`,
      friendlyName: `${BUSINESS_NAME}`,
      street: `${BUSINESS_ADDRESS}`,
      city: BUSINESS_CITY,
      region: BUSINESS_REGION,
      postalCode: BUSINESS_POSTAL_CODE,
      isoCountry: BUSINESS_ISO_COUNTRY,
    });
    console.log(`🐞 Business Address created. ${businessAddress.sid}`);
    businessAddressSid = businessAddress.sid;

    // Create user address
    const userAddress = await twilioClient.addresses.create({
      customerName: `${LAST_NAME} ${FIRST_NAME}`,
      friendlyName: `${LAST_NAME} ${FIRST_NAME}`,
      street: STREET,
      city: CITY,
      region: REGION,
      postalCode: POSTAL_CODE,
      isoCountry: ISO_COUNTRY,
    });
    console.log(`🐞 User Address created. ${userAddress.sid}`);
    addressSid = userAddress.sid;

    // Create new Bundle
    const bundle =
      await twilioClient.numbers.v2.regulatoryCompliance.bundles.create({
        endUserType: "business",
        isoCountry: ISO_COUNTRY,
        numberType: NUMBER_TYPE,
        friendlyName: RESELLER === "true" ? "Reseller Bundle" : BUSINESS_NAME,
        email: EMAIL,
      });
    console.log(`🐞 Bundle created. ${bundle.sid}`);
    bundleSid = bundle.sid;

    // Create End-User
    const endUser =
      await twilioClient.numbers.v2.regulatoryCompliance.endUsers.create({
        attributes: {
          business_description: BUSINESS_DESCRIPTION,
          business_name: BUSINESS_NAME,
          birth_date: BIRTH_DATE,
          first_name: FIRST_NAME,
          last_name: LAST_NAME,
        },
        friendlyName: `Business End User at ${now}`,
        type: "business",
      });
    console.log(`🐞 End-User created. ${endUser.sid}`);
    userSid = endUser.sid;

    // Create a Supporting Document with file upload（Corporate Registry）
    formData = {
      type: "corporate_registry",
      mimeType: "application/pdf",
      attributes: JSON.stringify({
        address_sids: [businessAddressSid],
        // first_name: BUSINESS_FIRST_NAME,
        // last_name: BUSINESS_LAST_NAME,
        business_name: BUSINESS_NAME,
        // business_description: BUSINESS_DESCRIPTION,
      }),
      friendlyName: `Corporate Registry at ${now}`,
      file: fs.createReadStream(`./images/${CORPORATE_REGISTRY_FILE}`),
    };
    const corporateRegistry =
      await twilioClient.numbers.v2.regulatoryCompliance.supportingDocuments.create(
        formData,
      );
    corporateRegistrySid = corporateRegistry.sid;
    console.log(
      `🐞 Corporate Registry Document uploaded. ${corporateRegistrySid}`,
    );

    // Create a Supporting Document with file upload（Bundle Application）
    formData = {
      type: "declaration_of_beneficial_ownership",
      mimeType: "application/pdf",
      attributes: JSON.stringify({
        first_name: BUSINESS_FIRST_NAME,
        last_name: BUSINESS_LAST_NAME,
        business_name: BUSINESS_NAME,
      }),
      friendlyName: `Bundle Application at ${now}`,
      file: fs.createReadStream(`./images/${BUNDLE_APPLICATION_FILE}`),
    };
    const bundleApplication =
      await twilioClient.numbers.v2.regulatoryCompliance.supportingDocuments.create(
        formData,
      );
    bundleApplicationSid = bundleApplication.sid;
    console.log(
      `🐞 Bundle Application Document uploaded. ${bundleApplicationSid}`,
    );

    // Create a Supporting Document with file upload (Power of Attorney)
    if (POWER_OF_ATTORNEY_FILE.length !== 0) {
      formData = {
        type: "power_of_attorney",
        mimeType: "application/pdf",
        attributes: JSON.stringify({
          // address_sids: [businessAddressSid, addressSid],
          first_name: FIRST_NAME,
          last_name: LAST_NAME,
        }),
        friendlyName: `Power Of Attorney at ${now}`,
        file: fs.createReadStream(`./images/${POWER_OF_ATTORNEY_FILE}`),
      };
      const powerOfAttorney =
        await twilioClient.numbers.v2.regulatoryCompliance.supportingDocuments.create(
          formData,
        );
      powerOfAttorneySid = powerOfAttorney.sid;
      console.log(
        `🐞 Power of Attorney Document uploaded. ${powerOfAttorneySid}`,
      );
    }

    // Create a Supporting Document with file upload (Driving License)
    formData = {
      type: "drivers_license",
      mimeType: "image/jpeg",
      attributes: JSON.stringify({
        address_sids: [addressSid],
        birth_date: BIRTH_DATE,
        first_name: FIRST_NAME,
        last_name: LAST_NAME,
      }),
      friendlyName: `Driver's License at ${now}`,
      file: fs.createReadStream(`./images/${DRIVERS_LICENSE_FILE}`),
    };
    const driversLicense =
      await twilioClient.numbers.v2.regulatoryCompliance.supportingDocuments.create(
        formData,
      );
    driversLicenseSid = driversLicense.sid;
    console.log(`🐞 Drivers License Document uploaded. ${driversLicenseSid}`);

    // Create a Supporting Document with file upload (MyNumber Card)
    formData = {
      type: "personal_id_card",
      mimeType: "image/jpeg",
      attributes: JSON.stringify({
        birth_date: BIRTH_DATE,
      }),
      friendlyName: `MyNumber Card at ${now}`,
      file: fs.createReadStream(`./images/${MYNUMBER_CARD_FILE}`),
    };
    const myNumberCard =
      await twilioClient.numbers.v2.regulatoryCompliance.supportingDocuments.create(
        formData,
      );
    myNumberCardSid = myNumberCard.sid;
    console.log(`🐞 MyNumber Card Document uploaded. ${myNumberCardSid}`);

    // Assign End-User to a Regulatory Bundle
    itemAssignment = await twilioClient.numbers.regulatoryCompliance
      .bundles(bundleSid)
      .itemAssignments.create({
        objectSid: userSid,
      });
    console.log(`🐞 End-User assigned. ${itemAssignment.sid}`);

    // Assign corporate document to a Regulatory Bundle
    itemAssignment = await twilioClient.numbers.regulatoryCompliance
      .bundles(bundleSid)
      .itemAssignments.create({
        objectSid: corporateRegistrySid,
      });
    console.log(
      `🐞 Corporate Registry Document assigned. ${itemAssignment.sid}`,
    );

    // Assign bundle application document to a Regulatory Bundle
    itemAssignment = await twilioClient.numbers.regulatoryCompliance
      .bundles(bundleSid)
      .itemAssignments.create({
        objectSid: bundleApplicationSid,
      });
    console.log(
      `🐞 Bundle Application Document assigned. ${itemAssignment.sid}`,
    );

    // Assign power of Attorney document to Regulatory Bundle
    if (POWER_OF_ATTORNEY_FILE.length !== 0) {
      itemAssignment = await twilioClient.numbers.regulatoryCompliance
        .bundles(bundleSid)
        .itemAssignments.create({
          objectSid: powerOfAttorneySid,
        });
      console.log(
        `🐞 Power Of Attorney Document assigned. ${itemAssignment.sid}`,
      );
    }

    // Assign driver's license document to a Regulatory Bundle
    itemAssignment = await twilioClient.numbers.regulatoryCompliance
      .bundles(bundleSid)
      .itemAssignments.create({
        objectSid: driversLicenseSid,
      });
    console.log(`🐞 Drivers License Document assigned. ${itemAssignment.sid}`);

    // Assign mynumber card document to a Regulatory Bundle
    itemAssignment = await twilioClient.numbers.regulatoryCompliance
      .bundles(bundleSid)
      .itemAssignments.create({
        objectSid: myNumberCardSid,
      });
    console.log(`🐞 MyNumber Card Document assigned. ${itemAssignment.sid}`);

    // Request a Regulatory Bundle
    // const requestBundle = await twilioClient.numbers.v2.regulatoryCompliance.bundles(bundleSid).update({
    //   status: "pending-review",
    //   friendlyName: `Request at ${now}`,
    // });
    // options = {
    //   url: `https://numbers.twilio.com/v2/RegulatoryCompliance/Bundles/${bundleSid}`,
    //   method: "POST",
    //   auth: {
    //     user: account.sid,
    //     password: account.authToken,
    //   },
    //   form: {
    //     Status: "pending-review",
    //   },
    // };
    // await rq(options);
    // console.log(`🐞 Bundle requested. ${requestBundle.sid}`);
    console.log(`AccountSid: ${account.sid} BundleSid: ${bundleSid}`);
    requestMessage += `
${bundleSid}

    `;
  } catch (err) {
    console.error(`👺 ERROR: ${err}`);
  }
};
