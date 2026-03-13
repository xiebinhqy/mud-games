// 游戏核心配置
const GAME_VERSION = "1.0.0";
// 内置默认账号（直接用这个账号测试）
let currentUser = "testadmin"; 
// 内置默认游戏数据
let gameData = { level: 10, exp: 5000, gold: 10000, power: 1000 };

// 页面加载完成后自动进入游戏（跳过登录）
window.onload = async () => {
  // 检查更新（可选）
  await checkGameUpdate(false);
  
  // 隐藏登录弹窗，直接显示游戏界面
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  // 显示默认账号
  document.getElementById('game-username').innerText = currentUser;
  // 刷新游戏数据
  refreshGameData();
  // 添加欢迎日志
  addGameLog(`已自动登录测试账号：${currentUser}`, 'success');
  addGameLog('可直接测试GM、存档、排行榜等功能', 'success');
};

// 检查更新（保留）
async function checkGameUpdate(isManual) {
  try {
    const response = await fetch('/api/version', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    const data = await response.json();
    if (data.version > GAME_VERSION) {
      showModal('updateModal');
      document.getElementById('updateLog').innerText = data.log || '修复了已知问题，建议更新';
    } else if (isManual) {
      addGameLog('当前已是最新版本', 'success');
    }
  } catch (error) {
    if (isManual) addGameLog('检查更新失败：' + error.message, 'danger');
  }
}

// 云端存档（保留，适配默认账号）
async function saveToCloud() {
  if (!currentUser) {
    addGameLog('请先登录账号', 'danger');
    return;
  }

  try {
    const response = await fetch('https://mud-games.vercel.app/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        user: currentUser, 
        game: gameData,
        server: 1
      })
    });

    const result = await response.json();
    addGameLog(result.msg || (result.ok ? '存档成功' : '存档失败'), result.ok ? 'success' : 'danger');
  } catch (error) {
    addGameLog('存档失败：' + error.message, 'danger');
  }
}

// 打开排行榜（保留）
async function openRank() {
  try {
    const response = await fetch('https://mud-games.vercel.app/api/rank?server=1', {
      method: 'GET',
      cache: 'no-cache'
    });

    const rankList = await response.json();
    let rankHtml = '';
    if (rankList.length === 0) {
      rankHtml = '暂无玩家数据（可先存档生成数据）';
    } else {
      rankList.forEach((item, index) => {
        rankHtml += `${index + 1}. ${item.user || '未知玩家'} - 战力：${item.power || 0}<br>`;
      });
    }

    document.getElementById('rankList').innerHTML = rankHtml;
    showModal('rankModal');
  } catch (error) {
    addGameLog('获取排行榜失败：' + error.message, 'danger');
  }
}

// 打开GM后台（保留）
function openGM() {
  if (!currentUser) {
    addGameLog('请先登录账号', 'danger');
    return;
  }
  showModal('gmModal');
}

// 执行GM指令（保留，GM密码还是 admin888）
async function gmCommand(type) {
  const gmPwd = document.getElementById('gm-password').value.trim();
  if (!gmPwd) {
    addGameLog('请输入GM密码', 'danger');
    return;
  }

  try {
    const response = await fetch('https://mud-games.vercel.app/api/gm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gmPwd,
        type,
        user: currentUser
      })
    });

    const result = await response.json();
    if (result.ok) {
      gameData = result.game || gameData;
      refreshGameData();
    }
    addGameLog(result.msg || (result.ok ? 'GM指令执行成功' : 'GM指令执行失败'), result.ok ? 'success' : 'danger');
  } catch (error) {
    addGameLog('GM指令失败：' + error.message, 'danger');
  }
}

// 刷新游戏数据（保留）
function refreshGameData() {
  document.getElementById('game-level').innerText = gameData.level || 1;
  document.getElementById('game-gold').innerText = gameData.gold || 0;
  document.getElementById('game-power').innerText = gameData.power || 100;
  document.getElementById('game-expBar').style.width = `${Math.min((gameData.exp || 0) / 100, 1) * 100}%`;
}

// 添加游戏日志（保留）
function addGameLog(text, type) {
  const logElement = document.getElementById('game-log');
  const color = type === 'success' ? '#0f0' : type === 'danger' ? '#f44' : '#fff';
  const time = new Date().toLocaleTimeString();
  logElement.innerHTML = `<span style="color:${color}">[${time}] ${text}</span><br>` + logElement.innerHTML;
}

// 显示弹窗（保留）
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

// 关闭弹窗（保留）
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// 切换标签页（保留）
function switchTab(tabId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// 增加金币（保留）
function addGold() {
  gameData.gold = (gameData.gold || 0) + 1000;
  gameData.power = (gameData.level || 1) * 100 + (gameData.gold || 0) / 1000;
  refreshGameData();
  addGameLog('获得1000金币', 'success');
}

// 以下为废弃的登录/注册函数（保留但不调用）
function handleLogin() {}
function handleRegister() {}