/// <reference types="vite/client" />


// 为 CSS 模块添加类型声明
declare module '*.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}
