# midnight-anime-cli

Official terminal client for testing the Midnight Anime API and supported streaming availability.

## Install

```bash
npm install --global midnight-anime-cli
```

The CLI requires Node.js 18 or newer.

## Sign in

```bash
midnight-anime login
```

The command starts a temporary callback on `127.0.0.1`, opens the official Midnight Anime CLI login page, and asks you to sign in with your existing account. After authentication, the browser sends a short-lived Firebase ID token to the waiting terminal callback. The CLI stores the session in:

```text
~/.config/midnight-anime/credentials.json
```

The directory is created with mode `0700` and the credentials file with mode `0600`. The token is never printed by the CLI. Run `midnight-anime logout` to remove it.

The CLI does not ask users to paste passwords or tokens into the terminal. The dedicated login page is:

```text
https://midnightanime.bond/cli/login
```

## Commands

```bash
midnight-anime whoami
midnight-anime search "Frieren"
midnight-anime catalogue trending
midnight-anime catalogue popular --json
midnight-anime anime 21
midnight-anime playback 21 1 1
midnight-anime playback 21 1 1 dub --json
midnight-anime logout
```

`playback` accepts a title ID, season, episode, and optional audio track (`sub`, `dub`, or `hindi`). The command requests availability data and does not expose a separate provider-branded player. Use `--json` when piping results into another terminal tool.

## Request timeout

```bash
midnight-anime search "One Piece" --timeout 30000
```

## Authentication behavior

CLI API calls send a bearer ID token and a CLI client marker. The API validates the token before serving CLI-identified requests. Browser and public documentation requests remain available through their normal public paths. If the session expires, run `midnight-anime login` again.

## Related packages

The CLI uses `midnight-anime-sdk` internally. Developers building their own applications can use the SDK directly instead of the terminal client.

All episodes and anime are distributed by Midnight Anime. Distributor: Midnight Anime Channel. Use the CLI for respectful testing and integrations, and review the official terms at https://midnightanime.bond/terms.
