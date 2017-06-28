(function(window){
	
	var cloud = window.cloud || {};
	
	
	cloud.getModel = function(){
		var model = api.require("model");
		model.config({
		       appId : api.appId,
		       appKey : "C58F4A5B-7EFE-A57C-18BA-CB749DFF8190",
		       host: "https://d.apicloud.com"    //这个地址是固定的
		});
		
		return model;
	}
	/**
	 *	分页查询出表的数据  
	 *  table	表名
	 * 	start 第几页  从1开始
	 * 	page 一页显示几行 
	 * 	success 成功回调函数
	 */
	cloud.findAll = function(table, start, page, success){
		var query = api.require("query");
		query.createQuery(function(ret, err) {
		    if (ret && ret.qid) {
		        var queryId = ret.qid;
				
				query.skip({
               		qid   : queryId, 
                	value : (start-1)*page
         		});
		        query.limit({
		            qid:queryId,
		            value:page
		        });
		        //根据创建时间倒序排序
				query.desc({
		            qid: queryId,
		            column: "createdAt"
		        })
				
		        var model = cloud.getModel();
		
		        model.findAll({
		            class: table,
		            qid: queryId
		        }, function(ret, err){
		        	success(ret);
		        });
		    }
		});
	}
	
	/**
	 *	根据条件查询符合的记录数量
	 */
	cloud.findByColumn = function(table, where, success){
		
		var query = api.require("query");

		query.createQuery(function(ret, err) {
		    if (ret && ret.qid) {
		        var queryId = ret.qid;
				
		        query.whereEqual({
		            qid: queryId,
		            column: where[0],
		            value: where[1]
		        });
		        
		        var model = cloud.getModel();
				
		        model.count({
		            class: table,
		            qid: queryId
		        }, function(ret, err){
		            success(ret);
		        });
		    }
		});
		
	}
	/**
	 *	根据条件查询符合的记录
	 */
	cloud.findByColumnPage = function(table, where, start, page, success){
		
		var query = api.require("query");

		query.createQuery(function(ret, err) {
		    if (ret && ret.qid) {
		        var queryId = ret.qid;
				
				query.skip({
               		qid   : queryId, 
                	value : (start-1)*page
         		});
		        query.limit({
		            qid:queryId,
		            value:page
		        });
		        
		        query.whereEqual({
		            qid: queryId,
		            column: where[0],
		            value: where[1]
		        });
		        
		        //根据创建时间倒序排序
				query.desc({
		            qid: queryId,
		            column: "createdAt"
		        })
		        
		        var model = cloud.getModel();
				
		        model.findAll({
		            class: table,
		            qid: queryId
		        }, function(ret, err){
		            success(ret);
		        });
		    }
		});
		
	}
		//根据用户id获得用户信息
	cloud.getUserById = function(userId, success){
		var model = api.require("model");
		model.findById({
		    class: "user",
		    id: userId
		}, function(ret, err){
			success(ret);
		});
	}
	/**
	 * 根据userId获取头像
 	 * @param string 用户编码
 	 * @param function 成功执行的回调
 	 * @param function 失败执行的回调
	 */
	cloud.getHeadPhoto = function(userId, successCallBack, errorCallBack){
		if(userId){
			var model = api.require("model");
			model.findById({	
			    class: "user",
			    id: userId
			}, function(ret, err){
				var headPhotoUrl = ret.headPhoto;
				if(headPhotoUrl){
					model.findById({
					    class: "file",
					    id: headPhotoUrl
					}, function(ret, err){
						var url = ret.url;
						if(url){
							successCallBack(url);
						}else{
							errorCallBack();
						}
					});
					
				}else{
					errorCallBack();
				}
			});
		}else{
			errorCallBack();
		}
		
		
	}
	
	/**
	 *	双击退出app 
	 */
	cloud.exitApp = function(){
		api.addEventListener({
        	name : 'keyback'
        }, function(ret, err) {
	        api.toast({
		        msg: '再按一次返回键退出',
		        duration: 2000,
		        location: 'bottom'
	        });
	        api.addEventListener({
	        	name : 'keyback'
	        }, function(ret, err) {
		        api.closeWidget({
			        id : api.appId,  //你的APPid
			        retData : {
			        	name : 'closeWidget'
			        },
			        animation : {
				        type : 'flip',
				        subType : 'from_bottom',
				        duration : 500
			        },
			        silent : true
		        });
	        });
	        setTimeout(function() {
	        	cloud.exitApp();
	        }, 3000);
        });
	}
	
	/**
	 *	提示wifi的状态 
	 */
	cloud.hintWifiStatus = function(){
		var connectionType = api.connectionType;
		
        var siv = setInterval(function(){
        	var winW = document.documentElement.clientWidth || document.body.clientWidth;  
        	var connectionType = api.connectionType;
        	if(connectionType=="none"){
        		layer.msg('当前无网络', {
				  offset: 't',
				  area: winW+'px'
				});
        	}
        },3000);   
	}
	
	
	
	/**
	 *	打开相册 
	 */
	cloud.openPicture = function(success){
		var UIMediaScanner = api.require('UIMediaScanner');
		UIMediaScanner.open({
		    type: 'picture',
		    column: 4,
		    classify: true,
		    max: 4,
		    sort: {
		        key: 'time',
		        order: 'desc'
		    },
		    texts: {
		        stateText: '已选择*项',
		        cancelText: '取消',
		        finishText: '完成'
		    },
		    styles: {
		        bg: '#fff',
		        mark: {
		            icon: '',
		            position: 'bottom_left',
		            size: 20
		        },
		        nav: {
		            bg: '#eee',
		            stateColor: '#000',
		            stateSize: 18,
		            cancelBg: 'rgba(0,0,0,0)',
		            cancelColor: '#000',
		            cancelSize: 18,
		            finishBg: 'rgba(0,0,0,0)',
		            finishColor: '#000',
		            finishSize: 18
		        }
		    },
		    scrollToBottom: {
		        intervalTime: 3,
		        anim: true
		    },
		    exchange: true,
		    rotation: true
		}, function(ret) {
		    if (ret) {
		        success(ret);
		    }
		});
	}
	/**
	 *	格式化日期  
	 * 	param date  date类型的参数
	 * 	param fmt 要显示样式 例 yyyy-MM-dd hh:mm:ss 
	 */
	cloud.DateFormat = function(date, fmt){
		  var o = { 
		    "M+" : date.getMonth()+1,                 //月份 
		    "d+" : date.getDate(),                    //日 
		    "h+" : date.getHours(),                   //小时 
		    "m+" : date.getMinutes(),                 //分 
		    "s+" : date.getSeconds(),                 //秒 
		    "q+" : Math.floor((date.getMonth()+3)/3), //季度 
		    "S"  : date.getMilliseconds()             //毫秒 
		  }; 
		  if(/(y+)/.test(fmt)) 
		    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
		  for(var k in o) 
		    if(new RegExp("("+ k +")").test(fmt)) 
		  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
		  return fmt; 
	}
	
	/**
	 *	layer提示框 
	 */
	cloud.dirAlert = function(msg){
		layer.msg(msg);
	}
	
	window.cloud = cloud;
	
})(window);