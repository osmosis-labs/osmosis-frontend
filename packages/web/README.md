# @osmosis-labs/web

This package contains the Next.js web server and all UI code for the frontend.

### Analyze

View the size of the various webpack bundles on both the server and the client.

At the root of the repo or package:

```bash
yarn analyze
```

On completion, two local html files containing visual bundle trees for client and server code will appear in your default browser.

### Frontier

Frontier mode is managed by the `NEXT_PUBLIC_IS_FRONTIER=true` env var.
