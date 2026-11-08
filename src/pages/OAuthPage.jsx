import { Link } from 'react-router-dom'
import PublicPageShell, { InfoCard } from '../components/PublicPageShell'

const authExample = `const params = new URLSearchParams({
  client_id: 'ma_client_…',
  redirect_uri: 'https://your-app.com/auth/callback',
  response_type: 'code',
  scope: 'openid profile email',
  state: crypto.randomUUID(),
  code_challenge: base64url(sha256(verifier)),
  code_challenge_method: 'S256',
})
window.location.href = 'https://www.midnightanime.bond/oauth/authorize?' + params`
const tokenExample = `const token = await fetch('https://www.midnightanime.bond/api/oauth/token', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    client_id, client_secret, code, redirect_uri,
    code_verifier: verifier,
  }),
})`
export default function OAuthPage() {
  return <PublicPageShell eyebrow="Developer identity / OAuth 2.0" title="Let users sign in with Midnight Anime." intro="Connect your website or application to Midnight Anime through a familiar authorization-code flow. Users approve access on Midnight Anime, and your app receives a short-lived code instead of a password.">
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><section className="relative overflow-hidden rounded-[2rem] border border-or/25 bg-gradient-to-br from-or/15 via-white/[.035] to-fuchsia-500/10 p-6 shadow-2xl sm:p-10"><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-or">Identity platform</p><h2 className="mt-4 max-w-2xl font-display text-3xl font-black sm:text-5xl">A controlled handoff, not a password shortcut.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">Midnight Anime OAuth uses exact registered redirects, PKCE S256, one-time authorization codes, encrypted-in-transit callbacks, scoped consent, and revocable tokens.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/oauth/apps" className="rounded-full bg-or px-5 py-3 text-sm font-bold text-white hover:bg-[#ff8126]">Create OAuth app</Link><a href="#quickstart" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/75 hover:border-or hover:text-or">View quick start</a></div></section><aside className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"><InfoCard title="Authorization code" icon={<span className="font-mono text-sm font-bold">01</span>}>The browser returns a short-lived code. Your backend exchanges it for tokens.</InfoCard><InfoCard title="PKCE required" icon={<span className="font-mono text-sm font-bold">02</span>}>Use S256 code challenges for web, mobile, and public clients.</InfoCard><InfoCard title="Scoped consent" icon={<span className="font-mono text-sm font-bold">03</span>}>Ask only for identity, profile, and email data your product needs.</InfoCard></aside></div>
    <section id="quickstart" className="mt-20 scroll-mt-24"><Heading eyebrow="01 / Register" title="Create a client ID and secret." text="Sign in to the developer console, enter your public website URL, and add every exact callback URL your app will use. The client secret is displayed only when created or rotated." /><Link to="/oauth/apps" className="mt-7 inline-flex rounded-full bg-or px-5 py-3 text-sm font-bold text-white">Open OAuth app console</Link></section>
    <section className="mt-20 grid gap-5 lg:grid-cols-2"><CodeBlock title="02 / Send the user to consent" code={authExample} /><CodeBlock title="03 / Exchange the callback code" code={tokenExample} /></section>
    <section className="mt-20"><Heading eyebrow="Endpoints" title="Predictable service addresses." text="You can also read the machine-readable discovery document from the endpoint below." /><div className="mt-8 grid gap-4 md:grid-cols-2">{[['Authorization', '/oauth/authorize', 'Browser consent page.'], ['Token', '/api/oauth/token', 'Code and refresh-token exchange.'], ['Userinfo', '/api/oauth/userinfo', 'Returns claims allowed by approved scopes.'], ['Revocation', '/api/oauth/revoke', 'Invalidate an access or refresh token.'], ['Discovery', '/api/oauth/discovery', 'Supported flows, scopes, and endpoint metadata.']].map(([name, path, description]) => <div key={path} className="rounded-2xl border border-white/[.08] bg-white/[.03] p-5"><p className="font-display text-lg font-bold">{name}</p><code className="mt-3 block break-all rounded-xl bg-black/30 px-3 py-2 font-mono text-xs text-or">https://www.midnightanime.bond{path}</code><p className="mt-3 text-sm text-white/50">{description}</p></div>)}</div></section>
    <section className="mt-20 rounded-3xl border border-or/25 bg-or/[.07] p-6 sm:p-8"><Heading eyebrow="Security rules" title="Treat OAuth credentials like production secrets." text="Keep client secrets on your server, validate state to prevent request forgery, use PKCE for public clients, compare the returned state, and only exchange codes over HTTPS. Never log authorization codes, access tokens, refresh tokens, or client secrets." /><div className="mt-6 grid gap-4 md:grid-cols-3"><Rule title="Exact callbacks" text="Redirect URI matching is strict. A different path, protocol, or port is rejected." /><Rule title="Short-lived codes" text="Authorization codes expire quickly and can only be used once." /><Rule title="User control" text="Users see the requested scopes before approval, and clients can rotate secrets." /></div></section>
  </PublicPageShell>
}
function Heading({ eyebrow, title, text }) { return <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-or">{eyebrow}</p><h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>{text && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{text}</p>}</div> }
function CodeBlock({ title, code }) { return <div className="rounded-3xl border border-white/[.08] bg-[#0d0b12] p-5 sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-or">{title}</p><pre className="mt-5 overflow-auto rounded-2xl border border-white/[.06] bg-black/40 p-4 font-mono text-[11px] leading-[1.8] text-white/70"><code>{code}</code></pre></div> }
function Rule({ title, text }) { return <div className="rounded-2xl border border-white/10 bg-black/20 p-5"><h3 className="font-display font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/55">{text}</p></div> }
