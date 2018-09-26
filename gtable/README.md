
//js 

$("#view-table").gtable({
	tablecls : "table table-striped jambo_table margin-top-10" ,  //table的样式
	header : headerarr,
	remote : {
		url :  url ,         //请求路径
		param : that.params, //请求参数
		onload : function (response) {   //请求成功事件		
			return {
				dataArr : response.datalist,
				total :  response.total
			}
			
		}
	},
	finish:function () {  //请求结束，不管成功或者失败都走这里
		
	},
	error:function (e) { //请求失败走这里
		
	},
	pageInfo :{  //分页
		page : 1, 
		pageSize : 10
	}
)

//html
<div class = "gtable" id="view-table" ></div>
