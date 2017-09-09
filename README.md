# 输入框组

简单实现了一组输入框动态增减，配合[jQuery Validation Plugin](https://jqueryvalidation.org/)可以很方便的实现校验。

[demo](https://howiefh.github.io/input-group/demo.html)

## 配置和使用

```
// 规则配置
var groupRules = [{
    label: "姓名",
    inputName: "name",
    type: "select", // 只支持 input 和 select， 默认是input text
    data: [{key:'', value:''}], // type 为 select 时配置此项
    events: [{event:'', handler:function(){}}],
    isHidden: false,
    formatter: function(val){},
    resolver: function(val){},
    attributes: "required" // 标签属性，可以定义校验规则
}];

// 初始话输入框组
var inputGroup = $('#inputGroup').inputGroup({
    domFormWrap: '<div class="form-horizontal"></div>',
    domFormGroupWrap: '<div class="form-group"></div>',
    domInputWrap: '<div class="col-sm-3"></div>',
    domLabel: {cssClass: 'col-sm-2 control-label'}, // label DOM default: {cssClass: 'col-sm-2 control-label'}
    domInput: {cssClass: 'form-control'}, // input DOM default: {cssClass: 'form-control'}
    header: '配置', // 标题 default: ''
    maxLength: 0, // 输入组的转为字符串后的最大长度 default: 0 不做验证
    groupRules: groupRules, // 规则 default: null
    initValues: null //初始值 default: null
});

// 获取输入框组值
var val = inputGroup.getInputValues();
var str = inputGroup.getValuesAsString();
```
