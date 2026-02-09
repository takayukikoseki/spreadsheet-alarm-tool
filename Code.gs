/**
 * スプレッドシート未完了アラームツール
 */

// 設定項目
const CONFIG = {
  NOTIFICATION_EMAIL: 'reservation@wakamatuya.co.jp', // 通知先メールアドレス
  TARGET_SHEET_NAME: '未完了リスト', // ★ここに対象のシート名を入力してください
  DATE_COLUMN_INDEX: 4, // E列は0始まりで4番目 (A=0, B=1, C=2, D=3, E=4)
  Check_Columns: {
    ID: 0,   // A列
    NAME: 1, // B列
    DATE: 4  // E列
  }
};

/**
 * 未完了タスクを確認してアラームメールを送信するメイン関数
 * トリガー設定で毎日実行するようにしてください。
 */
function checkDeadlinesAndNotify() {
  // アクティブなシートではなく、名前指定でシートを取得するように変更
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(CONFIG.TARGET_SHEET_NAME);

  if (!sheet) {
    Logger.log(`エラー: シート「${CONFIG.TARGET_SHEET_NAME}」が見つかりませんでした。シート名を確認してください。`);
    return;
  }

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1行目はヘッダーと仮定して、2行目(インデックス1)からループ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const dateValue = row[CONFIG.DATE_COLUMN_INDEX];

    // E列が空の場合はスキップ
    if (!dateValue) {
      continue;
    }

    // 日付オブジェクトに変換（文字列の日付も許容するため）
    const targetDate = new Date(dateValue);

    // 有効な日付かどうかのチェック
    if (isNaN(targetDate.getTime())) {
      continue;
    }

    targetDate.setHours(0, 0, 0, 0);

    // 日数差を計算
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // メッセージの決定
    let messageBody = "";
    let subjectPrefix = "";

    if (diffDays === 10) {
      subjectPrefix = "【10日前】";
      messageBody = "再確認等は必要ありませんか？";
    } else if (diffDays === 5) {
      subjectPrefix = "【5日前】";
      messageBody = "もう一度確認しましょう";
    } else if (diffDays === 2) {
      subjectPrefix = "【2日前】";
      messageBody = "最終確認は出来てますか？";
    } else {
      continue;
    }

    // メール送信実行
    sendNotificationEmail(row, diffDays, subjectPrefix, messageBody, i + 1);
  }
}

/**
 * メール送信処理
 */
function sendNotificationEmail(row, daysLeft, subjectPrefix, customMessage, rowNumber) {
  const id = row[CONFIG.Check_Columns.ID];
  const name = row[CONFIG.Check_Columns.NAME];
  const dateObj = row[CONFIG.Check_Columns.DATE];
  
  const validDateObj = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
  const dateString = Utilities.formatDate(validDateObj, Session.getScriptTimeZone(), "yyyy/MM/dd");

  const subject = `${subjectPrefix} 未完了タスクのアラーム通知`;
  
  const body = `
${customMessage}

【対象データ】
--------------------------------------------------
行番号: ${rowNumber}
ID (A列): ${id}
名前 (B列): ${name}
期日 (E列): ${dateString}
--------------------------------------------------

※このメールはGoogleスプレッドシートから自動送信されています。
残り日数: ${daysLeft}日
`;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: body
  });
}
