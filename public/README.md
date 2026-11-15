# public

The fonts, favicon and social images every surface serves at `/fonts/...`, `/favicon.ico`
and so on. They live here, not in an app, because `base.css` in this kit is what names
them — `font-src 'self'` in the security policy means each Worker must serve them from
its own address. Every Worker points its `assets.directory` at this folder:

```jsonc
"assets": { "directory": "./node_modules/@ascend/kit/public" }
```
