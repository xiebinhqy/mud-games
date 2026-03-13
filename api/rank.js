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

module.exports = async (req, res) => {
  const users = readUsers();
  const list = [];

  // 遍历用户生成排行榜
  for (let u in users) {
    list.push({
      user: u,
      power: users[u].data?.power || 100
    });
  }

  // 按战力降序排序
  list.sort((a, b) => b.power - a.power);
  res.status(200).json(list.slice(0, 30));
};