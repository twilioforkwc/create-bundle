require('dotenv').config();
const chai = require("chai");
const fs = require('fs');

describe(".env test", () => {
    it("ACCOUNT_SID", () => {
        chai.assert.lengthOf(process.env.ACCOUNT_SID, 34, 'ACCOUNT_SIDの長さが不正です');
        chai.assert.equal(process.env.ACCOUNT_SID.slice(0,2), 'AC', 'ACCOUNT_SIDの形式が不正です');
    });
    it("AUTH_TOKEN", () => {
        chai.assert.lengthOf(process.env.AUTH_TOKEN, 32, 'AUTH_TOKENの長さが不正です');
    });
    it("EMAIL", () => {
        chai.assert.match(process.env.EMAIL, /.+@.+/, 'EMAILの形式が不正です');
    });
    it("BIRTH_DATE", () => {
        chai.assert.match(process.env.BIRTH_DATE, /^\d{4}-\d{2}-\d{2}$/, 'BIRTH_DATEの形式が不正です');
    });
    it("FIRST_NAME", () => {
        chai.assert.notEqual(process.env.FIRST_NAME.length, 0, 'FIRST_NAMEが空です');
    });
    it("LAST_NAME", () => {
        chai.assert.notEqual(process.env.LAST_NAME.length, 0, 'LAST_NAMEが空です');
    });
    it("IMAGE_FILE_NAME", () => {
        chai.assert.isTrue(fs.existsSync(`./images/${process.env.IMAGE_FILE_NAME}`), '指定した画像ファイルがありません');
    });
    it("STREET", () => {
        chai.assert.notEqual(process.env.STREET.length, 0, 'STREETが空です');
    });
    it("CITY", () => {
        chai.assert.notEqual(process.env.CITY.length, 0, 'CITYが空です');
    });
    it("REGION", () => {
        chai.assert.notEqual(process.env.REGION.length, 0, 'REGIONが空です');
    });
    it("POSTAL_CODE", () => {
        chai.assert.notEqual(process.env.POSTAL_CODE.length, 0, 'POSTAL_CODEが空です');
    });
    it("ISO_COUNTRY", () => {
        chai.assert.lengthOf(process.env.ISO_COUNTRY, 2, 'ISO_COUNTRYの長さが不正です');
    });
});
