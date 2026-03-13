module.exports = async (req, res) => {
    res.status(200).json({ 
      version: "1.0.0", 
      log: "修复注册登录问题，生产环境可用" 
    });
  };