//discord.jsライブラリをインポート
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
//pingライブラリをインポート
const ping = require('ping');
//google検索ライブラリをインポート
const googleIt = require('google-it');
//つべ検索ライブラリインポート
const ytSearch = require('yt-search');
//wikipediaライブラリをインポート
const wiki = require('wikipedia');

// Client インスタンス作成　botが受信するイベントの種類を指定する
const client = new Client({
    intents: [
        GatewayIntentBits.Gulids,  //鯖関連のイベントを受信
        GatewayIntentBits.GulidMessages,//鯖内のメッセージ関連イベントを受信
        GatewayIntentBits.MessageContent//メッセージの内容を取得
    ]
}
);
//botが起動し、準備完了したときに一度だけ呼ばれるイベント
client,once('ready', () => {
    console.log(`${client.user.tag}としてログインしました`);

});

//ユーザーがメッセージを送信したときに呼ばれるイベント
client.on('messageCreate',message => {
//bot自身や他のbotのメッセージには反応しないようにする
if(message.author.bot) return;

  // メッセージが~~(プレフィックス)で始まっていなければ無視
  if (!message.content.startsWith(PREFIX)) return;

  // プレフィックスを除去して、コマンドと引数を分割
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase(); // コマンド部分（小文字に変換）
 
  // コマンドごとの処理を分岐
  //help
 if (command === 'help') {
    //helpのめっさげ
    message.channel.send(
        "オッスオッスこれはヘルプだゾ\n"+
        "ババアのナス　ババナス\n"+
        "以下がORESAMAが頑張って作ったコマンド一覧だゾ\n"+
        "help: helpはhelpだゾ\n"+
        "ping: pingを打つだけ\n"+
        "ggrks: ググれるよ\n"+
        "userinfo: ユーザー情報が調べられるよ\n"+
        "serverinfo: サーバー情報が調べられるよ\n"+
        "youtube: つべ検索が使えるよ\n"+
        "wiki: ウィキれるよ\n"
    );

    //ping
}else if(command === 'ping') {
      // 引数が指定されていない場合は使い方を返信
      if (!args.length) {
        return message.channel.send("URL入力してちょ");
      }
       
    let targetUrl = args[0];
    
    // URLが http:// または https:// で始まっていなければ、便宜上 http:// を付加
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }
     
    // 対象URLのプロトコルに応じてモジュールを選択
    const protocol = targetUrl.startsWith('https://') ? https : http;
    
    // リクエスト開始時刻を記録
    const startTime = Date.now();
    
    // GETリクエストを送信
    protocol.get(targetUrl, (res) => {
      // レスポンスを受信したら経過時間を計算
      const duration = Date.now() - startTime;
      message.channel.send(`URL: **${targetUrl}**\nステータスコード: **${res.statusCode}**\nレスポンスまでの時間: **${duration} ms**`);
      
      // レスポンスデータは消費して接続を閉じる
      res.resume();
    })
    .on('error', (err) => {
      message.channel.send(`★エラー出たよ★: ${err.message}`);
    });
  
}else if(command === 'userinfo'){
    const user = message.author;
    const embed = {
        title: "ユーザー情報",
        fields: [
            { name: "ユーザー名", value: user,tag, inline: ture },
            { name: "ユーザーID", value: user.id, inline: ture },
            { name: "アバターURL", value: user.displayAvatarURL(), inline: false }
        ],
        color: 0x00FF00
  };
  message.channel.send({ embeds: [embed] });

  //serverinfo
}else if(command === 'serverinfo') {
    const { guild } = message;
    const embed = {
      title: "サーバー情報",
      fields: [
        { name: "サーバー名", value: guild.name, inline: true },
        { name: "サーバーID", value: guild.id, inline: true },
        { name: "メンバー数", value: `${guild.memberCount} 人`, inline: true },
        { name: "作成日時", value: guild.createdAt.toDateString(), inline: false }
      ],
      color: 0x0099ff
    };
    message.channel.send({ embeds: [embed] });

    //ggrks
}else if (command === 'ggrks'){
    
    //検索ワードがない場合のエラーめっさげ
    if(!args.length){
        return message.channel.send("なんか言えよ");
    }

    const query = args.join(' ');

    //google-itを使用して検索
    googleIt({ query: query })
    .then(results => {
      // 上位3件の結果を整形して送信
      if (!results || results.length === 0) {
        return message.channel.send(`検索結果がNothing`);
      }
      
      let response = `**"${query}" の検索結果**\n\n`;
      results.slice(0, 5).forEach((result, index) => {
        response += `**${index + 1}. ${result.title}**\n${result.link}\n\n`;
      });
      
      message.channel.send(response);
    })
    .catch(err => {
      console.error(err);
      message.channel.send(`エラー出た: ${err.message}`);
    });
}else  if (command === 'youtube') {
    if (!args.length) {
      return message.channel.send("なんか言えよ");
    }

    const query = args.join(' ');

    //非同期(ry
    async function myAsyncFuntion() {
    try {
      const result = await ytSearch(query);
      const videos = result.videos.slice(0, 5); // 上位5件を取得

      if (videos.length === 0) {
        return message.channel.send(`"${query}" の検索結果が見つかりませんでした。`);
      }

      const embeds = videos.map((video, index) => {
        return new EmbedBuilder()
          .setColor('#FF0000') // 赤色 (YouTubeのテーマカラー)
          .setTitle(`${index + 1}. ${video.title}`)
          .setURL(video.url)
          .setThumbnail(video.thumbnail)
          .addFields(
            { name: '⏳ 再生時間', value: video.timestamp, inline: true },
            { name: '📺 チャンネル', value: video.author.name, inline: true },
            { name: '📅 アップロード日', value: video.ago, inline: true }
          )
          .setFooter({ text: `🔍 検索ワード: ${query}` });
      });
      
      message.channel.send(response);
    } catch (error) {
      console.error(error);
      message.channel.send(`エラー出たちょ: ${error.message}`);
    }
}

//wiki
  }else  if (command === 'wiki') {
    if (!args.length) {
      return message.channel.send("なんか言えよ");
    }

    const query = args.join(' ');
    
    //非同期処理を同期的に使いたいからasync
    async function myAsyncFunction() {
        

    try {
      // Wikipedia APIで検索
      const searchResults = await wiki.search(query);
      if (!searchResults.query.search.length) {
        return message.channel.send(`"${query}" のWikipedia記事が見つかりませんでした。`);
      }

      // 一番上の記事を取得
      const firstResult = searchResults.query.search[0];
      const page = await wiki.page(firstResult.title);
      const summary = await page.summary();
      const url = `https://ja.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;

      // 埋め込みメッセージを作成
      const embed = new EmbedBuilder()
        .setColor('#1a5dab') // Wikipediaのテーマカラー（青）
        .setTitle(summary.title)
        .setURL(url)
        .setDescription(summary.extract.length > 500 ? summary.extract.substring(0, 500) + '...' : summary.extract)
        .setThumbnail(summary.thumbnail ? summary.thumbnail.source : 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png')
        .setFooter({ text: `🔍 検索ワード: ${query}` });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.channel.send(`エラー出た: ${error.message}`);
    }
  }
}
});
    

// Bot を Discord に接続するため、取得した Bot トークンでログインします
client.login('YOUR_DISCORD_BOT_TOKEN');
