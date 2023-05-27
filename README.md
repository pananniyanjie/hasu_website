# 开发请fork develop 分支 ,master分支将直接同步到服务器

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at 0.0.0.0:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## JSON API

### manifest.json

This file was placed in the root of static folder as `"_manifest.json"`. Avoidance of version pollution and overwritting by automation deployment, redirect it to another URL.

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  baseURL  |  `string`  |  The base URL for all AJAX requests.  |  `"/api"`  |
|  manifest  |  `string`  |  Redirect manifest file to another URL. Using AJAX.  |  `"/manifest.json"`  |
|  title  |  `string`  |  The title of the whole appliction.  |  `""`  |
|  pages  |  `Object <string, AxiosRequestConfig>`  |  Custom pages of the appliction. The key means the path of the page. The value means the request to load the data for the custom page. You can set dynamic arguments in the path of page, see [path-to-regexp](https://www.npmjs.com/package/path-to-regexp).  |  `{"/index":"/index.json"}`  |
|  videos  |  `AxiosRequestConfig`  |  The request to load the data for the video page.  |  `"/videos/:id.json"`  |
|  user-agreement  |  `AxiosRequestConfig`  |  The request to load the user agreement, should written with Markdown.  |  `"/user-agreement.md"`  |
|  rules  |  `Object <string, AxiosRequestConfig>`  |  Custom rules of the appliction. The key means the path of the page to show the rule which based on `"/rules/"`. The value means the request to load the data for the custom rules, all rules should written with Markdown.  |  `{"danmaku":"/rules/danmaku.md"}`  |
|  friends  |  `Array<LinkObject>`  |  The friend links  |  `[{"title":"星象馆","link":"https://liella.tv/"}]`  |
|  microsoft  |  `MicrosoftConfigObject`  |  The config of all tools from Microsoft. |  `{}`  |
|  google  |  `GoogleConfigObject`  |  The config of all tools from Google. |  `{}`  |

### page.json

The data for custom pages.

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  banner  |  `string`  |  The image URL of the banner.  |  `""`  |
|  title [^declared]  |  `string`  |  The title of the page.  |  `""`  |
|  heads  |  `NuxtHeadObject`  |  Set the elements in `<head></head>` of the page.  |  `{title:""}`  |
|  data  |  `CustomPageData`  | Datas shown in custom page.  |  `[]`  |

[^declared]: Use heads instead.

### video.json

The data for video pages.

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  title [^declared]  |  `string`  |  The title of the video page.  |  `""`  |
|  heads  |  `NuxtHeadObject`  |  Set the elements in `<head></head>` of the video page.  |  `{title:""}`  |
|  description  |  `string`  |  The description of the video, written with Markdown.  |  `""`  |
|  danmaku  |  `Object<string, AxiosRequestConfig>`  |  Danmakus of the video. The key means the method of the action, `"get"` or `"send"`. The value means the request to finish the action. Set the params named `"color"`, `"time"`, `"text"` and `"type"` in both params and data while sending.  |  `{}`  |
|  complain  |  `DanmakuComplainObject`  |  The complain config of the video.  |  `{}`  |
|  url  |  `string`  |  The URL of the video. |  `""`  |
|  poster  |  `string`  |  The URL of the video's poster. |  `""`  |
|  id  |  `string`  |  The ID of the video. |  `""`  |
|  report  |  `LinkObject`  |  Link for reporting, `"label"` or `"title"` is not support here. |  `"{}"`  |

[^declared]: Use heads instead.

## Custom Types

### AxiosRequestConfig

Can be a string of the URL requested, or the Request Config of Axios.

See [Request Config](https://www.npmjs.com/package/axios#request-config) of [Axios](https://www.npmjs.com/package/axios).

> ATTENTION
> 1. The URL should not contains the protocol, you should use `"//xxx.xxx/"` instead of `"http://xxx.xxx/"` or `"https://xxx.xxx/"`.
> 2. You can set dynamic arguments in the path of the URL, see [path-to-regexp
](https://www.npmjs.com/package/path-to-regexp).

### LinkObject

The link that can be clicked by users.

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  title[^declared]  |  `string`  |  The label of the link.  |  `"星象馆"`  |
|  label  |  `string`  |  The label of the link.  |  `"星象馆"`  |
|  link  |  `string`  |  The full URL which can be opened in a new tab.  |  `"//liella.tv/"`  |
|  to  |  `string`  |  The path which can be loaded in SPA.  |  `"/"`  |

[^declared]: Use label instead.

### NuxtHeadObject

The return value of the head method in Nuxt.js, see [The head Method](https://nuxtjs.org/docs/2.x/components-glossary/pages-head) of [Nuxt.js](https://nuxtjs.org).

### CustomPageData

> ATTENTION: This object based on two-dimensional array. All params above should contained in an object which contained in a two-dimensional array!
>> The first dimension means all datas in each item will be contained in different cards that with a shadow and round corners from the top of the page to the bottom of the page.
>
>> The second dimension means all datas in each item will be contained in one card from the top of the card to the bottom of the card. Any items in this dimension should be an object with params above means display a grid or a string `"divider"` means display a divider.

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  title  |  `string`  |  The title of this part.  |  `""`  |
|  divider  |  `boolean`  |  Display a divider under the title or not.  |  `false`  |
|  cols  |  `Object<String, int>`  |  The cols of the grid, with breakpoint as key.  |  `{"default":2}`  |
|  hide-in  |  `string`  |  Hide this part with a breakpoint. The part will always shown if this param is unset.  |  `"md"`  |
|  child-tag  |  `string`  |  The tag name of the element in each cell of the grid. Although you can use any `HTML Element`, any components of [BootstrapVue](https://bootstrap-vue.org/), [Vue.js](https://vuejs.org) or [Nuxt.js](https://nuxtjs.org) or any components in `/components/` folder, only `"liella-member-card"`, `"liella-card"`, or `"liella-button"` are recommended.  |  `"liella-card"`  |
|  prepend  | `Array<ComponentProp>`  |  The props of the element in each cell prepended before children.  |  `[{}]`  |
|  append  | `Array<ComponentProp>`  |  The props of the element in each cell appended after children.  |  `[{}]`  |
|  children  | `Array<ComponentProp> \| ComponentProp`  |  The props of the element in each cell of the grid.  |  `[{}] \| {}`  |
|  use-data  | `string`  |  Use datas in manifest  |  `"friends"`  |

### ComponentProp

An `<string, any>` object, key means the prop name, value means the prop value. 

Here are some special props:

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  title  |  `string`  |  The title on the content menu when the menu shown over the component. This prop is also a global attribute contains text representing advisory information related to the element it belongs to.  |  `""`  |
|  kaomoji  |  `string`  |  The kaomoji on the content menu when the menu shown over the component.  |  `"（ · 8 · ）"`  |

### DanmakuComplainObject

The complain config of the video.

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  reasons  |  `Array<string>`  |  The reasons abled of the complaintion.  |  `["违法违禁","色情低俗","恶意刷屏","赌博诈骗","人身攻击","侵犯隐私","垃圾广告","剧透","引战"]`  |
|  request  |  `AxiosRequestConfig`  |  The request to finish the complaintion. Set the params named `"cid"` and `"type"` in both params and data.  |  `"//liella.tv/"`  |

### MicrosoftConfigObject

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  clarity  |  `string`  |  The application id of Microsoft Clarity.  |  `""`  |

### GoogleConfigObject

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  analytics  |  `GoogleAnalyticsConfigObject`  |  The config id of Google Analytics.  |  `{}`  |

### GoogleAnalyticsConfigObject

|  Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  measurement-id  |  `string`  |  The measurement id of Google Analytics.  |  `""`  |

## Components

### liella-member-card

A card special to show members.

|  Prop Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  image  |  `string`  |  The URL of image of the member.  |  `""`  |
|  color  |  `string`  |  The image color of the member.  |  `""`  |
|  href  |  `string`  |  The URL that the hyperlink points to.  |  `""`  |
|  scale-inside  |  `boolean`  |  Zoom in the image only or the whole component when hover.  |  `true`  |

### liella-card

Simple card to show datas, based on Bootstrap card.

|  Prop Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  image  |  `string`  |  The URL of image at the head of the card.  |  `""`  |
|  title  |  `string`  |  The title shown on the card.  |  `""`  |
|  introduction  |  `string`  |  The introduction shown on the card.  |  `""`  |
|  href  |  `string`  |  The URL that the hyperlink points to.  |  `""`  |
|  to  |  `string`  |  Denotes the target route of the link.  |  `""`  |
|  overlay  |  `boolean`  |  Use the overlay style or not.  |  `true`  |
|  links  |  `Array<LinkObject>`  |  Links at the foot of the card.  |  `[]`  |

### liella-button

Simple button, based on Bootstrap button.

> `<liella-button>` supports all params of `LinkObject` as props.

|  Prop Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  variant  |  `string`  |  The variant of Bootstrap button.  |  `"secondary"`  |
|  size  |  `string`  |  The size of the button.  |  `""`  |
|  disabled  |  `boolean`  |  If the button disabled.  |  `true`  |

### liella-part

A card with no props and only one default slot.

### liella-divider

A divider with no props and slots.

### liella-banner

Banner.

|  Prop Name  |  Type  |  Description  |  Example  |
|  ----  |  ----  |  -----------  |  -------  |
|  src  |  `string`  |  The URL of image background.  |  `""`  |

|  Slot Name  |  Description  |
|  ----  |  -----------  |
|  default  |  Place elements or components inside here.  |
