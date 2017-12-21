module.exports = {
	/*系统状态码*/
	SYSTEM_CODE : {
		"0":"成功！",
		"-1":"参数错误",
		"-2":"信息重复",
		"-3":"未登录或登录超时",
		"-4":"用户已经存在",
        "-5":'删除失败',
        "-6":"两次密码不同",
        "-7":"用户名不正确",
        "-8":"登陆失败",
        "-9":"帐号或密码错误",
		"500":"服务器错误",
		"501":"ftp服务器连接失败",
		"600":"数据库错误",
		"601":"数据库错误",
		"403":"Client Access Licenses exceeded（超出客户访问许可证）",
		"404":"not defined"
	},
	/*
		业务状态码 1000开始
		1000 - 1999 用户模块
	*/
	CODE: {
		1000: "记录不存在",
		1001: "该用户已存在",
		1002: "您不是管理员,无法创建用户",
		1003: "文件上传失败",
		1004: "只支持jpg, png, gif",
		1005: "文件格式错误,或者找不到文件",
		1006: "文件保存失败",
		1007: "文件删除失败",
		1008: "文件创建失败",
		1009: "请输入文件扩展名",
		1010: "服务器错误,操作失败",
		1011: "不是项目创建人,无法操作该项目",
		1012: "解压文件失败",
		1013: "只支持zip",
		1014: "您不是管理员,无法删除项目",
		1015: "/modules/common/api/api.js 读取失败",
		1016: "fis-conf.js 读取失败",
		1017: "uglify 失败",
		1018: "分支初始化失败",
		1019: "有项目正在发布，请稍后再试！"
	}
};
