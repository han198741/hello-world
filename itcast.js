/**
 * Created by Administrator on 2017/2/17.
 */


// 在开发框架时，为了防止变量以及全局对象的污染，要使用沙箱模式。
// 沙箱模式: 代码自执行，分割作用域
// 将常用的全局对象，通过参数传递到沙箱内
// 	好处：1. 在一定程度上提高变量的搜索性能； 2. 有利于代码压缩
/*(function(global) {
 // 独立的作用域，与外界隔离
 }(window));*/

(function (global) {
    var document = global.document;
    var init,
        arr = [],
        slice = arr.slice,
        push = arr.push;


    // selector为选择器
    // context 为选择器指定范围
    var itcast = function (selector, context) {
        return new itcast.fn.init(selector, context);
    }
    // fn 是用来替换prototype属性的，为了方便获取，少打几个字母
    itcast.fn = itcast.prototype = {
        //由于改变了itcast的prototype原型指向，所以constructor可能被覆盖了，所以要把该属性重新指向itcast；
        constructor: itcast,
        length: 0, //保持itcast对象在任何条件下都是伪数组对象
        splice: arr.splice,//为了让itcast伪数组对象更像数组的格式。
        toArray: function () {
            return slice.call(this);
        },
        get: function (index) {
            //如果index为null或者undefined值，就将所有元素以数组形式返回。
            if (index == null) {
                return slice.call(this);
            }
            //根据索引值 获取对应的dom元素
            return this[index > 0 ? index : index + this.length];
        },
        eq: function (index) {
            return itcast(this.get(index));
        },
        first: function (){
            return itcast(this.get(0));

        },
        last: function () {
            return itcast(this.get(-1));

        },
        each:function (callback) {
            return itcast.each(this,callback);
        },
        map:function (callback) {
            return itcast(itcast.map(this,function(ele,i){
                return callback.call(elem,elem,i);
            }));

        }

    };

    // 将构造函数init放到 itcast函数上。为了和itcast建立关联
    // 同时让init变量 也引用该构造函数。为了方便使用
    init = itcast.fn.init = function (selector, context) {

        // 处理null undefined   ''
        if(!selector){
            // 返回itcast.fn.init{}空对象
            return this;
        }

        //处理字符串类型（html字符串和选择器字符串）
        if(itcast.isString(selector)){
            if(itcast.isHTML(selector)){
                //创建dom
                //var doms=itcast.parseHTML(selector);
                //以伪数组的形式存储在this上
                push.apply(this,itcast.parseHTML(selector));
            }else{
                //选择器
                push.apply(this,select(selector,context));
            }
        }


        //处理dom对象
        else if(itcast.isDOM(selector)){
            this[0]=selector;
            this.length=1;
        }
        //处理dom数组或者伪数组对象
        else if(itcast.isArrayLike(selector)){
            push.apply(this,selector)
        }

        //处理函数
        else if (typeof selector === 'function'){
            //首先判断dom树是否加载完毕，
            //如果已加载完毕，就直接执行该函数
            if(itcast.isReady){
                selector();
            }
            else{
                //如果没有加载完毕，就将该函数注册到DOMContentLoaded这个事件上
                document.addEventListener('DOMContentLoaded',function () {
                    itcast.isReady=true;
                    selector();
                })
            }
        }

            };
    init.prototype = itcast.fn;
    //提供可扩展的接口
    itcast.extend = itcast.fn.extend = function (source) {
        //枚举source上的属性
        for (var k in source) {
            // 添加到调用者身上
            this[k] = source[k];
        }
    }

    //工具类
    //类型判断方法
    itcast.extend({
        isString:function (obj) {
            return typeof obj === 'string';
        },
        //判断是否为html字符串
        isHTML: function (obj) {
            return (obj+'').charAt(0) === '<' &&// 以 '<' 开头
                (obj + '').charAt((obj + '').length - 1) === '>' && //以 '>'结尾
                (obj + '').length >= 3; //最小长度为3
        },

        //判断是否为元素节点
        isDOM: function (obj) {
            return 'nodeType' in obj && obj.nodeType === 1;
        },

        // 判断是否为全局window对象
        isWindow: function (obj) {
            return !!obj && obj.window ===obj;
        },

        // 判断是否为数组或者伪数组对象
        isArrayLike: function (obj) {
            //如果obj不为null或者undefined，并且具有length属性，就获取其length值。
            //否则 length为boolean值
            var length = !!obj && 'length' in obj && obj.length,
                type =itcast.type(obj);//存储obj的类型

            //过滤函数和window对象
            if(type === 'function' || itcast.isWindow(obj)){
                return false;
            }
            else{
                return type ==='array' || length ===0 || typeof length ==='number' && length > 0 && (length - 1) in obj;
            }
        }

    });

    itcast.extend({
        isReady: false,
        each: function (obj, callback) {
            var i=0,
                l=obj.length;
            for (;i<l;i++){
                if(callback.call(obj[i],obj[i],i) === false){
                    break;
                }
            }
            //返回遍历的对象
            return obj;
        },
        map:function (arr, callback, args) {
            // 临时存储 callback执行后的返回值
            var value;
            var ret=[];
            var i=0,
                l=arr.length;

            for(;i<l;i++){
                //获取callback执行后的结果
                value=callback(arr[i],i,args);
                //判断是否 为null 或者是undefined值
                //如果不为上述值，就将其追加到return数组内。
                if(value != null){
                    ret.push(value);
                }
                //返回新数组对象
                //同时将多为数组转换成一维数组
                return Array.prototype.concat.apply([],ret);
            }
        },
        //将html字符串，转换成html元素
        parseHTML:function (html) {
            var ret=[];
            //动态创建一个div，使用其innerHTML属性，来将html字符串转换成元素
            var div = document.createElement('div');
            div.innerHTML=html;
            //遍历div所有子节点
            for (var i=0;i<div.childNodes.length;i++){
                //如果类型为元素节点，就是要创建的元素节点
                //就追加到ret内
                if(div.childNodes[i].nodeType === 1){
                    ret.push(div.childNodes[i]);
                }
            }
            return ret;
        },

        type: function (obj) {
            if(obj===null){
                return obj+'';
            }
            return typeof obj ==='object'? Object.prototype.toString.call(obj).slice(8,-1).toLowerCase() : typeof obj;

        }

    });

    //DOM操作模块
    itcast.fn.extend({
        appendTo: function (target) {
            //缓存this指向的对象
            var self=this,
                node, //临时存储要被追加的源节点
                ret=[];// 存储所有被追加的节点
            //同一类型
            target = itcast(target);
            //遍历target
            target.each(function (telem, i) {
                //遍历源节点
                self.each(function (selem) {
                    //如果i===0，表示昂前telem为第一个目标元素，不需要拷贝源节点selem
                    //否则要拷贝
                    //将上面得到的源节点，追加到目标元素上，telem；
                    node=i===0? selem:selem.cloneNode(true);
                    ret.push(node);
                    telem.appendChild(node);
                });


            });
            //实现链式编程
            return itcast(ret);
        },

        append : function(source) {
            //如果source为普通字符类型
            //用变量临时存储一下
            var text;
            //是字符串类型，但不是html字符串
            //就认为是普通字符串
            //如果source为普通字符串，就将其转换成文本节点，追缴到目标DOM元素上
            if(itcast.isString(source) && !itcast.isHTML(source)){
                //将source赋值给text保存起来
                text=source;
                //然后将source赋值为itcast空对象
                source = itcast();
                //把字符串转换成文本节点并且存储在source上
                source[0] = document.createTextNode(text);
                source.length=1;
            }else {
                //将其他source类型统一为itcast对象
                source = itcast(source);
                //使用已封装好的appendTo方法，将source上的元素追加到this目标元素上
                source.appendTo(this);

            }
            //实现链式编程
            return this;
        },

        prependTo: function (target) {
            var firstChild, //缓存目标元素的第一个子节点
                self = this,
                node,
                ret = [];
            //统一target类型为itcast对象
            target = itcast (target);
            //遍历target
            target.each(function (telem, i) {
                //缓存目标元素的第一个子节点
                firstChild = telem.firstChild;
                //遍历self上所有源节点
                self.each(function (selem) {
                    node = i === 0 ? selem : selem.cloneNode(true);
                    ret.push(node);
                    //在目标元素的第一个子节点前，添加子节点
                    telem.insertBefore(node, firstChild);
                });
            });
            // 实现链式编程
            return itcast(ret);
        },
        prepend: function (source) {
            //如果source为普通的字符串类型
            //用该变量临时存储一下
            var text;
            if(itcast.isString(source) && !itcast.isHTML(source)){
                text = source;
                source = itcast();
                source[0] = document.createNode(text);
                //同时设置其伪数组长度为1；
                source.length = 1;
            }
            else {
                //将source统一为itcast对象
                source = itcast(source);

            }
            //使用已封装好的appendTo方法，将source上的元素追加到this目标元素上。
            source.prependTo(this);
            //实现链式编程
            return this;
        },
        remove: function () {
            return this.each(function (elem) {
                //this就是当前遍历到的元素
                // this == elem
                this.parentNode.removeChild(this);
            });
        },
        before : function (newNode) {
              var text;
            if(itcast.isString(newNode) && !itcast.isHTML(newNode)){
                 text = newNode;
                newNode = itcast();
                newNode[0] = document.createTextNode(text);
                newNode.length = 1;
            }
            else {
                newNode = itcast(newNode);
            }
            this.each(function (telem, i) {
                newNode.each(function () {
                    telem.parentNode.insertBefore(i === 1 ? this : this.cloneNode(true), telem );
                })
            })
            return this;
        },

        //创建文档片段，再将文档片段添加到目标元素中
        // after : function (newNode) {
        //     var text,
        //         that = this,
        //         frag;
        //     if(itcast.isString(newNode) && !itcast.isHTML(newNode)){
        //         text = newNode;
        //         newNode = itcast();
        //         newNode[0] = document.createTextNode(text);
        //         newNode.length = 1;
        //     }
        //     else {
        //         newNode = itcast(newNode);
        //     }
        //     this.each(function (elem, i) {
        //         frag = document.createDocumentFragment();
        //         newNode.each(function () {
        //             frag.appendChild(i === 1 ? this : this.cloneNode(true))
        //             that.constructor.insertAfter(frag, elem );
        //         });
        //     });
        //     return this;
        // }

        //倒序将源节点添加到目标节点中
        after : function (newNode) {
            var text,
                that = this;
            if(itcast.isString(newNode) && itcast.isHTML(newNode)){
                text = newNode;
                newNode = itcast();
                newNode[0] = document.createTextNode(text);
                newNode.length = 1;
            }
            else {
                newNode = this.constructor(newNode);
            }
            this.each(function (elem, i) {
                for (var j = newNode.length-1; j>=0; j--){
                    that.constructor.insertAfter(i === 0 ? newNode[j] : newNode[j].cloneNode(true), elem);
                }
            })
            return this;
        },
        next : function () {
            var ret = [];
            this.each(function () {
                for (var node = this.nextSibling; node; node = node.nextSibling){
                    if(node.nodeType === 1){
                        ret.push(node);
                        break;
                    }
                }
            })
            return this.constructor(ret);
        },
        nextAll : function () {
            var ret = [];
            this.each(function () {
                for (var node = this.nextSibling; node; node = node.nextSibling){
                    if(node.nodeType === 1){
                        ret.push(node);
                    }
                }
            })
            return this.constructor(this.constructor.unique(ret));
        },
        prev : function () {
            var ret = [];
            this.each(function () {
                for (var node = this.previousSibling; node; node = node.previousSibling){
                    if(node.nodeType === 1){
                        ret.push(node);
                        break;
                    }
                }
            })
            return this.constructor(ret);
        },
        prevAll : function () {
            var ret = [];
            this.each(function () {
                for (var node = this.previousSibling; node; node = node.previousSibling){
                    if(node.nodeType === 1){
                        ret.push(node);
                    }
                }
            })
            return this.constructor(this.constructor.unique(ret));
        },
        parent : function () {
            var ret = [];
            this.each(function () {
                this.parentNode && ret.push(this.parentNode);
            })
            return this.constructor(this.constructor.unique(ret));
        },
        siblings : function () {
            var ret = [];
            this.each(function () {
                for (var node = this.parentNode.firstChild; node; node = this.nextSibling){
                    if(node.nodeType === 1 && node !== this){
                        ret.push(node);
                    }
                }
            })
            return this.constructor(this.constructor.unique(ret));
        }

    });


    itcast.extend({
        insertAfter : function (newNode, node) {
            node.parentNode.insertBefore(newNode, node.nextSibling);
        },
        unique: function (arr) {
            var ret = [];
            arr.forEach(function (v) {
                if(ret.indexOf(v) ===-1){
                    ret.push(v);
                }
            })
            return ret;
        }
    })
    //事件模块
    itcast.fn.extend({
        on : function (type, callback) {
            return this.each(function (type, callback) {
                this.addEventListener(type, callback);
            })
        },

        off : function (type, callback) {
            return this.each(function (type, callback) {
                this.removeEventListener(type, callback);
            })
        }

    });
    //添加快捷事件绑定的方法
    //在数组元素中每一个都是要添加到原型上的方法的名字，也是事件类型的名字
    itcast.each(('click dblclick mouseover mouseout mouseenter mouseleave mousemove ' +
    'keypress keydown keyup focus blur').split(' '),function (type) {
        itcast.fn[type] = function (callback) {
            return this.on(type, callback);
        };
    });

    //样式模块
    function getCss(dom, name) {
        return window.getComputedStyle(dom)[name];
    }
    function setCss(dom, name, value) {
        if (value == undefined){
            //枚举name对象属性
            //对象的属性是要给dom添加样式属性名，name对象属性对应值，就是样式属性值。
            for(var k in name){
                dom.style[k] = name[k];
            }
            else {
                //否则，就设置dom元素的单个样式
                dom.style[name] = value;
            }
        }
    }

    itcast.fn.extend({
        css : function (name, value) {
            //只传一个参数
            if(value == undefined){
                //如果name类型为对象
                //设置多样式
                if (typeof name === 'object'){
                    //遍历this上dom元素
                    this.each(function () {
                        //给当前遍历到的dom元素设置多样式
                        setCss(this, name);
                    })
                } else {
                    //如果那么不是对象，就获取第一个dom元素的指定样式值
                    //如果itcast对象没有任何dom元素，就返回空字符串
                    return this.length > 0 ? getCss(this[0], name) : '';
                }
            } else {
                //遍历this上的dom元素
                this.each(function () {
                    //给当前遍历道德dom元素设置单个样式。
                    setCss(this, name, value);
                })
            }
            //如果css方法表示设置，此时要实现链式编程
            return this;
        },
        hasClass : function (className) {
            //定义该方法的返回ret，默认为false
            var ret = false;
            //遍历this上dom元素
            this.each(function () {
                //如果当前dom 元素具有指定的样式类
                //ret值为true，同时结束循环
                if(this.className.split(' ').indexOf(className) > -1){
                    ret = true;
                    return false;
                }
                if((' ' + this.className + ' ').indexOf(' '+ className + ' ') > -1){
                    ret = true;
                    return false;
                }
            });
            return ret;
        },
        addClass : function (className) {
            //遍历this， 并返回each方法的返回值，实现链式编程
            return this.each(function () {
                //将this（当前遍历到的dom）转换成itcast对象
                //调用hasClass方法，判断当前dom是否具有样式类
                //如果没有，就添加上
                if(!itcast(this).hasClass(className)){
                    this.className = this.className + ' ' + className;
                }
            })
        },
        removeClass : function (className) {
            return this.each(function () {
                //将当前dom元素的所有样式类艺术组形式存储
                var classNames = this.className.split('');
                //查找要删除的样式类在数组的索引值。
                var start = classNames.indexOf(className);
                //如果索引值大于-1，表示含有该样式类
                if(start > -1){
                    //使用splice方法将其删除
                    classNames.splice(start, 1);
                    //再将数组中元素以空格拼接成字符串，赋值费当前dom元素的className属性
                    this.className = classNames.join(' ');
                }
            })
        },

        toggleClass : function (className) {
            return this.each(function () {
                var $this = itcast(this);
                if($this.hasClass(className)){
                    $this.removeClass(className);
                } else {
                    $this.addClass(className);
                }
            })
        }
    })
    //选择器引擎
    //通过select函数，来查询dom元素
    var select = function (selector, context) {
        //存储所有获取到的dom元素
        var ret = [];
        //判断是否指定了context
        if(context){
            //context 是 dom对象
            //使用context调用querySelectorAll 获取dom元素
            // 将其转换成真数组返回
            if(context.nodeType === 1){
                return Array.prototype.slice.call(context.querySelectorAll(selector));
            }
            //context 是 dom 数组或伪数组
            //遍历context， 使用当前遍历到的元素调用querySelectorAll 获取 dom元素
            //得到结果doms，要将其所有dom元素追加到ret数组中，
            else if (context instanceof Array || (typeof context === 'object' && 'length' in context) ){
                for (var i=0; i<context.length; i++){
                    var doms = context[i].querySelectorAll(selector);
                    for (var j=0; j<doms.length; j++){
                        ret.push(doms[j]);
                    }
                }
            }
            //context 为 字符串即为选择器
            else {
                return Array.prototype.slice.call(document.querySelectorAll(context + '' +selector));
            }
            return ret;
        }
        //如果context没有传入实参
        //通过document调用querySelectorAll来直接获取dom元素
        else{
            return Array.prototype.slice.call(document.querySelectorAll(selector));
        }
    };
    // 为了用户在框架外部实现扩展方法
    // 由于在框架外部 用户只能拿到itcast函数以及其原型
    // 所以用户在扩展操作dom方法时，只能向原型上扩展，所以为了让init对象可以访问到
    // 让init对象继承自itcast.prototype
    global.$ = global.itcast = itcast;
    // 将itcast函数暴露在全局上
    // 任何用户只要加载框架代码，就可以使用$函数，就是itcast

    //注册DOM数加载完毕的事件
    //用来更新itcast.isReady值
    document.addEventListener('DOMContentLoaded',function () {
        itcast.isReady=true;
    })

}(window));