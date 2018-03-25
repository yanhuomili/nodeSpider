var http=require('http');
var express=require('express');
var fs=require('fs');
var Url=require('url');
var jsDom=require('jsdom').JSDOM;
var gbk=require('gbk');

var app=express();//设置服务器
app.listen('8080',function(){//监听端口
	console.log('监听8080端口');
	
})

//静态文件托管，当我门开启服务之后，在浏览器中可以访问所在服务的静态文件
//可以设置多个静态文件
app.use(express.static('./'));
app.use(express.static(__dirname+'/dist'));

//设置路由，监听浏览器发送过来的请求并且做出响应
app.use('/getUrl',function(req,res){
	console.log(req.query.ourl);
//	下载图片
	searchImg(req.query.ourl,function(obj){
		res.send(obj);
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
		res.on('data',function(data){
			str+=data;
		})
		res.on('end',function(){
//			使用jsdom将读取的页面转成可操作的浏览器环境，这样就可以像在浏览器中一样操作dom元素
			let DOM=new jsDom(str);
			let document=DOM.window.document;
			var arr=[];
			var num=0;
			var imgs=document.getElementsByTagName('img');
			for(let i=0;i<imgs.length;i++){
				//调用写图片的方法，将图片写到指定的文件夹
				getImg(imgs[i].getAttribute('src'),i,function(obj){
					num++;
					console.log(obj);
					console.log(num);
					console.log(imgs.length);
					if(num==imgs.length-1){
						success&&success({msg:'大功告成'})
					}
					
				});
//				if(i==imgs.length-1){
//					console.log('所有图片下载完成！')
//				}
			}
		})
	});
	req.end();//结束访问，否则浏览器会一直是等待结束状态，而不能操作数据
}

//getImg('http://img0.bdstatic.com/static/searchresult/img/logo-2X_b99594a.png',3)
//获取图片,传入参数：url和当前图片的命名
function getImg(ourl,i,success){
	//使用url模块来解析导航栏的链接
	var nowUrl=Url.parse(ourl);
	var hostname=nowUrl.hostname;
	var pathname=nowUrl.path;
	
	//createServer用于创建服务器
	//request用于访问服务器
	var req=http.request({
		hostname:hostname,//域名
		path:pathname//路径
	},res=>{
		var arr=[];
		res.on('data',function(data){
			arr.push(data);
		})
		res.on('end',function(){
//			使用Buffer方法把拿到的数据转成buffer对象,否则被处理过的不是一jpg/png/gif结尾的图片无法打开
			arr=Buffer.concat(arr);
			//使用异步写文件的时候需要设置回调函数，否则node命令行里面会出现警告
			fs.writeFile('./img/'+i+'.jpg',arr,'utf-8',function(){
				console.log('图片下载完成');
				success&&success({msg:'图片下载完成',index:i})
			});
		})
	});
	req.end();//结束访问，否则浏览器会一直是等待结束状态，而不能操作数据
}


