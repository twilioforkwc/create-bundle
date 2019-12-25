# BundleSid登録プログラム

このプログラムは、Twilio（KWCアカウント）におけるBundleSidの登録を自動化するものです。
以下の条件でのみ動作します。

- 個人での申請（法人申請には対応していません）
- 運転免許証による書類提出（免許証以外には対応していません）
- Node.js（バージョン8以降）がインストールされていること

## 準備

まずは運転免許証のコピーを**JPEG形式**で準備してください（サイズは5MB以内）。  
スマホのカメラで撮影したものでも大丈夫ですが、免許証のみが写るように周りの画像は削除してください。

## インストール

適当なフォルダに移動し、リポジトリを取得します。

```
$ git clone https://github.com/twilioforkwc/create-bundle.git
$ cd bundle-create
$ npm install
$ mv .env.example .env
```

運転免許証の画像ファイルを、imagesフォルダにコピーしておきます。  
`.env`ファイルをエディタで開き、以下の項目をすべてご自分の内容に置き換えます。

|項目名|内容|
|:--|:--|
|ACCOUNT_SID|TwilioアカウントのAccountSid（ACから始まる文字列）|
|AUTH_TOKEN|AccountSidに対応するAuthToken|
|EMAIL|ご自分のメールアドレス（審査結果が通知されます）|
|BIRTH_DATE|ご自分の誕生日をYYYY-MM-DD形式で|
|FIRST_NAME|名前（名）を免許証に記載されている通りに|
|LAST_NAME|名前（姓）を免許証に記載されている通りに|
|IMAGE_FILE_NAME|免許証の画像ファイル名|
|STREET|住所（町丁目と建物名）を免許証に記載されている通りに|
|CITY|住所（市区町村）を免許証に記載されている通りに|
|REGION|住所（都道府県）を免許証に記載されている通りに|
|POSTAL_CODE|郵便番号をハイフンなしで|
|ISO_COUNTRY|日本の場合はJPのままで|

## プログラムの実行

```
$ npm start

...最初にテストコードが走って`.env`の内容をチェックします。
...テストがすべてPASSすると申請が始まります。

>>> AddressSid:ADf5bfb33ca656b88905c8e9827428f2ff created.
>>> BundleSid:BUf7e15df42d83dfc5697f1adb1bcef793 created.
>>> UserSid:IT9111cd08fbd6c31ae2914dd811327b09 created.
>>> DocumentSid:RDadd732e4cbb99d0034f7dea093f48df9 created.
>>> Assign completed.
>>> Submitted.
```

上記のように`Submitted.`が表示されれば成功です。  
管理コンソールにログインし、電話番号 > Regulatory Complience > Bundlesを確認し、STATUSが`Pending Review`になっていることを確認しましょう。

