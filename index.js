const express = require('express');
const router = require('./router');
const db = require('./db');
const app = express();
/*
  nodemon工具，帮助我们自动编译服务器代码
    npm i nodemon -g
 */

(async () => {
  await db;
  app.use(router);
})();

app.listen(4000, err => {
  if (!err) console.log('服务器启动成功了~请访问：http://localhost:4000');
  else console.log(err);
})