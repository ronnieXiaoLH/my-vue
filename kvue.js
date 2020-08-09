function defineReactive(obj, key, val) {
  observe(val) // 递归

  // 创建一个 Dep 和 当前的 key 一一对应
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        // 通知更新
        dep.notify()
      }
      if (typeof newVal === 'object') {
        observe(newVal)
      }
    }
  })
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  new Observe(obj)
}

// 所谓代理，其实就是在 vm 上增加 $data 中的 key，所返回的值是 vm.$data 中的值
function proxy(vm, $data) {
  Object.keys(vm[$data]).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm[$data][key]
      },
      set(newVal) {
        vm[$data][key] = newVal
      }
    })
  })
}

class KVue {
  constructor(options) {
    // 保存选项
    this.$options = options
    this.$data = options.data
    this.$methods = options.methods
    // 数据响应式处理
    observe(this.$data)
    // 代理，方便访问 $data 中的数据
    proxy(this, '$data')

    proxy(this, '$methods')

    // 开始编译
    new Complier(options.el, this)
  }
}

// 根据对象的类型做不同的响应式处理
class Observe {
  constructor(value) {
    this.value = value

    if (typeof value === 'object') {
      this.walk(value)
    }
  }

  // 对象的响应式处理
  walk(obj) {
    Object.keys(obj).forEach(key => {
      // obj[key] 可能是一个对象
      defineReactive(obj, key, obj[key])
    })
  }

  // 数组的响应式处理，待补充
}

// 观察者，保存所有的更新函数，值发生变化时执行更新函数
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    // 给 Dep 设置一个静态属性 target 指向 Watcher 的实例，便于 Dep 中可以访问到 Watcher
    Dep.target = this
    this.vm[this.key] // 访问一次 data 的中的 key , 触发 getter
    Dep.target = null
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

// Dep: 依赖，管理 data 中某个 key 的所有 Watcher 实例，data 中 key 和 Dep 是一对一的关系，Dep 和 Watcher 是一对多的关系
class Dep {
  constructor() {
    this.watchers = []
  }

  addDep(watcher) {
    this.watchers.push(watcher)
  }

  notify() {
    this.watchers.forEach(watcher => watcher.update())
  }
}