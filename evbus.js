/**
 * Created by liuxg on 2018/11/27.
 */

;(function ($,window) {

        window.curpath = document.location.pathname;
        window.contextpath = "/" + window.curpath.match("/retrievers.*?/")[0].replace("/","").replace("/","") ;
        window.serverpath  = window.curpath.substr(0,window.curpath.lastIndexOf("/"));

        /**
         * 事件处理器，单例
         * @param type
         * @param callback
         */
        function eventBus() {

            window.EventProcessor =  {
                container : {},
                add : function(type,callback) {
                    var arr = this.container[type];
                    if(!arr){
                        arr = new Array();
                    }
                    arr.push(callback);
                    this.container[type] = arr;
                    return this ;
                },
                remove : function (type) {
                    delete this.container[type] ;
                    return this ;
                },
                trigger : function (type) {
                    var queue = this.container[type];
                    if(queue && queue.length > 0){
                        $.each(queue,function (index,item) {
                            if(typeof(item) == "function"){
                                var arr = new Array();
                                for(var i = 1 ;i < arguments.length;i++){
                                    arr[i-1] = arguments[i];
                                }
                                item.apply(this,arr);
                            }
                        })
                    }
                    return this ;
                }
            }

            //处理全局ajax事件
            $(document).ajaxComplete(function(event,request,settings){
                EventProcessor.trigger("ajaxComplete",event,request,settings);
            });

            $(document).ajaxSend(function(event,request, settings){
                EventProcessor.trigger("ajaxSend",event,request, settings);
            });

            $(document).ajaxError(function(event,request, settings){
                EventProcessor.trigger("ajaxError",event,request, settings);
            });

        }

        eventBus();

        $(function () {
            EventProcessor.add("ajaxComplete",function (event,request,settings) {
                if(window.NProgress){
                    NProgress.done();
                    NProgress.remove();
                }else{
                    window.parent.NProgress.done();
                }
            });
            EventProcessor.add("ajaxSend",function (event,request,settings) {
                if(window.NProgress){
                    NProgress.start();
                }else{
                    window.parent.NProgress.start();
                }
            });
            EventProcessor.add("ajaxError",function (event,request,settings) {
                if(request && request.responseText){
                    console.error(request.responseText);
                }
                if(window.NProgress){
                    NProgress.done();
                    NProgress.remove();
                }else{
                    window.parent.NProgress.done();
                }

                if (!window.noneedopen){ //由调用者决定
                    if(window.jQuery.gmsg){
                        jQuery.gmsg("error");
                    }else{
                        window.parent.jQuery.gmsg("error");
                    }
                }
            });
            EventProcessor.trigger("ready",$,window);
        });

})(jQuery,window);
