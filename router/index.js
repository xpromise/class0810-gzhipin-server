const express = require('express');
const md5 = require('blueimp-md5');
const cookieParser = require('cookie-parser');
const Users = require('../model/users');
const Messages = require('../model/messages');

const router = new express.Router();

//解析请求体数据
router.use(express.urlencoded({extended: true}));
router.use(cookieParser());

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
      res.cookie('userid', user.id, {maxAge: 1000 * 3600 * 24 * 7})
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
      res.cookie('userid', user.id, {maxAge: 1000 * 3600 * 24 * 7})
      res.json({
        code: 0,
        data: {
          _id: user.id,
          type: user.type,
          username: user.username,
          header: user.header,
          post: user.post,
          salary: user.salary,
          company: user.company,
          info: user.info
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
// 更新用户信息的路由
router.post('/update', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  console.log(userid);
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.json({code: 1, msg: '请先登陆'});
  }
  // 存在, 根据userid更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  Users.findByIdAndUpdate({_id: userid}, {$set: user})
    .then(oldUser => {
      if (!oldUser) {
        //更新数据失败
        // 通知浏览器删除userid cookie
        res.clearCookie('userid');
        // 返回返回一个提示信息
        res.json({code: 1, msg: '请先登陆'});
      } else {
        //更新数据成功
        // 准备一个返回的user数据对象
        const {_id, username, type} = oldUser;
        console.log(oldUser);
        //此对象有所有的数据
        const data = Object.assign({_id, username, type}, user)
        // 返回成功的响应
        res.json({code: 0, data})
      }
    })
    .catch(error => {
      // console.error('登陆异常', error)
      res.send({code: 2, msg: '网络不稳定，请重新试试~'})
    })
})

// 获取用户信息的路由(根据cookie中的userid)
router.get('/user', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.send({code: 1, msg: '请先登陆'})
  }
  // 根据userid查询对应的user
  Users.findOne({_id: userid}, {__v: 0, password: 0})
    .then(user => {
      if (user) {
        res.send({code: 0, data: user})
      } else {
        // 通知浏览器删除userid cookie
        res.clearCookie('userid')
        res.send({code: 1, msg: '请先登陆'})
      }
    })
    .catch(error => {
      console.error('获取用户异常', error)
      res.send({code: 1, msg: '获取用户异常, 请重新尝试'})
    })
})

// 获取用户列表(根据类型)
router.get('/userlist', (req, res) => {
  const {type} = req.query
  Users.find({type}, {__v: 0, password: 0})
    .then(users => {
      res.send({code: 0, data: users})
    })
    .catch(error => {
      console.error('获取用户列表异常', error)
      res.send({code: 1, msg: '获取用户列表异常, 请重新尝试'})
    })
})

/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', (req, res) => {
  // 获取cookie中的userid
  const userid = req.cookies.userid
  
  let users;
  // 查询得到所有user文档数组
  Users.find()
    .then(userDocs => {
      // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
      users = userDocs.reduce((prev, curr) => {
        prev[curr._id] = {username: curr.username, header: curr.header}
        return prev
      }, {})
      /*
      查询userid相关的所有聊天信息
       参数1: 查询条件
       参数2: 过滤条件
       参数3: 回调函数
      */
      return Messages.find({'$or': [{from: userid}, {to: userid}]}, {__v: 0, password: 0})
    })
    .then(chatMsgs => {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}})
    })
    .catch(error => {
      console.error('获取消息列表异常', error)
      res.send({code: 1, msg: '获取消息列表异常, 请重新尝试'})
    })
})

module.exports = router;