/**
 * Created by Feng Hao on 2016/9/2.
 */

(function($){
    'use strict';

    var defaults = {
        header: '',
        /**
         * 输入组的转为字符串后的最大长度
         * default: 0 不做验证
         */
        maxLength: 0,
        domFormWrap: '<div class="form-horizontal"></div>',
        domFormGroupWrap: '<div class="form-group"></div>',
        domInputWrap: '<div class="col-sm-3"></div>',
        domLabel: {                                                            // label DOM
            cssClass: 'col-sm-2 control-label'
        },
        domInput: {                                                          // input DOM
            cssClass: 'form-control'
        },
        /*
         * [{
         * label: "姓名",
         * inputName: "name",
         * type: "select",
         * data: [{key:'', value:''}],
         * events: [{event:'', handler:function(){}}],
         * isHidden: false,
         * formatter: function(val){},
         * resolver: function(val){},
         * attributes: "required"
         * }]
         */
        groupRules: null,
        /*
         * [{
         * name: "howie"
         * },
         * {
         * name: "tom"
         * }]
         */
        initValues: null
    };

    var InputGroup = function(element, options){
        var self = this;
        self.$element = element;
        self.id = element.attr('id');
        if (typeof self.id == 'undefined') {
            self.id = 'i_' + random(1, 1000000);
            element.attr('id', self.id);
        }
        self.index = 0;
        self.opts = $.extend(true, {}, defaults, options);
        self.form = $(self.opts.domFormWrap);
        self.rules = {};
        element.append(self.form);
        if (self.opts.header != '') {
            self.form.append('<h5 style="font-weight: bold;">' + self.opts.header + '</h5>');
        }
        self.init();
    };

    function random(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }

    function render(self, values) {
        var opts = self.opts;
        if ($.isArray(opts.groupRules) && opts.groupRules.length > 0) {
            var box = $('<div class="bs-boxes"></div>');

            for (var i = 0; i < opts.groupRules.length; i+=2) {
                var formGroup = $(opts.domFormGroupWrap);

                for (var j = i; j < i + 2 && j < opts.groupRules.length; j++) { //每行两个输入框
                    var rule = opts.groupRules[j];
                    var inputId = self.id + '_' + rule.inputName + '_' + self.index;
                    //jquery-validation 需要name属性不同
                    var inputName = inputId;
                    self.rules[inputName] = rule;
                    var inputWrap = $(opts.domInputWrap);
                    var value;
                    if(typeof values == 'undefined' || typeof values[rule.inputName] == 'undefined') { //如果未传入初始values值，设置默认为空字符串
                        value = '';
                    } else {
                        value = values[rule.inputName];
                        if ($.isFunction(rule.formatter)) {
                            value = rule.formatter(value);
                        }
                    }
                    if (typeof rule.attributes == 'undefined') {
                        rule.attributes = '';
                    }

                    //添加input
                    var inputEle;
                    if (typeof rule.isHidden != 'undefined' && rule.isHidden) {//需要隐藏，跳过当前元素
                        inputEle = $('<input class="'  + rule.inputName + '" id="' + inputId + '" name="' + inputName + '" type="text" placeholder="' + rule.label + '" value="' + value + '" hidden>');
                        formGroup.append(inputEle);
                        i++;
                    } else {
                        //添加label
                        formGroup.append('<label for="' + inputId + '" class="' + opts.domLabel.cssClass + '">' + rule.label + '</label>');

                        if (typeof rule.type == 'string' && rule.type == 'select') {
                            var option = '<option value="">请选择</option>';

                            $.each(rule.data, function(i, item) {
                                option += '<option value="' + item.key + '" ';
                                if (value == item.key) {
                                    option += 'selected';
                                }
                                option += '>' + item.value + '</option>';
                            });
                            inputEle = $('<select class="' + opts.domInput.cssClass + ' ' + rule.inputName + '" id="' + inputId + '" name="' + inputName + '" ' + rule.attributes + '>' + option + '</select>');
                        } else {
                            inputEle = $('<input class="' + opts.domInput.cssClass + ' ' + rule.inputName + '" id="' + inputId + '" name="' + inputName + '" type="text" placeholder="' + rule.label + '" value="' + value + '" ' + rule.attributes + '>');
                        }

                        //添加事件
                        if ($.isArray(rule.events) && rule.events.length > 0) {
                            $.each(rule.events, function(index, item) {
                                inputEle.on(item.event, item.handler);
                            });
                        }

                        inputWrap.append(inputEle);
                        formGroup.append(inputWrap);
                    } // end render input element
                }

                box.append(formGroup);
            }

            var deleteBtn = $('<span class="btn-right-bottom btn-right-bottom-second btn-danger btn-delete">删除</span>');
            var addBtn = $('<span class="btn-right-bottom btn-right-bottom-first btn-primary btn-add">添加</span>');
            deleteBtn.on('click', function() {
                if (box.siblings('.bs-boxes').length == 0) {
                    box.find('input,select').val('');
                } else {
                    box.remove();
                }
            });
            addBtn.on('click', function() {
                render(self);
            });
            var btnGroup = $('<div class="zero-right-bottom"></div>');
            btnGroup.append(deleteBtn).append(addBtn);
            box.append(btnGroup);

            self.form.append(box);
            self.index++;
        }
    }

    // 初始化
    InputGroup.prototype.init = function(){
        var self = this;
        var opts = self.opts;
        if ($.isArray(opts.initValues) && opts.initValues.length > 0) {
            $.each(opts.initValues, function(i, value){
                render(self, value);
            });
        } else {
            render(self);
        }
    };

    InputGroup.prototype.getInputValues = function(){
        var self = this;
        var element = self.$element;

        var array = [];
        element.find('.bs-boxes').each(function(){
            var item = {};
            var length = 0;
            $(this).find('input,select').each(function(){
                var v = $(this).val();
                var len;
                if (v == '请选择') {
                    len = 0;
                } else {
                    len = $.trim(v).length;
                }
                length += len;
                if (len > 0) {
                    var inputName = $(this).attr('name');
                    var rule = self.rules[inputName];
                    var name = rule.inputName;
                    if ($.isFunction(rule.resolver)) {
                        v = rule.resolver(v);
                    }
                    item[name] = v;
                }
            });
            if (length > 0) {
                array.push(item);
            }
        });
        return array;
    };

    InputGroup.prototype.getValuesAsString = function(){
        var self = this;
        var array = self.getInputValues();
        var str = array.length == 0 ? '' : JSON.stringify(array);
        var valid = false;
        var errorEle = $('#' + self.id + '-error');
        if (self.opts.maxLength > 0 && str.length > self.opts.maxLength) {
            if (errorEle.length == 0) {
                self.$element.append('<label id="' + self.id + '-error" class="error">输入组最大长度为 ' + self.opts.maxLength + '</label>');
                self.$element.focus();
                self.$element.find('.bs-boxes').css('border-color', '#a94442');
            }
        } else {
            valid = true;
            if (errorEle.length > 0) {
                self.$element.find('.bs-boxes').css('border-color', '#ddd');
                errorEle.remove();
            }
        }
        return {
            valid : valid,
            values : str
        };
    };

    $.fn.inputGroup = function(options){
        return new InputGroup(this, options);
    };

})(jQuery);
