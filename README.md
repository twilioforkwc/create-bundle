# BundleSid登録プログラム（法人編）アカウントクロール対応

このプログラムは、Twilio（KWCアカウント）におけるBundleSidの登録を自動化するものです。
マスターアカウントのAccoutSid、AuthTokenを設定していただければ、保有しているサブアカウント（マスターを含む）を自動的にクロールして、Bundlesがないすべてのサブアカウントに登録します。
すでにApprovedされているBundlesがあるサブアカウントには登録をしません。

法人でのBundleSidの登録には、パターンが２種類あります。

## パターン１　代表者が申請作業を行うケース

会社の登記簿謄本に**名前が記載されている**方が申請を行うケースです。
謄本に加えて、この方の身分証明書が必要です。

## パターン２　担当者が申請作業を行うケース

会社の登記簿謄本に**名前が記載されていない**方が申請を行うケースです。
謄本に加えて、申請者の身分証明書と会社が発行した**委任状が必要**です。

委任状については、[こちら](https://skillful-pancake-7200.twil.io/assets/PowerOfAttorneyTemplate.docx)にひな形を用意してあるので、別途ダウンロードして記載してください。
記載の際の注意点は、以下のとおりです。
![委任状説明.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/86046/7ae544d1-6dd7-8158-47b3-a753e3549b28.png)

本プログラム以下の条件でのみ動作します。

- 法人での申請
- 会社証明書類として登記簿謄本（全部事項証明書）を用意してあること
- 謄本に記載のない担当者が申請をする場合には、委任状を用意すること
- 申請者の運転免許証を用意してあること
- Node.js（バージョン8以降）がインストールされていること


## 準備

- 謄本ならびに委任状（必要な場合のみ）を**PDF形式**で準備してください。複数枚に渡る場合は、5MB以内であれば１つのファイルにまとめても大丈夫です。
- 申請者の運転免許証のコピーを**JPEG形式**で準備してください（サイズは5MB以内）。  スマホのカメラで撮影したものでも大丈夫ですが、免許証のみが写るように周りの画像は削除してください。

## インストール

適当なフォルダに移動し、GitHubリポジトリを取得します（法人用のブランチを利用します）。

```
$ git clone -b create-bundle-business-subaccounts https://github.com/twilioforkwc/create-bundle.git
$ cd bundle-create
$ npm install
$ mv .env.example .env
```

謄本、委任状、運転免許証の各ファイルを、imagesフォルダにコピーしておきます。  
`.env`ファイルをエディタで開き、以下の項目をすべて申請者の内容に置き換えます。

|項目名|内容|
|:--|:--|
|ACCOUNT_SID|TwilioアカウントのマスターアカウントのAccountSid（ACから始まる文字列）|
|AUTH_TOKEN|AccountSidに対応するAuthToken|
|NUMBER_TYPE|nationalもしくはtoll-freeを指定|
|BUSINESS_NAME|登記簿謄本に記載されいている商号を記載通りに（社名に「・」が入っている場合は、APIがエラーを出すので削除してください）|
|BUSINESS_DESCRIPTION|登記簿謄本に記載されいている会社法人等番号を記載通りに|
|BUSINESS_ADDRESS|登記簿謄本に記載されている本店住所の町村名と丁目番地を記載されている通りに（例：大手町一丁目１番地１号）|
|BUSINESS_CITY|登記簿謄本に記載されている本店住所の市区名を記載されている通りに（例：千代田区）|
|BUSINESS_REGION|登記簿謄本に記載されている都道府県名を記載されている通りに（例：東京都）|
|BUSINESS_POSTAL_CODE|会社の郵便番号をハイフンなしで（例：1000001）|
|BUSINESS_ISO_COUNTRY|会社の住所が日本の場合はJPのままで|
|CORPORATE＿REGISTRY_FILE|登記簿謄本のPDFファイル名|
|POWER_OF_ATTORNEY_FILE|委任状のPDFファイル名（なしの場合は未指定）|
|FIRST_NAME|申請者の名前（名）を免許証に記載されている通りに（日本語OK）|
|LAST_NAME|申請者の名前（姓）を免許証に記載されている通りに（日本語OK）|
|BIRTH_DATE|申請者の誕生日をYYYY-MM-DD形式で|
|STREET|住所（町丁目と建物名）を免許証に記載されている通りに|
|CITY|住所（市区町村）を免許証に記載されている通りに|
|REGION|住所（都道府県）を免許証に記載されている通りに|
|POSTAL_CODE|郵便番号をハイフンなしで|
|ISO_COUNTRY|日本の場合はJPのままで|
|DRIVERS_LICENSE_FILE|免許証の画像ファイル名|
|EMAIL|申請者のメールアドレス（審査結果が通知されます）|

## プログラムの実行

```
$ npm start

...最初にテストコードが走って`.env`の内容をチェックします。
...テストがすべてPASSすると申請が始まります。

>>> AddressSid:ADaf7ab6216031b81e4ecce80aa3111a56 created.
>>> BundleSid:BUefb9be077dfbcca5310ecd8a431d7a09 created.
>>> UserSid:ITff4c56fed982f24322245263db52464a created.
>>> CorporateRegistrySid:RDe948ef6f563611e18c2390845d28cfd9 created.
>>> PowerOfAttorneySid:RDd5aabe1a69d6a7edcc8c1a976537d3ff created.
>>> DriverLicenseSid:RD0e0696679d5fdbb902cc02ff6bcf561c created.
>>> Corporate Registry Assign completed.
>>> Power of Attorney Assign completed.
>>> Driver's License Assign completed.
>>> End User Assign completed.
>>> Submitted.
```

上記のように`Submitted.`が表示されれば成功です。  
管理コンソールにログインし、電話番号 > Regulatory Complience > Bundlesを確認し、STATUSが`Pending Review`になっていることを確認しましょう。
あとは審査を待つだけです。
しばらくすると（３営業日以内）に、Twilioからメールが届きますので、審査が通れば上記STATUSが`Twilio Approved`になります。
