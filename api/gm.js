const fs = require('fs');
const path = require('path');

const USER_FILE = path.join('/tmp', 'mud_users.json');
const GM_PWD = "admin888";

function readUsers() {
  try {
    if (fs.existsSync(USER_FILE)) {
      return JSON.parse(fs.readFileSync(USER_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USER_FILE, JSON.stringify(users), 'utf8');
  } catch (e) {
    console.log('写入失败:', e);
  }
}

module.exports = async (req, res) => {
  const body = req.body || {};
  const { gmPwd, user, type } = body;

  // 校验GM密码
  if (gmPwd !== GM_PWD) {
    return res.status(200).json({ ok: false, msg: "GM密码错误" });
  }

  const users = readUsers();
  if (!users[user]) {
    return res.status(200).json({ ok: false, msg: "用户不存在" });
  }

  const d = users[user].data;
  // 执行GM指令
  if (type === "gold") d.gold += 100000;
  if (type === "level") {
    d.level += 10;
    d.power = d.level * 100;
  }

  writeUsers(users);
  res.status(200).json({ ok: true, msg: "GM指令执行成功", game: d });
};
