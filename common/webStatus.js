/**
	WebError
	描述错误，也作为任何 callback 的返回对象
*/
exports = module.exports = new WebStatus();

var CodeMsg = require("./codeMsg");

function WebStatus( code ){

};

WebStatus.prototype.constructor = WebStatus;

WebStatus.prototype.init = function( code ){

	code = code === undefined ? 0 : code;
	this.code = code;
	this.result =  null;
	this.msg = this.getMsg(code);
    return this;
};


WebStatus.prototype.setCode = function( code  ) {
	this.init( code );
	return this;
};

WebStatus.prototype.addMsg = function( msg ){

	this.msg += msg;
	return this;
};

WebStatus.prototype.getMsg = function( code ){
	if(CodeMsg.SYSTEM_CODE[code]){
		return CodeMsg.SYSTEM_CODE[code];
	}

	if(CodeMsg.CODE[code]){
		return CodeMsg.CODE[code];
	}

	return "未知错误定义，code:" + code;
};

WebStatus.prototype.setMsg = function( msg ){

	this.msg = msg;
	return this;
},


WebStatus.prototype.setResult = function( object ){

	this.result = object||{};
	return this;
};

WebStatus.prototype.toJSON = function( add ){

	var json = {
		code : this.code,
		msg: this.msg,
		result:this.result
	};
    console.log(json)
    if( add ){
        for(var key in add){
            json[key] = add[ key ];
        }
    }
	return json;
};

WebStatus.prototype.toString = function(){
	return JSON.stringify( this.toJSON() );
};
