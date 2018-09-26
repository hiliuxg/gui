/**
 * Created by liuxg on 2017/5/11.
 */

;(function ($) {

    var gpage = function ($ele,options) {
        var that = this ;
        this.config = {};
        this.setSize = function(pageSize) {
            that.config["pageSize"] = pageSize ;
        }
        this.setTotal = function(total) {
            that.config["total"] = total ;
        }

        var $gpage = null ;
        var GROUP_COUNT = 5 ;  //分页的分组，一组默认是5个
        var defaultconfig = {
             page : 1 ,
             pageSize: 10 ,
             total : 0 ,
             pageev : function () {}
        }

        function totalPage() {
            return parseInt(that.config.total / that.config.pageSize  + (that.config.total % that.config.pageSize == 0 ? 0 : 1));
        }

        function getPageInfo() {
            return {
                page : that.config.page ,
                pageSize : that.config.pageSize ,
                total : that.config.total,
                totalPage : totalPage()
            }
        }

        function next() {
            toPage(parseInt(that.config.page) + 1);
        }

        function previous() {
            toPage(parseInt(that.config.page) - 1);
        }

        function toPage(_page) {
            refresh(_page);
            changeStaus();
            that.config.pageev(getPageInfo());
        }

        function changeStaus() {
            $gpage.find("li").removeClass("disabled");
            if(that.config.page == 1){
                $gpage.find("li:first").addClass("disabled")
            }
            if(that.config.page == totalPage()){
                $gpage.find("li:last").addClass("disabled");
            }

            $gpage.find("li").each(function () {
                var $span = $(this).find("span");
                if($span.text() == that.config.page){
                    $(this).addClass("active");
                }else{
                    $(this).removeClass("active")
                }
            });
        }

        /**
         * 刷新组的显示页数，当点击page数大于5或者小于5时候，触发
         */
        function refresh(_page) {

            if(_page == 0){ //到第一页，则禁用前一页
                _page = 1 ;
            }else if(_page > totalPage()){//到第最后页，则禁用最后一页
                _page = totalPage() ;
            }
            var lastPage = that.config.page ;

            var temp = new Array();
            if(_page > lastPage && _page % GROUP_COUNT == 1){//下一页且除于组为1

                var countGroup = parseInt(that.config.page) + GROUP_COUNT ;
                if(countGroup > totalPage()){
                    countGroup = totalPage() ;
                }
                temp.push('<li id="pre"><a href="#"><span>&laquo;</span></a></li>');
                for(var i = _page ;i <= countGroup ; i++){
                    temp.push('<li><a href="#"><span>'+i+'</span></a></li>');
                }
                temp.push('<li  id="last"><a href="#"><span>&raquo;</span></a></li>');
                $gpage.empty();
                $gpage.append(temp.join(""));
            }else if(_page < lastPage && _page %  GROUP_COUNT == 0){//上一页且除于组为0
                temp.push('<li id="pre"><a href="#"><span>&laquo;</span></a></li>');
                for(var i = _page - 4 ; i <= _page ; i++){
                    temp.push('<li><a href="#"><span>'+i+'</span></a></li>');
                }
                temp.push('<li  id="last"><a href="#"><span>&raquo;</span></a></li>');
                $gpage.empty();
                $gpage.append(temp.join(""));
            }

            that.config.page = _page ;
        }

        function initgpage() {
            var temp = new Array();
            var tempPageSize = totalPage();
            temp.push('<ul class="pagination" ><li class="disabled" ><a href="#"><span id="pre">&laquo;</span></a></li>');

            if(tempPageSize == 0){ //没有数据，默认选择第一页
                if(that.config.page == 1){
                    temp.push('<li class="active"><a href="#"><span>1</span></a></li>');
                }else{
                    temp.push('<li ><a href="#"><span>1</span></a></li>');
                }
            }else if(totalPage() >= GROUP_COUNT){ //如果总的页数大于5，则默认显示5个点击页数
                tempPageSize = GROUP_COUNT ;
            }

             for(var i = 1 ;i <= tempPageSize ; i++){
                 if(that.config.page == i){
                     temp.push('<li class="active"><a href="#"><span>'+i+'</span></a></li>');
                 }else{
                     temp.push('<li><a href="#"><span>'+i+'</span></a></li>');
                 }
             }
             temp.push('<li ><a href="#" ><span id="last">&raquo;</span></a></li></ul>')
             $ele.append(temp.join(""));
             $gpage = $ele.find(".pagination");
        }

        function init() {
            that.config = $.extend(defaultconfig,options);
            initgpage();
            $gpage.off("click").on("click",function (ev) {
                var target = ev.target;
                if($(target).parents("li").hasClass("disabled")){
                    return ;
                }
                if(target.textContent == "«"){//上一页
                    previous();
                }else if(target.textContent == "»"){//下一页
                    next();
                }else{ //跳转到某一页
                    toPage(target.textContent);
                }
            });
            $gpage.find("li:first").addClass("active");  //默认高亮第一个
        }
        init();
    }

    $.fn.gpage = function (options) {
       return new gpage($(this),options);
    }

})(jQuery);