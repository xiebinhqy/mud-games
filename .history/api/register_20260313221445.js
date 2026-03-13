const fs = require('fs');
const path = require('path');

// Vercel临时存储路径
const USER_STORE_PATH = path.join('/tmp', 'mud_game_users.json');

// 读取用户数据
function readUsers() {
  try {
    if (fs.existsSync(USER_STORE_PATH)) {
      const content = fs.readFileSync(USER_STORE_PATH, 'utf8');
      return JSON.parse(content || '{}');
    }
  } catch (err) {
    console.error('读取用户数据失败:', err);
  }
  return {};
}

// 写入用户数据
function writeUsers(users) {
  try {
    fs.writeFileSync(USER_STORE_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('写入用户数据失败:', err);
  }
}

// 处理OPTIONS预检请求
function handleOptions(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  res.statusCode = 204;
  res.end();
}

module.exports = async (req, res) => {
  // 处理跨域预检请求
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // 设置跨域头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  try {
    // 解析请求体
    const { username, password } = req.body || {};

    // 参数校验
    if (!username || !password) {
      return res.status(200).json({
        ok: false,
        msg: '账号和密码不能为空'
      });
    }

    // 读取现有用户
    const users = readUsers();

    // 检查账号是否已存在
    if (users[username]) {
      return res.status(200).json({
        ok: false,
        msg: '该账号已存在，请直接登录'
      });
    }

    // 创建新用户
    users[username] = {
      password: password, // 生产环境建议加密，测试用明文
      data: {
        level: 1,
        exp: 0,
        gold: 0,
        power: 100
      },
      createTime: new Date().toISOString()
    };

    // 保存用户数据
    writeUsers(users);

    // 返回成功响应
    res.status(200).json({
      ok: true,
      msg: '注册成功！请点击登录按钮进入游戏'
    });
  } catch (error) {
    console.error('注册接口异常:', error);
    res.status(500).json({
      ok: false,
      msg: '服务器内部错误：' + error.message
    });
  }
};