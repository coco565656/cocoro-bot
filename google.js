const googleIt = require('google-it');

const query = 'discord bot tutorial';

googleIt({ query })
  .then(results => {
    if (results.length > 0) {
      console.log('検索結果:', results);
    } else {
      console.log('検索結果がありません');
    }
  })
  .catch(err => {
    console.error('エラー:', err);
  });
