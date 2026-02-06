# GitHubへのアップロード手順

作成したファイルをGitHubに保管するための手順です。

## 手順1: GitHub上でリポジトリ（保管場所）を作る
1. [GitHub](https://github.com/) にログインします。
2. 画面右上にある **[+]** アイコンをクリックし、**[New repository]** を選択します。
3. **Repository name** に名前を入れます（例: `spreadsheet-alarm-tool` など）。
4. **Public**（公開）か **Private**（非公開）を選びます（業務ツールならPrivate推奨）。
5. 下のほうにある **[Create repository]** ボタンをクリックします。
6. 次の画面で表示される URL（`https://github.com/ユーザー名/リポジトリ名.git`）をコピーしておきます。

## 手順2: 自分のパソコンからアップロードする
パソコンの「コマンドプロンプト」または「PowerShell」を使って以下のコマンドを入力します。

※ 以下のコマンドは、私がファイルを保存した場所（`OneDrive\Desktop\Antigravity\予約やり取り管理（共用）未完了アラーム`）で実行することを想定しています。

```powershell
# 1. フォルダに移動
cd "c:\Users\wakam\OneDrive\Desktop\Antigravity\予約やり取り管理（共用）未完了アラーム"

# 2. Gitの初期化
git init

# 3. ファイルを全て登録
git add .

# 4. コミット（保存の確定）
git commit -m "Initial commit: Add GAS code and instructions"

# 5. GitHubの保管場所（リモート）を登録
git remote add origin https://github.com/takayukikoseki/-.git

# 6. アップロード（プッシュ）
git branch -M main
git push -u origin main
```

もし途中でログイン画面が出たら、GitHubのユーザー名とパスワード（またはトークン）を入力してください。
