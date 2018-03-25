var http=require('http');
var express=require('express');
var fs=require('fs');
var Url=require('url');
var jsDom=require('jsdom').JSDOM;
var gbk=require('gbk');
var iconv=require('iconv-lite');
var segment=require('segment');
var seg=new segment();
seg.useDefault();
var app=express();//设置服务器
app.listen('8080',function(){//监听端口
	console.log('监听8080端口');
	
})

//静态文件托管，当我门开启服务之后，在浏览器中可以访问所在服务的静态文件
//可以设置多个静态文件
app.use(express.static('./'));
app.use(express.static(__dirname+'/dist'));

//设置路由，监听浏览器发送过来的请求并且做出响应
app.use('/xiaoshuo',function(req,res){
	console.log(req.query.ourl);
//	下载图片
//	searchImg(req.query.ourl,function(obj){
//		res.send(obj);
//	});
	searchImg(req.query.ourl,function(obj){
		res.send(obj);
	console.log(obj);
	});
//	res.send(req.query.ourl);
})


//http://www.nipic.com/zhuanti/1203862.html
//searchImg('http://www.nipic.com/photo');


//读取网页文件
function searchImg(ourl,success){
	//使用url模块来解析导航栏的链接
	var nowUrl=Url.parse(ourl);
	var hostname=nowUrl.hostname;
	var pathname=nowUrl.path;
	console.log(hostname);
	console.log(pathname);
	
	//createServer用于创建服务器
	//request用于访问服务器，根据自己的需求来处理访问到的资源
	var req=http.request({
		hostname:hostname,//域名
		path:pathname//路径，带查询的参数的链接好像不可使用
	},res=>{
		var str;
		var arr=[];
		res.on('data',function(data){
//			str+=data;
			arr.push(data);
		})
		res.on('end',function(){
			//以buffer的形式将页面保存下来
			arr=Buffer.concat(arr);
			//因为原网页使用gbk编码，所以这里需要使用gbk解码来解析页面
			arr=iconv.decode(arr,'gbk');
			//使用jsdom将html页面转化为可操作dom的浏览器环境
			
			var html=new jsDom(arr);
			var doc=html.window.document;
			var text=doc.getElementById('content').innerHTML;
			//使用正则将换行符和空格符过滤掉
			text=text.replace(/<br>/g,"");
			text=text.replace(/&nbsp;/g,"");
			//使用词组模块将文字解析成词组，返回的是对象数组
			var textArr=[];
			var newArr=[];
			textArr=seg.doSegment(text);
			textArr.forEach((item)=>{
				console.log(item.p)
				if(item.p!=2048){
					newArr.push(item.w)
				}
			})
			console.log(newArr);
			
			
//			使用jsdom将读取的页面转成可操作的浏览器环境，这样就可以像在浏览器中一样操作dom元素
//			let DOM=new jsDom(str);
//			let document=DOM.window.document;
//			var arr=[];


			success&&success({msg:'读取完成',data:newArr})

		})
	});
	req.end();//结束访问，否则浏览器会一直是等待结束状态，而不能操作数据
}

