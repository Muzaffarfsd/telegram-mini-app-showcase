# AI consultant: demonstration mode

The header chat is a local, explicitly labelled demonstration by default. Its example replies and attached images stay in the browser; images are not persisted in chat history. The demonstration and the previous live chat use separate local storage keys.

The client does not call the AI chat, speech, or follow-up endpoints in demonstration mode. The server also rejects provider-backed chat, speech, voice-list, and follow-up requests unless `WEB4TG_AI_PROVIDER_ENABLED=true` is explicitly configured. This prevents a direct request from using a provider while the application is in demonstration mode.

Connecting a real provider is a separate task. It requires a server-side integration and credentials, a review of the existing Gemini prompt and commercial claims, billing limits, follow-up authorization, and end-to-end tests against the selected provider. The legacy Gemini prompt includes claims that require verification and must not be reused as-is. `VITE_AI_CHAT_MODE=live` enables the client-side live path at build time; it does not enable the server or connect Qwen on its own. Never put an API key in a `VITE_` variable or client code.

Before enabling live chat, also add authenticated per-user usage limits and reconcile image upload limits: the current server uses the default JSON body limit, while the client allows images up to 4 MiB. Review follow-up authorization before enabling outbound messages. Demonstration mode does not upload the selected image.

Checks:

- `node tests/ai-header-chat.demo.mobile.e2e.cjs` against a local default-mode Vite server.
- `VITE_AI_CHAT_MODE=live` on a separate Vite server, then `node tests/ai-header-chat.mobile.e2e.cjs`; provider responses are mocked.
- `npx tsx tests/ai-provider-disabled.e2e.mts` checks the server's default-off behavior and provider errors without credentials.
