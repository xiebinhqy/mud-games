// 游戏核心配置
const GAME_VERSION = "1.0.0";
let currentUser = null;
let gameData = { level: 1, exp: 0, gold: 0, power: 100 };

// 页面加载完成后自动检查更新
window.onload = async () => {
  await checkGameUpdate(false);
};

// 检查更新
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

// 注册账号
async function handleRegister() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  
  // 空值校验
  if (!username || !password) {
    addGameLog('账号和密码不能为空', 'danger');
    return;
  }

  try {
    // 发送注册请求（关键：绝对路径 + 完整请求头）
    const response = await fetch('https://mud-games.vercel.app/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      mode: 'cors'
    });

    const result = await response.json();
    addGameLog(result.msg || (result.ok ? '注册成功' : '注册失败'), result.ok ? 'success' : 'danger');
  } catch (error) {
    addGameLog('注册请求失败：' + error.message, 'danger');
    console.error('注册错误详情：', error);
  }
}

// 登录账号
async function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  
  if (!username || !password) {
    addGameLog('账号和密码不能为空', 'danger');
    return;
  }

  try {
    const response = await fetch('https://mud-games.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      mode: 'cors'
    });

    const result = await response.json();
    if (result.ok) {
      currentUser = username;
      gameData = result.data || { level: 1, exp: 0, gold: 0, power: 100 };
      
      // 隐藏登录弹窗，显示游戏界面
      closeModal('loginModal');
      document.getElementById('gameContainer').style.display = 'block';
      document.getElementById('game-username').innerText = username;
      
      // 刷新游戏数据
      refreshGameData();
      addGameLog('登录成功，欢迎回来！', 'success');
    } else {
      addGameLog(result.msg || '账号或密码错误', 'danger');
    }
  } catch (error) {
    addGameLog('登录请求失败：' + error.message, 'danger');
    console.error('登录错误详情：', error);
  }
}

// 云端存档
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

// 打开排行榜
async function openRank() {
  try {
    const response = await fetch('https://mud-games.vercel.app/api/rank?server=1', {
      method: 'GET',
      cache: 'no-cache'
    });

    const rankList = await response.json();
    let rankHtml = '';
    if (rankList.length === 0) {
      rankHtml = '暂无玩家数据';
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

// 打开GM后台
function openGM() {
  if (!currentUser) {
    addGameLog('请先登录账号', 'danger');
    return;
  }
  showModal('gmModal');
}

// 执行GM指令
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

// 刷新游戏数据
function refreshGameData() {
  document.getElementById('game-level').innerText = gameData.level || 1;
  document.getElementById('game-gold').innerText = gameData.gold || 0;
  document.getElementById('game-power').innerText = gameData.power || 100;
  document.getElementById('game-expBar').style.width = `${Math.min((gameData.exp || 0) / 100, 1) * 100}%`;
}

// 添加游戏日志
function addGameLog(text, type) {
  const logElement = document.getElementById('game-log');
  const color = type === 'success' ? '#0f0' : type === 'danger' ? '#f44' : '#fff';
  const time = new Date().toLocaleTimeString();
  logElement.innerHTML = `<span style="color:${color}">[${time}] ${text}</span><br>` + logElement.innerHTML;
}

// 显示弹窗
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

// 关闭弹窗
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// 切换标签页
function switchTab(tabId) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  // 取消所有标签激活状态
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  // 激活目标页面和标签
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// 增加金币
function addGold() {
  gameData.gold = (gameData.gold || 0) + 1000;
  gameData.power = (gameData.level || 1) * 100 + (gameData.gold || 0) / 1000;
  refreshGameData();
  addGameLog('获得1000金币', 'success');
}