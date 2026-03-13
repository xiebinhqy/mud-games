const version = "1.0.0";
let user = null;
let server = 1;
let game = {level:1, exp:0, gold:0, power:100};

// 自动检查更新
window.onload = async () => {
  await checkUpdate();
  showModal("loginModal");
};

// 更新检查
async function checkUpdate(manual=false){
  const res = await fetch("/api/version");
  const data = await res.json();
  if(data.version > version){
    showModal("updateModal");
    document.getElementById("updateMsg").innerText = data.log;
  }else if(manual){
    addLog("当前已是最新版","success");
  }
}

// 登录注册
async function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    // 空值校验
    if (!u || !p) {
      addLog("账号密码不能为空", "danger");
      return;
    }
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (data.ok) {
        currentUser = u;
        game = data.data || { level:1, exp:0, gold:0, power:100 };
        closeAllModal();
        document.getElementById("gameContainer").style.display = "block";
        document.getElementById("user").innerText = u;
        refresh();
        addLog("登录成功", "success");
      } else {
        addLog(data.msg || "账号或密码错误", "danger");
      }
    } catch (e) {
      addLog("登录请求失败：" + e.message, "danger");
    }
  }

  async function register() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if (!u || !p) {
      addLog("账号密码不能为空", "danger");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      addLog(data.msg, data.ok ? "success" : "danger");
    } catch (e) {
      addLog("注册请求失败：" + e.message, "danger");
    }
  }

// 云端存档
async function saveCloud(){
  await fetch("/api/save",{
    method:"POST", body:JSON.stringify({user,game,server})
  });
  addLog("云端存档成功","success");
}

// 排行榜
async function openRank(){
  const res = await fetch("/api/rank?server="+server);
  const list = await res.json();
  let html = "";
  list.forEach((i,k)=>{
    html+=`${k+1}.${i.user} 战力${i.power}<br>`;
  });
  document.getElementById("rankList").innerHTML = html;
  showModal("rankModal");
}

// GM功能
function openGM(){showModal("gmModal")}
async function gmCmd(type){
  const pwd = document.getElementById("gmPwd").value;
  const res = await fetch("/api/gm",{
    method:"POST", body:JSON.stringify({pwd,type,user,server})
  });
  const d = await res.json();
  game = d.game || game;
  refresh();
  addLog(d.msg, d.ok?"success":"danger");
}

// 工具
function refresh(){
  document.getElementById("level").innerText = game.level;
  document.getElementById("gold").innerText = game.gold;
  document.getElementById("power").innerText = game.power;
  document.getElementById("expFill").style.width = (game.exp/1000)+"%";
}
function addLog(txt,t){
  const l = document.getElementById("log");
  l.innerText = `[${t}] ${txt}\n`+l.innerText;
}
function showModal(id){document.getElementById(id).style.display="flex"}
function closeModal(id){document.getElementById(id).style.display="none"}
function closeAll(){document.querySelectorAll(".modal").forEach(m=>m.style.display="none")}
function tab(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  event.target.classList.add("active");
}
function addGold(){game.gold+=1000;refresh();addLog("金币+1000","success")}