require('dotenv').config();
const chai = require("chai");
const assert = chai.assert;
const fs = require('fs');
const client = require('twilio')(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN);

describe(".env test", () => {
    it("ACCOUNT_SID", () => {
        assert.lengthOf(process.env.ACCOUNT_SID, 34, 'ACCOUNT_SIDの長さが不正です');
        assert.equal(process.env.ACCOUNT_SID.slice(0,2), 'AC', 'ACCOUNT_SIDの形式が不正です');
    });
    it("AUTH_TOKEN", () => {
        assert.lengthOf(process.env.AUTH_TOKEN, 32, 'AUTH_TOKENの長さが不正です');
    });
    it("API Call", async () => {
        await client.api.accounts(process.env.ACCOUNT_SID).fetch()
        .then(account => {
            assert.strictEqual(account.status, 'active', 'アカウントがアクティブではありません');
        })
        .catch(err => {
            throw (`API Call failed. ${err}`);
        });
    });
    it("EMAIL", () => {
        assert.match(process.env.EMAIL, /.+@.+/, 'EMAILの形式が不正です');
    });
    it("BIRTH_DATE", () => {
        assert.match(process.env.BIRTH_DATE, /^\d{4}-\d{2}-\d{2}$/, 'BIRTH_DATEの形式が不正です');
    });
    it("FIRST_NAME", () => {
        assert.notEqual(process.env.FIRST_NAME.length, 0, 'FIRST_NAMEが空です');
    });
    it("LAST_NAME", () => {
        assert.notEqual(process.env.LAST_NAME.length, 0, 'LAST_NAMEが空です');
    });
    it("STREET", () => {
        assert.notEqual(process.env.STREET.length, 0, 'STREETが空です');
    });
    it("CITY", () => {
        assert.notEqual(process.env.CITY.length, 0, 'CITYが空です');
    });
    it("REGION", () => {
        assert.notEqual(process.env.REGION.length, 0, 'REGIONが空です');
    });
    it("POSTAL_CODE", () => {
        assert.lengthOf(process.env.POSTAL_CODE, 7, 'POSTAL_CODEの長さが不正です');
    });
    it("ISO_COUNTRY", () => {
        assert.lengthOf(process.env.ISO_COUNTRY, 2, 'ISO_COUNTRYの長さが不正です');
    });
    it("BUSINESS_NAME", () => {
        assert.notEqual(process.env.BUSINESS_NAME.length, 0, 'BUSINESS_NAMEが空です');
    });
    it("BUSINESS_DESCRIPTION", () => {
        assert.notEqual(process.env.BUSINESS_DESCRIPTION.length, 0, 'BUSINESS_DESCRIPTIONが空です');
    });
    it("BUSINESS_ADDRESS", () => {
        assert.notEqual(process.env.BUSINESS_ADDRESS.length, 0, 'BUSINESS_ADDRESSが空です');
    });
    it("BUSINESS_CITY", () => {
        assert.notEqual(process.env.BUSINESS_CITY.length, 0, 'BUSINESS_CITYが空です');
    });
    it("BUSINESS_REGION", () => {
        assert.notEqual(process.env.BUSINESS_REGION.length, 0, 'BUSINESS_REGIONが空です');
    });
    it("BUSINESS_POSTAL_CODE", () => {
        assert.lengthOf(process.env.BUSINESS_POSTAL_CODE, 7, 'BUSINESS_POSTAL_CODEの長さが不正です');
    });
    it("BUSINESS_ISO_COUNTRY", () => {
        assert.lengthOf(process.env.BUSINESS_ISO_COUNTRY, 2, 'BUSINESS_ISO_COUNTRYの長さが不正です');
    });
    it("CORPORATE_REGISTRY_FILE", () => {
        assert.isTrue(fs.existsSync(`./images/${process.env.CORPORATE_REGISTRY_FILE}`), '指定した登記簿謄本のファイルがありません');
    });
    if (process.env.POWER_OF_ATTORNEY_FILE.length > 0) {
        it("POWER_OF_ATTORNEY_FILE", () => {
            assert.isTrue(fs.existsSync(`./images/${process.env.POWER_OF_ATTORNEY_FILE}`), '指定した委任状のファイルがありません');
        });
    }
    it("DRIVERS_LICENSE_FILE", () => {
        assert.isTrue(fs.existsSync(`./images/${process.env.DRIVERS_LICENSE_FILE}`), '指定した免許証ファイルがありません');
    });
});
