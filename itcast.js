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
    }
    // 将构造函数init放到 itcast函数上。为了和itcast建立关联
    // 同时让init变量 也引用该构造函数。为了方便使用
    init = itcast.fn.init = function (selector, context) {
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
    // 为了用户在框架外部实现扩展方法
    // 由于在框架外部 用户只能拿到itcast函数以及其原型
    // 所以用户在扩展操作dom方法时，只能向原型上扩展，所以为了让init对象可以访问到
    // 让init对象继承自itcast.prototype
    global.$ = global.itcast = itcast;
    // 将itcast函数暴露在全局上
    // 任何用户只要加载框架代码，就可以使用$函数，就是itcast
}(window));