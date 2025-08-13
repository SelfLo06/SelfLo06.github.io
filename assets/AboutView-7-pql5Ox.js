import{M as i,i as u,m as d,H as a,P as m}from"./index-DLMI4eWy.js";import{_ as g,l as p,r as h,m as _,c as f,f as v,j as r,n as b,u as k,F as H,h as j}from"./index-Cd21x-lw.js";import"./_commonjsHelpers-CqkleIqs.js";const S={class:"about-view card"},C=["innerHTML"],w={__name:"AboutView",setup(x){const o=p(),e=new i({html:!0,linkify:!0,breaks:!0,highlight:function(s,t){if(t&&a.getLanguage(t))try{return'<pre class="hljs"><code>'+a.highlight(s,{language:t,ignoreIllegals:!0}).value+"</code></pre>"}catch(l){console.warn("代码高亮失败:",l)}return'<pre class="hljs"><code>'+e.utils.escapeHtml(s)+"</code></pre>"}});e.use(u),e.use(d);const n=h(`
Hiii, 我是 selflo，一名来自**南京大学智能软件**的学生！ (^▽^)

| 技能 | 熟练度 | 备注 |
|------|--------|------|
| JavaScript | ⭐| 主要开发语言 |
| Vue.js | ⭐ | 前端框架 |
| Node.js | ⭐ | 后端开发 |

## 代码示例测试

这里是一些代码示例来测试代码块的主题切换功能：

\`\`\`javascript
// JavaScript 示例
function greetUser(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

greetUser('selflo');
\`\`\`

\`\`\`css
/* CSS 样式示例 */
.dark-theme {
  background-color: #1e1e1e;
  color: #e1e4e8;
}

.code-block {
  border-radius: 8px;
  padding: 1rem;
}
\`\`\`

这个博客诞生于我的大一暑假（2025.7.3 - 2025.7.8），是我给自己布置的一份复习和巩固知识的暑期作业，也是一个**从零开始，完全手写**(存疑)的项目。

在UI设计上，很大程度上参考了优秀的 Hexo 主题，并在此基础上进行了简化和二次创作。

说实话，建立这个博客的过程，大概是 90% 的 \`Ctrl+C\` + \`Ctrl+V\`，加上 10% 的灵感……而这 10% 的灵感，几乎全部来自于我强大的开发伙伴——**伟大的 Gemini**！在它的辅助下，整个开发过程充满了探索的乐趣。

我也不知道这个博客能更新多久~（笑，明明刚创建就说这种话）~，但真心希望它能记录下我的成长轨迹。

==总之，非常感谢你愿意点开我的博客来看！== ヾ(o´▽\`o)ﾉ
`),c=_(()=>e.render(n.value));return(s,t)=>(j(),f(H,null,[v(m,{title:"关于我","cover-image":"https://cdn.jsdelivr.net/gh/SelfLo06/MyImages@main/background.jpg"}),r("div",S,[r("div",{class:b(["content",{"dark-theme":k(o).theme==="dark"}]),innerHTML:c.value},null,10,C)])],64))}},L=g(w,[["__scopeId","data-v-fb050886"]]);export{L as default};
