---
nav:
Title: rules
Order: 2
order: 2
title: Rules
---

## Matching rules

### Wildcard matching

Wildcard matching can easily solve most of the more complex claims, including wildcard matching, wildcard domain name matching

#### Wildcard matching

Wildcard matching starts with`^`,`*` is a wildcard, you can use`$ 1 ~ $ 9` to match wildcard matching groups, and` $ 0` means the entire URL.

```
# Wildcard matching must start with ^

# Visit g.alicdn.com/abc/xyz/1.js and it will be mapped to /path/to/xyz/1.js
^ g.alicdn.com / abc / *** / path / to / $ 1

# You can also use $ to limit the end
# Only forward URLs ending in index.js
^ g.alicdn.com / abc / *** index.js $ / path / to / $ 1
```

-`*` Means stop when matching a`/`, and`***` means match multiple

#### Domain Name Wildcard

The use of`*` in the domain name does not need to start with`^`, for example, we use

```
* .com (test)
```

The time is to match`baidu.com bing.com` etc., but not` www.baidu.com`.

And if you want to take effect for all subdomains, you can use

```
***. com (test)
```

This matches domain names like`xxx.yyy.baidu.com`

## Domain matching

Match domain names directly, for example

```
test.com (test)

# Can limit the agreement
http://test.com (test)

# Port number can be limited
http://test.com:8000 (test)
```

## Path matching

It can also match all requests under the path, for example

```
test.com/test/ (test)

# The agreement can also be limited
http://test.com/test/ (test)
```

## Regular match

For very flexible matching rules, regular matching can be used. You can use / reg / to match URLs.

```
# Match all requests
/./ (test)

# Match the request that contains a keyword in the url
/ keyword / (test)

# Through regular matching, the same $ 1 ~ $ 9 capture group, $ 0 means the entire URL
/(\d+).html/ (test)
```

> For more complete rules, see the whistle documentation: https://wproxy.org/whistle/pattern.html