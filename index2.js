// discord.jsライブラリをインポート
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
// pingライブラリをインポート
const ping = require('ping');
// google検索ライブラリをインポート
const googleIt = require('google-it');
// つべ検索ライブラリインポート
const ytSearch = require('yt-search');
// wikipediaライブラリをインポート
const wiki = require('wikipedia').default;
//wikiのインスタンス設定（日本語版）
wiki.setLang('ja'); // 日本語版に設定
// axiosをインポート
const axios = require('axios');
const http = require('http');

// APIキーと検索エンジンIDを設定
const GOOGLE_API_KEY = 'AIzaSyCnuZF6DgOsEAHxb4tbnpq5tNfAfbGI4II';
const SEARCH_ENGINE_ID = 'c225849679954465d';

const PREFIX = '~~';

// Client インスタンス作成　botが受信するイベントの種類を指定する
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,  // 鯖関連のイベントを受信
        GatewayIntentBits.GuildMessages, // 鯖内のメッセージ関連イベントを受信
        GatewayIntentBits.MessageContent // メッセージの内容を取得
    ]
});

// botが起動し、準備完了したときに一度だけ呼ばれるイベント
client.once('ready', () => {
    console.log(`${client.user.tag}としてログインしました`);
});

// ユーザーがメッセージを送信したときに呼ばれるイベント
client.on('messageCreate', message => {
    // bot自身や他のbotのメッセージには反応しないようにする
    if (message.author.bot) return;

    // メッセージが~~(プレフィックス)で始まっていなければ無視
    if (!message.content.startsWith(PREFIX)) return;

 // ボットへのメンションを含むが、"~~" で始まっていない場合
    if (message.mentions.has(client.user) && !message.content.startsWith("~~")) {
        message.reply("コマンド使うときは~~をつけてちょ");
        return;
    }

    // プレフィックスを除去して、コマンドと引数を分割
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase(); // コマンド部分（小文字に変換）

    // コマンドごとの処理を分岐
    // help
    if (command === 'help') {
        message.channel.send(
            "オッスオッスこれはヘルプだゾ\n" +
            "ババアのナス　ババナス\n" +
            "以下がORESAMAが頑張って作ったコマンド一覧だゾ\n" +
            "help: helpはhelpだゾ\n" +
            "ping: pingを打つだけ\n" +
            "ggrks: ググれるよ\n" +
            "userinfo: ユーザー情報が調べられるよ\n" +
            "serverinfo: サーバー情報が調べられるよ\n" +
            "youtube: つべ検索が使えるよ\n" +
            "wiki: ウィキれるよ\n"
        );
    // ping
    } else if (command === 'ping') {
        if (!args.length) {
            return message.channel.send("URL入力してちょ");
        }

        let targetUrl = args[0];

        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'http://' + targetUrl;
        }

        const protocol = targetUrl.startsWith('https://') ? https : http;

        const startTime = Date.now();

        protocol.get(targetUrl, (res) => {
            const duration = Date.now() - startTime;
            message.channel.send(`URL: **${targetUrl}**\nステータスコード: **${res.statusCode}**\nレスポンスまでの時間: **${duration} ms**`);
            res.resume();
        })
        .on('error', (err) => {
            message.channel.send(`★エラー出たよ★: ${err.message}`);
        });
    // userinfo
    } else if (command === 'userinfo') {
        const user = message.author;
        const embed = {
            title: "ユーザー情報",
            fields: [
                { name: "ユーザー名", value: user.tag, inline: true },  // 修正: `user,tag` → `user.tag`
                { name: "ユーザーID", value: user.id, inline: true },
                { name: "アバターURL", value: user.displayAvatarURL(), inline: false }
            ],
            color: 0x00FF00
        };
        message.channel.send({ embeds: [embed] });
    // serverinfo
    } else if (command === 'serverinfo') {
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
    // ggrks
    } else if (command === 'ggrks') {
        if (!args.length) {
            return message.channel.send("検索ワードを入力してね");
        }

        const query = args.join(' ');

        axios.get(`https://www.googleapis.com/customsearch/v1`, {
            params: {
                key: GOOGLE_API_KEY,
                cx: SEARCH_ENGINE_ID,
                q: query
            }
        })
        .then(response => {
            if (response.data.items && response.data.items.length > 0) {
                let responseText = `**"${query}" の検索結果**\n\n`;
                response.data.items.slice(0, 5).forEach((item, index) => {
                    responseText += `**${index + 1}. ${item.title}**\n${item.link}\n\n`;
                });
                message.channel.send(responseText);
            } else {
                message.channel.send(`検索結果が見つかりませんでした`);
            }
        })
        .catch(err => {
            console.error(err);
            message.channel.send(`エラーが発生しました: ${err.message}`);
        });
    // youtube
    } else if (command === 'youtube') {
        if (!args.length) {
            return message.channel.send("なんか言えよ");
        }

        const query = args.join(' ');

        async function myAsyncFunction() {
            try {
                const result = await ytSearch(query);
                const videos = result.videos.slice(0, 5);

                if (videos.length === 0) {
                    return message.channel.send(`"${query}" の検索結果が見つかりませんでした。`);
                }

                const embeds = videos.map((video, index) => {
                    return new EmbedBuilder()
                        .setColor('#FF0000')
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

                message.channel.send({ embeds: embeds }); // 修正: `response` → `embeds` を送信
            } catch (error) {
                console.error(error);
                message.channel.send(`エラー出たちょ: ${error.message}`);
            }
        }
        myAsyncFunction();
    // wiki
    } else if (command === 'wiki') {
    if (!args.length) {
        return message.channel.send("検索したいキーワードを入力してください");
    }

    const query = args.join(' ');

    // 非同期関数内で実行
    async function myAsyncFunction() {
        try {
// await を使って検索結果を取得
            const wikiResults = await wiki.search(query);
            // 取得した検索結果をデバッグ用にコンソールに出力
            console.log("Search Results:", JSON.stringify(wikiResults, null, 2));
            if (!wikiResults.results || !wikiResults.results.length === 0){
                return message.channel.send(`"${query}" のWikipedia記事が見つかりませんでした。`);
            }

            // 一番上の記事を取得
            const firstResult = wikiResults.results[0];
            const page = await wiki.page(firstResult.title);
            const summary = await page.summary();
            const url = `https://ja.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;


            const embed = new EmbedBuilder()
                .setColor('#1a5dab') // Wikipediaのテーマカラー（青）
                .setTitle(summary.title)
                .setURL(url)
                .setDescription(
                    summary.extract.length > 500
                        ? summary.extract.substring(0, 500) + '...'
                        : summary.extract
                )
                .setThumbnail(
                    summary.thumbnail ? summary.thumbnail.source : 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png'
                )
                .setFooter({ text: `🔍 検索ワード: ${query}` });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.channel.send(`Wikipediaエラー: ${error.message}`);
        }
    }
    myAsyncFunction();
}      
});

// Discordボットのトークンでログイン
client.login('YOUR_DISCORD_BOT_TOKEN);
