# Bundle 登録プログラム サプアカウント対応

このプログラムは、Twilio Japan に対して、Bundle の登録を自動化するものです。  
マスターアカウントの AccountSid、AuthToken を設定していただければ、保有しているサブアカウント（マスターを含む）を自動的にクロールして、Bundles がないすべてのサブアカウントに登録します。  
**[注意]**  
すでに承認されている Bundles があるサブアカウントには登録をしません。

## 前提条件

本プログラム以下の条件でのみ動作します。

- 法人での申請
- 必要な書類を用意してあること
- Node.js がインストールされていること

必要書類については、[こちらの記事](https://qiita.com/mobilebiz/items/83eba66e7ed9ca339501)を確認してください。個人の証明書には、運転免許証とマイナンバーカードの組み合わせにのみ対応しています（パスポートは非対応）。  
なお、本プログラムはリセラー事業者にも対応しています。

## 準備

- Bundle 申請書を**PDF 形式**で準備してください。リセラーとして申請する場合は、申請書の最後に TNUP をマージしておいてください。TNUP については、[こちらの記事](https://qiita.com/mobilebiz/items/c63e9ca4f102bc46cf25)を参考にしてください。
- 謄本ならびに委任状（必要な場合のみ）を**PDF 形式**で準備してください（サイズは 5MB 以内）。謄本は発行日から 6 ヶ月以内のものに限ります。
- 申請者の運転免許証のコピー、ならびにマイナンバーカード（表面のみ）のコピーを**JPEG 形式**で準備してください（サイズは 5MB 以内）。 スマホのカメラで撮影したものでも大丈夫ですが、免許証やマイナンバーカードのみが写るように周りの画像は削除してください。

## インストール

適当なフォルダに移動し、GitHub リポジトリを取得します。

```sh
git clone https://github.com/twilioforkwc/create-bundle.git
cd bundle-create
npm install
mv .env.example .env
```

Bundle 申請書、謄本、委任状（必要な場合）、運転免許証、マイナンバーカードの各ファイルを、images フォルダにコピーしておきます。  
`.env`ファイルをエディタで開き、以下の項目をすべて申請者の内容に置き換えます。

| 項目名                   | 内容                                                                                                                   |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| ACCOUNT_SID              | Twilio アカウントのマスターアカウントの AccountSid（AC から始まる文字列）                                              |
| AUTH_TOKEN               | AccountSid に対応する AuthToken                                                                                        |
| NUMBER_TYPE              | national もしくは toll-free を指定                                                                                     |
| RESELLER                 | リセラーとして申請をだすには、true、通常の申請は false のまま                                                          |
| BUSINESS_NAME            | 登記簿謄本に記載されいている商号を記載通りに（社名に「・」が入っている場合は、API がエラーを出すので削除してください） |
| BUSINESS_DESCRIPTION     | 登記簿謄本に記載されいている事業内容の該当する部分を記載通りに                                                         |
| BUSINESS_ADDRESS         | 登記簿謄本に記載されている本店住所の町村名と丁目番地を記載されている通りに（例：大手町一丁目１番地１号）               |
| BUSINESS_CITY            | 登記簿謄本に記載されている本店住所の市区名を記載されている通りに（例：千代田区）                                       |
| BUSINESS_REGION          | 登記簿謄本に記載されている都道府県名を記載されている通りに（例：東京都）                                               |
| BUSINESS_POSTAL_CODE     | 会社の郵便番号をハイフンなしで（例：1000001）                                                                          |
| BUSINESS_ISO_COUNTRY     | 会社の住所が日本の場合は JP のままで                                                                                   |
| BUNDLE_APPLICATION_FILE  | Bundle 申請書の PDF ファイル（リセラーの場合は、最後に TNUP をマージすることを忘れずに）                               |
| CORPORATE＿REGISTRY_FILE | 登記簿謄本の PDF ファイル名                                                                                            |
| POWER_OF_ATTORNEY_FILE   | 委任状の PDF ファイル名（なしの場合は未指定）                                                                          |
| FIRST_NAME               | 申請者の名前（名）を免許証に記載されている通りに（日本語 OK）                                                          |
| LAST_NAME                | 申請者の名前（姓）を免許証に記載されている通りに（日本語 OK）                                                          |
| BIRTH_DATE               | 申請者の誕生日を YYYY-MM-DD 形式で                                                                                     |
| STREET                   | 住所（町丁目と建物名）を免許証に記載されている通りに                                                                   |
| CITY                     | 住所（市区町村）を免許証に記載されている通りに                                                                         |
| REGION                   | 住所（都道府県）を免許証に記載されている通りに                                                                         |
| POSTAL_CODE              | 郵便番号をハイフンなしで                                                                                               |
| ISO_COUNTRY              | 日本の場合は JP のままで                                                                                               |
| DRIVERS_LICENSE_FILE     | 免許証の画像ファイル名（拡張子は.jpg）                                                                                 |
| MYNUMBER_CARD_FILE       | マイナンバーカードの画像ファイル名（拡張子は.jpg）                                                                     |
| EMAIL                    | 申請者のメールアドレス（審査結果が通知されます）                                                                       |

## プログラムの実行

```sh
npm start

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
管理コンソールにログインし、電話番号 > Regulatory Complience > Bundles を確認し、STATUS が`Pending Review`になっていることを確認しましょう。
あとは審査を待つだけです。作成された Bundle を早く確認してもらうためには、`numbers-regulatory-review@twilio.com`にメールを出すことをおすすめします。そのための文面が最後に表示されるので、そちらを使うとよいでしょう。

審査が通れば上記 STATUS が`Twilio Approved`になります。
