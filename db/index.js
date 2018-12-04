const mongoose = require('mongoose');

module.exports = new Promise((resolve, reject) => {
  mongoose.connect('mongodb://localhost:27017/ggzhipin2', {useNewUrlParser: true});
  mongoose.connection.once('open', err => {
    if (!err) {
      console.log('数据库连接成功');
      resolve();
    } else {
      console.log(err);
      reject(err);
    }
  })
})

