const fs = require('fs');
const path = require('path');

// 存储路径（Vercel 临时目录）
const USER_FILE = path.join('/tmp', 'mud_users.json');

// 读取用户数据
function readUsers() {
  try {
    if (fs.existsSync(USER_FILE)) {
      return JSON.parse(fs.readFileSync(USER_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

// 写入用户数据
function writeUsers(users) {
  try {
    fs.writeFileSync(USER_FILE, JSON.stringify(users), 'utf8');
  } catch (e) {
    console.log('写入失败:', e);
  }
}

module.exports = async (req, res) => {
  // 解析请求体
  const body = req.body || {};
  const { username, password } = body;

  // 校验参数
  if (!username || !password) {
    return res.status(200).json({ ok: false, msg: "账号密码不能为空" });
  }

  const users = readUsers();
  // 检查账号是否存在
  if (users[username]) {
    return res.status(200).json({ ok: false, msg: "账号已存在" });
  }

  // 注册新用户
  users[username] = {
    password,
    data: { level: 1, gold: 0, power: 100, exp: 0 }
  };
  writeUsers(users);

  res.status(200).json({ ok: true, msg: "注册成功，可登录" });
};