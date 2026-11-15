# public

The canonical fonts, favicon and social images. `base.css` in this kit names them at
`/fonts/...`, and the security policy is `font-src 'self'` — so every Worker that renders
a page serves its own copy from its own address.

Each serving repo keeps a copy at its own `public/` and points `assets.directory` there.
Change a file here and copy it to: ascend-gateway, ascend-marketing, ascend-admin,
ascend-tenant-portal, ascend-school-portal, ascend-school-website.
