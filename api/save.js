const fs = require('fs');
const path = require('path');

const USER_FILE = path.join('/tmp', 'mud_users.json');

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
  const { user, game } = body;

  if (!user || !game) {
    return res.status(200).json({ ok: false, msg: "参数错误" });
  }

  const users = readUsers();
  if (users[user]) {
    users[user].data = game;
    writeUsers(users);
  }

  res.status(200).json({ ok: true, msg: "存档成功" });
};