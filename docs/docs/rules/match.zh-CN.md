---
nav:
  title: 规则
  order: 2
order: 2
title: 规则
---

## 匹配规则

### 通配符匹配

通配符匹配能够比较简单的解决大部分比较复杂的诉求，包含通配符匹配，通配域名匹配

#### 通配符匹配

通配符匹配以 `^` 开头，`*` 为通配符，可以通过 `$1~$9` 匹配通配符匹配的分组，`$0` 表示整个 URL。

```
# 通配符匹配必须以 ^ 开头

# 访问 g.alicdn.com/abc/xyz/1.js 就会被映射到 /path/to/xyz/1.js
^g.alicdn.com/abc/***   /path/to/$1

# 也可以用 $ 限制结尾
# 只转发 index.js 结尾的 url
^g.alicdn.com/abc/***index.js$   /path/to/$1
```

- `*` 表示匹配到一个 `/` 就停下，而 `***` 表示匹配多个

#### 域名通配符

在域名中使用 `*` 不需要用 `^` 开头，例如我们用

```
*.com (test)
```

时就是匹配 `baidu.com bing.com` 等，但是不匹配 `www.baidu.com`。

而想要对所有子域名生效，可以用

```
***.com (test)
```

这样可以匹配 `xxx.yyy.baidu.com` 这样的域名

## 域名匹配

直接匹配域名，例如

```
test.com (test)

# 可以限定协议
http://test.com (test)

# 可以限定端口号
http://test.com:8000 (test)
```

## 路径匹配

也可以匹配路径下全部的请求，例如

```
test.com/test/ `(test)`

# 同样可以限定协议
http://test.com/test/ (test)
```

## 正则匹配

对于非常灵活的匹配规则，可以使用正则匹配。可以使用 /reg/ 匹配 URL。

```
# 匹配所有请求
/./ (test)

# 匹配url里面包含某个关键字的请求
/keyword/ (test)

# 通过正则匹配，同样的 $1~$9 捕获分组，$0 表示整个 URL
/(\d+).html/ (test)
```

> 更加完整的规则见 whistle 的文档：https://wproxy.org/whistle/pattern.html

