require('dotenv').config();

const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const deleteSubAccount = async (accounts) => {
  try {
    accounts.map(async (account) => {
      await client.api.v2010.accounts(account).update({
        status: 'closed',
      });
      console.log(`🐞 ${account} deleted.`);
    });
  } catch (err) {
    console.error(
      `👺 ERROR: in deleteSubAccount: ${err.message ? err.message : err}`,
    );
    throw err;
  }
};

const createSubAccount = async (num) => {
  const accounts = [];
  try {
    for (let idx = 0; idx < num; idx++) {
      const account = await client.api.v2010.accounts.create({
        friendlyName: `チーム${alphabets[idx]}`,
      });
      console.log(`${account.sid} created.`);
      accounts.push(account.sid);
    }
    return accounts;
  } catch (err) {
    console.error(
      `👺 ERROR: in createSubAccount: ${err.message ? err.message : err}`,
    );
    throw err;
  }
};

const Proc = () => {
  readline.question(
    'いくつサブアカウントを作成しますか？（最大26まで） ',
    async (answer) => {
      if (isNaN(answer) || answer > 26) {
        Proc();
      } else {
        console.log(`🐞 サブアカウントを${answer}個作成します。`);
        const accounts = await createSubAccount(answer);
        // await deleteSubAccount(accounts);
        readline.close();
      }
    },
  );
};

Proc();
