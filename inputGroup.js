/**
 * Created by Feng Hao on 2016/9/2.
 */


(function ($) {
  'use strict';

  var defaults = {
    header: '',
    /**
     * 输入组的转为字符串后的最大长度
     * default: 0 不做验证
     */
    maxLength: 0,
    /**
     * 最多输入组数
     * default: 0 不做限制
     */
    maxGroup: 0,
    domFormWrap: '<div class="form-horizontal"></div>',
    domFormGroupWrap: '<div class="form-group"></div>',
    domInputWrap: '<div class="col-sm-3"></div>',
    domLabel: { // label DOM
      cssClass: 'col-sm-2 control-label'
    },
    domInput: { // input DOM
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
    initValues: null,
    /**
     * 输入框列数. 默认2列. 需要同时修改样式.
     */
    column: 2
  };

  var InputGroup = function (element, options) {
    var self = this;
    self.$element = element;
    self.id = element.attr('id');
    if (typeof self.id == 'undefined') {
      self.id = 'i_' + random(1, 1000000);
      element.attr('id', self.id);
    }
    self.index = 0;
    self.count = 0;
    self.opts = $.extend(true, {}, defaults, options);
    if (self.opts.maxGroup < 0) {
      self.opts.maxGroup = 0;
    }
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

  function render(inputGroup, preBox, values) {
    var self = inputGroup;
    var opts = self.opts;
    if (!$.isArray(opts.groupRules) || !opts.groupRules.length) {
      return;
    }

    var box = $('<div class="bs-boxes" data-index="' + self.index + '"></div>');

    for (var i = 0; i < opts.groupRules.length; i += opts.column) {
      var formGroup = $(opts.domFormGroupWrap);

      for (var j = i; j < i + opts.column && j < opts.groupRules.length; j++) { //每行column个输入框
        var rule = opts.groupRules[j];
        var inputId = self.id + '_' + rule.inputName + '_' + self.index;
        //jquery-validation 需要name属性不同
        var inputName = inputId;
        self.rules[inputName] = rule;
        var inputWrap = $(opts.domInputWrap);
        var value;
        if (typeof values == 'undefined' || typeof values[rule.inputName] == 'undefined') { //如果未传入初始values值，设置默认为空字符串
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
        if (typeof rule.isHidden !== 'undefined' && rule.isHidden) { //需要隐藏，跳过当前元素
          inputEle = $('<input class="' + rule.inputName + '" id="' + inputId +
            '" name="' + inputName + '" type="hidden" placeholder="' + rule.label + '" value="' + value + '" hidden>');
          formGroup.append(inputEle);
          i++;
        } else {
          //添加label
          formGroup.append('<label for="' + inputId + '" class="' + opts.domLabel.cssClass + '">' + rule.label + '</label>');

          if (rule.type === 'select') {
            var option = '<option value="">请选择</option>';

            $.each(rule.data, function (i, item) {
              var itemKey, itemValue
              if (typeof item === 'string') {
                itemKey = item;
                itemValue = item;
              } else {
                itemKey = item.key;
                itemValue = item.value;
              }
              option += '<option value="' + itemKey + '" ';
              if (value == itemKey) {
                option += 'selected';
              }
              option += '>' + itemValue + '</option>';
            });
            inputEle = $('<select class="' + opts.domInput.cssClass + ' ' + rule.inputName + '" id="' + inputId +
                '" data-value="' + value +  '" name="' + inputName + '" ' + rule.attributes + '>' + option + '</select>');
          } else {
            var type = 'text';
            if (rule.type) {
              var pair = rule.type.split('-');
              if (pair.length === 2) {
                type = pair[1];
              }
            }
            inputEle = $('<input class="' + opts.domInput.cssClass + ' ' + rule.inputName + '" id="' + inputId +
              '" name="' + inputName + '" type="' + type + '" placeholder="' + rule.label + '" value="' + value + '" ' +
              rule.attributes + '>');
          }

          //添加事件
          if ($.isArray(rule.events) && rule.events.length > 0) {
            $.each(rule.events, function (index, item) {
              inputEle.on(item.event, item.handler);
            });
          }

          inputWrap.append(inputEle);
          formGroup.append(inputWrap);
        } // end render input element
      }

      box.append(formGroup);
    }

    if (self.opts.maxGroup !== 1) {
      var deleteBtn = $('<span class="btn-right-bottom btn-right-bottom-second btn-danger btn-delete">删除</span>');
      var addBtn = $('<span class="btn-right-bottom btn-right-bottom-first btn-primary btn-add">添加</span>');
      deleteBtn.on('click', function () {
        if (box.siblings('.bs-boxes').length == 0) {
          box.find('input,select').val('');
          self.$element.trigger('ig.clear', box.data('index'));
        } else {
          box.remove();
          self.$element.trigger('ig.del', box.data('index'));
          self.count--;
          deleteBtn.off('click')
        }
      });
      addBtn.on('click', function () {
        if (self.opts.maxGroup === 0 || self.count < self.opts.maxGroup) {
          render(self, box);
          self.$element.trigger('ig.add', self.index - 1);
        } else {
          alert('当前组数已达最大组数: ' + self.opts.maxGroup);
        }
      });
      var btnGroup = $('<div class="zero-right-bottom"></div>');
      btnGroup.append(deleteBtn).append(addBtn);
      box.append(btnGroup);
    }

    if (preBox) {
      preBox.after(box);
    } else {
      self.form.append(box);
    }
    self.index++;
    self.count++;
  }

  // 初始化
  InputGroup.prototype.init = function (values) {
    var self = this;
    var opts = self.opts;
    var initValues = values || opts.initValues;
    if (typeof initValues === 'string') {
      initValues = JSON.parse(initValues);
    }
    var valueIsArray = $.isArray(initValues);
    if (opts.maxGroup === 1) {
      var value = initValues;
      if (valueIsArray) {
        value = initValues[0] || {};
      }
      render(self, null, value);
      self.$element.trigger('ig.add', self.index - 1);
      self.$element.trigger('ig.init', self.index - 1);
      self.$element.trigger('ig.initValue', self.index - 1);
    } else if (valueIsArray && initValues.length > 0) {
      $.each(initValues, function (i, value) {
        if (opts.maxGroup === 0 || i < opts.maxGroup) {
          render(self, null, value);
          self.$element.trigger('ig.add', self.index - 1);
          self.$element.trigger('ig.init', self.index - 1);
          self.$element.trigger('ig.initValue', self.index - 1);
        }
      });
    } else {
      render(self);
      self.$element.trigger('ig.add', self.index - 1);
      self.$element.trigger('ig.init', self.index - 1);
    }
  };

  InputGroup.prototype.setInputValues = function (values) {
    this.clear();
    this.init(values);
  };

  InputGroup.prototype.clear = function () {
    var self = this;
    var element = self.$element;
    self.rules = {}
    self.count = 0;
    self.index = 0;
    element.find('.bs-boxes').each(function () {
      $(this).remove()
    });
  };

  InputGroup.prototype.getInputValues = function () {
    var self = this;
    var element = self.$element;

    var array = [];
    element.find('.bs-boxes').each(function () {
      var item = {};
      var length = 0;
      $(this).find('input,select').each(function () {
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

  InputGroup.prototype.getValuesAsString = function () {
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
      valid: valid,
      array: array,
      values: str
    };
  };

  $.fn.inputGroup = function (options) {
    return new InputGroup(this, options);
  };

})(jQuery);