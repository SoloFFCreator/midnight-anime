import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
for (const file of ['lib/oauth.js', 'api/oauth/apps.js', 'api/oauth/authorize.js', 'api/oauth/token.js', 'api/oauth/userinfo.js', 'api/oauth/revoke.js', 'api/oauth/discovery.js', 'src/pages/OAuthPage.jsx', 'src/pages/OAuthAppsPage.jsx', 'src/pages/OAuthAuthorizePage.jsx']) assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${file} exists`)
const backend = read('lib/oauth.js')
assert.match(backend, /codeChallengeMethod !== 'S256'/)
assert.match(backend, /REDIRECT_URI_MISMATCH/)
assert.match(backend, /expiresAt: Date\.now\(\) \+ 5 \* 60 \* 1000/)
assert.match(backend, /secretHash: digest\(clientSecret\)/)
assert.match(read('src/pages/OAuthAppsPage.jsx'), /websiteUrl/)
assert.match(read('src/pages/OAuthAppsPage.jsx'), /redirectUris/)
assert.match(read('src/pages/OAuthPage.jsx'), /code_challenge_method/)
console.log('OAuth contract checks passed')
