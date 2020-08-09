// 数组的响应式操作：数组的原始方法无法通知更新，因此我们要覆盖原始的方法，1：执行原始的方法 2：通知更新
const originProto = Array.prototype
// 备份数组的原型，修改备份
const arrayProto = Object.create(originProto)
// 覆盖数组的 7 个方法
const arr = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']
arr.forEach(method => {
  // 覆盖原始方法
  arrayProto[method] = function () {
    // 执行方法
    originProto[method].apply(this, arguments)
    // 通知更新
    console.log('数组执行：' + method + '方法', arguments)
  }
})


// 对象的响应式操作
function defineReactive(obj, key, val) {
  observe(val) // 递归
  Object.defineProperty(obj, key, {
    get() {
      console.log('get ' + key)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        console.log('set ', key, newVal)
        val = newVal
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

  // 判断传入的 obj 的类型，对象或数组
  if (Array.isArray(obj)) {
    // 覆盖原型
    obj.__proto__ = arrayProto
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i])
    }
  } else {
    Object.keys(obj).forEach(key => {
      // obj[key] 可能是一个对象
      defineReactive(obj, key, obj[key])
    })
  }
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

let obj = {
  foo: 'foo',
  bar: 'bar',
  a: {
    b: 1
  },
  arr: [1, 2, 3]
}

observe(obj)

obj.foo
obj.foo = 'fooooooooo'
obj.bar
obj.bar = 'barrrrrrrr'
obj.a.b = 10

obj.a = {
  b: 100
}
obj.a.b = 1000

set(obj, 'dong', 'dong')
obj.dong

// defineProperty 对数组无效
obj.arr.push(4)

console.log(obj.arr)