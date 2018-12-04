const express = require('express');
const Users = require('../model/users');

const router = new express.Router();

//解析请求体数据
router.use(express.urlencoded({extended: true}));

router.get('/', (req, res) => {
  res.send('这是服务器返回的响应222');
})

//注册
router.post('/register', async (req, res) => {
  //获取用户提交请求参数信息
  const {username, password, type} = req.body;
  try {
    //去数据库查找当前用户是否存在
    const user = await Users.findOne({username});
  
    if (user) {
      //用户名被注册了
      res.json({
        code: 1,
        msg: '此用户已存在'
      })
    } else {
      //用户可以注册
      //保存在数据库中
      const {username, _id, type} = await Users.create({username, password, type});
      //返回成功的响应
      res.json({
        code: 0,
        data: {
          username,
          _id,
          type
        }
      })
    }
  } catch (e) {
    res.json({
      code: 2,
      msg: '网络不稳定，请刷新试试~'
    })
  }
})

module.exports = router;