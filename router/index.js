const express = require('express');
const md5 = require('blueimp-md5');
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
  console.log(username, password, type);
  
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
      const user = await Users.create({username, password: md5(password), type});
      //返回成功的响应
      res.json({
        code: 0,
        data: {
          username: user.username,
          _id: user.id,
          type: user.type
        }
      })
    }
  } catch (e) {
    console.log(e);
    res.json({
      code: 2,
      msg: '网络不稳定，请刷新试试~'
    })
  }
})
//登录
router.post('/login', async (req, res) => {
  //获取用户提交请求参数信息
  const {username, password} = req.body;
  console.log(username, password);
  
  try {
    //去数据库查找当前用户是否存在
    const user = await Users.findOne({username, password: md5(password)});
    if (user) {
      //用户可登录，登录成功
      res.json({
        code: 0,
        data: {
          _id: user.id,
          type: user.type,
          username: user.username
        }
      })
    } else {
      //用户名或密码错误
      //返回失败的响应
      res.json({
        code: 1,
        msg: '用户名或密码错误'
      })
    }
  } catch (e) {
    console.log(e);
    res.json({
      code: 2,
      msg: '网络不稳定，请刷新试试~'
    })
  }
})

module.exports = router;