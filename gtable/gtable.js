
/**
 * 基于bootstrap样式表格简单组件
 * Created by liuxg on 2017/5/10.
 */

;(function ($) {

    var gtable = function ($ele,options) {

        var $table = null ;
        var $gpage = null ;
        var that = this ;
        this.config = {};
        this.refresh = function() {
            if(that.config.pageInfo != null){
                $table.parent(".gtable").find(".gpage").remove();
                refreshPageTable(1,true);
            }else{
                refreshNoPage();
            }
        }

        var defaultconfig = {
            caption : null,   //标题
            tablecls : "table" ,  //table的样式
            header : null,  //头部标题,数组如[{name:'aa',width:'10%',key:"b.id",attr:"id=hello"}]
            remote : {   //已post方式请求同步请求数据
                url : null ,         //请求路径
                param : {} ,        //请求参数
            },
            error : function () {},  //error事件
            onload : function () {}, //数据请求成功事件
            finish : function () {},  //页面数据加载完成，table初始化完成的事件
            dataArr : null ,     //可以不通过远程请求的方式，通过传入数据也可以初始化
            pageInfo : null         //pageInfo :{page:1,pageSize:10}  当前页，每页大小，多少页
        }

        function initTable() {
            if(that.config.header == null || that.config.header.length == 0){
                console.warn("header not null or length != 0 ");
                return  null;
            }
            var temp = new Array();
            temp.push('<table class="'+that.config.tablecls+'">');
            if(that.config.caption != null){
                temp.push('<caption>'+that.config.caption+'</caption>');
            }
            temp.push('</table >');
            $ele.append(temp.join(""));
            $table = $($ele.find("table"));
            initHeader();
            return $table ;
        }

        function initHeader(){
            var headers = that.config.header;
            var temp = new Array();
            temp.push('<thead><tr>');
            $.each(headers,function (i,header) { //遍历设置header
                var width = header.width ;
                if(width != null && $.trim(width) != ""){
                    temp.push('<th width="'+header.width+'" '+header.attr+'>'+header.name+'</th>');
                }else{
                    temp.push('<th '+header.attr+'>'+header.name+'</th>');
                }
            })
            temp.push('</tr></thead>');
            temp.push('<tbody>');
            temp.push('</tbody>');
            $table.append(temp.join(""));
        }

        function initBody(data) {
            var headers = that.config.header;
            var temp = new Array();
            $.each(data,function (i,row) { //遍历设置data
                temp.push("<tr>")
                $.each(headers,function (i,item) {
                    temp.push('<td name="'+item.key+'">'+(row[item.key] == null ? "-" : row[item.key] )+'</td>');
                });
                temp.push("</tr>")
            })
            $table.find("tbody").append(temp.join(""));
        }

        function refreshNoPage() {
            $table.find("tbody").empty();
            getRemoteDataAndInitBody();
        }

        /**
         *
         * 刷新分页table
         * @param page
         */
        function refreshPageTable(page,needInitpage) {
            that.config.remote.param["page"] = page ;
            that.config.remote.param["pageSize"] = that.config.pageInfo["pageSize"];
            $table.find("tbody").empty();
            $.ajax({
                url : that.config.remote.url,
                data : that.config.remote.param,
                type : "post" ,
                success : function (data) {//如果有分页返回数据格式{total,dataarr},没有的话，后台则返回dataarr
                    var callresult = that.config.remote.onload(data);
                    that.config.pageInfo.total = callresult.total;
                    initBody(callresult.dataArr);
                    if(needInitpage != null && needInitpage == true){
                        initPage($table.parent(".gtable"));
                    }
                },
                error : function (error) {
                    that.config.error(error);
                }
            });
        }

        /**
         * 初始化分页
         */
        function initPage($ele) {
            $ele.append('<nav class = "gpage"></nav>');
            $gpage = $($ele.find(".gpage")).gpage({
                page : that.config.pageInfo.page ,
                pageSize : that.config.pageInfo.pageSize ,
                total : that.config.pageInfo.total ,
                pageev : function (curpage) {
                    refreshPageTable(curpage.page);
                }
            });
        }


        /**
         * 获取分页的数据
         */
        function getPageRemoteDataAndInitBody() {
            that.config.remote.param["page"] = that.config.pageInfo["page"] ;
            that.config.remote.param["pageSize"] = that.config.pageInfo["pageSize"];
            $.ajax({
                url : that.config.remote.url,
                data : that.config.remote.param,
                type : "post" ,
                success : function (data) {//如果有分页返回数据格式{total,dataarr},没有的话，后台则返回dataarr
                    var callresult = that.config.remote.onload(data);
                    that.config.pageInfo.total = callresult.total;
                    initBody(callresult.dataArr);
                    initPage($table.parent(".gtable"));
                    that.config.finish($table);
                },
                error : function (error) {
                    that.config.error(error);
                }
            });
        }

        function getRemoteDataAndInitBody() {
            $.ajax({
                url : that.config.remote.url,
                async : false ,
                data : that.config.remote.param,
                type : "post" ,
                success : function (data) {//如果有分页返回数据格式{total,dataArr},没有的话，后台则返回对象数组即可
                    var _data = that.config.remote.onload(data);
                    initBody(_data);
                    that.config.finish($table);
                },
                error : function (error) {
                    that.config.error(error);
                }
            });
        }

        function init() {

            that.config = $.extend(defaultconfig,options);
            if(that.config.remote.param == null) {
                that.config.remote["param"] = {};
            }

            //拆分成json的格式
            if(that.config.remote.param != null &&
                typeof that.config.remote.param == 'string' &&
                that.config.remote.param.constructor == String){
                var tmp = that.config.remote.param ;
                that.config.remote.param = {} ;
                var paramarr = tmp.split("&");
                $.each(paramarr,function (index,item) {
                    var arr = item.split("=");
                    that.config.remote.param[$.trim(arr[0])] = $.trim(arr[1]);
                })
            }

            $table = initTable();
            if($table == null) return ;
            if(that.config.pageInfo != null){
                getPageRemoteDataAndInitBody();
            }else if(that.config.remote != null && $.trim(that.config.remote) != ""){
                getRemoteDataAndInitBody();
            }
        }

        /**
         * gtable入口
         */
        init();
    }

    $.fn.gtable = function (options) {
        return  new gtable($(this),options);
    }
})(jQuery);