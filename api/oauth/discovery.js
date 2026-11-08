export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300')
  return res.status(200).json({
    issuer: 'https://www.midnightanime.bond',
    authorization_endpoint: 'https://www.midnightanime.bond/oauth/authorize',
    token_endpoint: 'https://www.midnightanime.bond/api/oauth/token',
    userinfo_endpoint: 'https://www.midnightanime.bond/api/oauth/userinfo',
    revocation_endpoint: 'https://www.midnightanime.bond/api/oauth/revoke',
    registration_endpoint: 'https://www.midnightanime.bond/api/oauth/apps',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
  })
}
