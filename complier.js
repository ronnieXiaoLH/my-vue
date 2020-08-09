class Complier {
  // el 是宿主元素的选择器 #app
  // vm 是 KVue 的实例
  constructor(el, vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)

    // 开始编译
    this.complie(this.$el)
  }

  complie(el) {
    const childNodes = el.childNodes
    childNodes.forEach(node => {
      if (this.isElement(node)) {
        // 编译元素
        this.complieElement(node)
      }
      if (this.isInter(node)) {
        // 编译文本
        this.complieText(node)
      }

      if (node.childNodes && node.childNodes.length > 0) {
        // 递归
        this.complie(node)
      }
    })
  }

  isElement(node) {
    return node.nodeType === 1
  }

  // 插值表达式 {{xxx}}
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  update(node, exp, dir) {
    // 初始化
    // 获取对应的更新函数
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])

    // 更新操作
    new Watcher(this.$vm, exp, function (val) {
      fn && fn(node, val)
    })
  }

  textUpdater(node, value) {
    node.textContent = value
  }

  complieText(node) {
    this.update(node, RegExp.$1, 'text')
  }

  htmlUpdater(node, value) {
    node.innerHTML = value
  }

  modelUpdater(node, value) {
    // 赋值
    node.value = value
  }

  complieElement(node) {
    // 获取到元素的所有属性
    const nodeAttrs = node.attributes // 所有属性的集合
    Array.from(nodeAttrs).forEach(attr => {
      // 规定指令格式为 k-xx="oo"
      const attrName = attr.name // 属性名：k-xx
      const exp = attr.value // 属性值：oo
      // 如果是指令
      if (this.isDirective(attrName)) {
        const dir = attrName.slice(2)
        // 执行指令
        this[dir] && this[dir](node, exp)
      }

      // 如果是事件
      if (this.isEvent(attrName)) {
        const dir = attrName.slice(1)
        this.hendleEvent(node, exp, dir)
      }
    })
  }

  isDirective(attr) {
    return attr.indexOf('k-') === 0
  }

  isEvent(attr) {
    return attr.indexOf('@') === 0
  }

  // 编译 k-text 指令
  text(node, exp) {
    this.update(node, exp, 'text')
  }

  // 编译 K-html 指令
  html(node, exp) {
    this.update(node, exp, 'html')
  }

  // 编译 k-model 指令
  model(node, exp) {
    this.update(node, exp, 'model')
    // 事件监听
    node.addEventListener('input', e => {
      this.$vm[exp] = e.target.value
    })
  }

  // 编译事件
  hendleEvent(node, exp, dir) {
    const fn = this.$vm[exp]
    node.addEventListener(dir, fn.bind(this.$vm))
  }
}