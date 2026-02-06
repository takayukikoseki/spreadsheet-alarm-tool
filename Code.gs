/**
 * スプレッドシート未完了アラームツール
 * 
 * 機能概要:
 * E列の日付を監視し、その日付から逆算して10日前、5日前、2日前に指定のメールアドレスへ通知を送ります。
 * シートにある行はすべて「未完了」として扱われます。
 */

// 設定項目
const CONFIG = {
  NOTIFICATION_EMAIL: 'reservation@wakamatuya.co.jp', // 通知先メールアドレス
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
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  
  // 今日の日付の時間を00:00:00にリセット（日付のみの比較のため）
  today.setHours(0, 0, 0, 0);

  // 1行目はヘッダーと仮定して、2行目(インデックス1)からループ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const dateValue = row[CONFIG.DATE_COLUMN_INDEX];

    // E列が日付でない、または空の場合はスキップ
    if (!dateValue || !(dateValue instanceof Date)) {
      continue;
    }

    // E列の日付（期日）を取得し、時間をリセット
    const targetDate = new Date(dateValue);
    targetDate.setHours(0, 0, 0, 0);

    // 日数差を計算
    // 計算式: (E列の期日 - 今日) = 残り日数
    // 例: 期日が12/30で、今日が12/20の場合 → 10日 (つまり今日は期日の10日前)
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
      // 該当しない日数は何もしない
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
  
  // 日付のフォーマット (yyyy/MM/dd)
  const dateString = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy/MM/dd");

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
  
  Logger.log(`メール送信完了: 行${rowNumber} - 残り${daysLeft}日`);
}
