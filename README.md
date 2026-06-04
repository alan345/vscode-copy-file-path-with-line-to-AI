# Copy File and Line

A tiny VS Code extension: **click a line number in the gutter** and the file path + line number lands on your clipboard (e.g. `src/app.js:42`). Paste it straight into Claude, Codex, or any AI assistant.

---

## 1. Why this is useful

When you work with an AI coding assistant (Claude, Codex, Cursor, etc.), **the single most valuable thing you can give it is a precise location in your codebase.**

> "Look at `src/auth/session.js:142` — why does the token expire early?"

is far better than pasting a vague description or a wall of code. Referencing the exact file and line:

- **Saves time** — no scrolling, no copy-pasting big blocks, no describing where the code lives. One click, one paste.
- **Makes the AI more accurate** — the model knows *exactly* which line you mean, so its answer is grounded in the right place instead of guessing.
- **Keeps your prompt clean** — `path:line` is short, unambiguous, and easy for the AI to resolve against the repo it already has access to.
- **Works for ranges too** — select several lines and you get `src/app.js:42-58`, perfect for pointing at a whole function or block.

The problem: VS Code has **no built-in "copy this line's location" gesture**. You normally have to read the line number, type out the path, and stitch them together by hand. This extension removes that friction entirely — **click the line number, paste into the AI.** That's the whole loop.

### How it works under the hood

VS Code doesn't expose a "line number was clicked" event. But clicking a line number in the gutter selects the **entire line** with the mouse. This extension watches for that exact gesture (a full-line mouse selection via `onDidChangeTextEditorSelection`) and copies the location for you.

---

## 2. Getting started (new users)

### Install the extension

The packaged extension ships as a `.vsix` file in this repo. Install it with the `code` CLI:

```bash
code --install-extension copy-file-and-line-0.0.1.vsix
```

> Don't have the `code` command? In VS Code open the Command Palette (`Cmd/Ctrl+Shift+P`) and run **"Shell Command: Install 'code' command in PATH"**, then re-run the line above. Alternatively, in VS Code go to the **Extensions** view → `…` menu → **Install from VSIX…** and pick the file.

Reload VS Code when prompted. That's it.

### Use it

1. Open any file.
2. **Click a line number** in the left-hand gutter.
3. The path + line is now on your clipboard — you'll see a confirmation in the status bar and in the **"Copy File and Line"** output panel.
4. Paste it into your AI assistant.

To copy a **range**, click-drag across several line numbers (or select multiple full lines). You'll get `path:start-end`.

### Other ways to copy

- **Keyboard:** put your cursor on a line and press `Cmd+Alt+C` (macOS) / `Ctrl+Alt+C` (Windows/Linux).
- **Command Palette:** run **"Copy File and Line"**.

### Settings

Open Settings (`Cmd/Ctrl+,`) and search for **Copy File and Line**:

| Setting | Default | Description |
| --- | --- | --- |
| `copyFileAndLine.enableClickToCopy` | `true` | Copy when you click a line number. Toggle quickly via the **"Copy File and Line: Toggle Click-to-Copy"** command. |
| `copyFileAndLine.format` | `${path}:${line}` | Output format for a single line. Tokens: `${path}`, `${relativePath}`, `${fileName}`, `${line}`, `${column}`, `${lineText}`. |
| `copyFileAndLine.rangeFormat` | `${path}:${startLine}-${endLine}` | Output format when multiple lines are selected. Tokens: `${path}`, `${relativePath}`, `${fileName}`, `${startLine}`, `${endLine}`, `${lineText}`. |
| `copyFileAndLine.useRelativePath` | `true` | Resolve `${path}` relative to the workspace folder (recommended — AI assistants resolve repo-relative paths best). |

**Caveat:** because the trigger is "a full-line mouse selection," selecting a whole line by dragging across the text will also copy. That's the only reliable signal VS Code exposes for gutter clicks. If you'd rather have an explicit-only trigger, disable click-to-copy and use the keybinding.

### Run from source (for development)

If you cloned the repo and want to try changes live without packaging:

1. Open this folder in VS Code.
2. Press `F5` (Run → "Run Extension") — a new **Extension Development Host** window opens with the extension loaded.
3. Click line numbers in that window to test.

Or from the terminal:

```bash
./run-local.sh            # opens this repo in a dev host
./run-local.sh /some/dir  # opens another folder to test against
```

---

## 3. Deploying a new version

Follow these steps to cut and publish a new release.

### a. Bump the version

Update the `version` field in [`package.json`](package.json) (follow [semver](https://semver.org/) — e.g. `0.0.1` → `0.0.2`).

### b. Package the `.vsix`

You need [`vsce`](https://github.com/microsoft/vscode-vsce), the official VS Code Extension packaging tool:

```bash
npm install -g @vscode/vsce   # one-time install
vsce package                  # produces copy-file-and-line-<version>.vsix
```

This generates a new `.vsix` named after the version you set in step (a). Commit the new `.vsix` if you distribute it through the repo.

### c. Test the packaged build

Always install and smoke-test the artifact before shipping:

```bash
code --install-extension copy-file-and-line-<version>.vsix
```

Reload VS Code and confirm clicking a line number still copies correctly.

### d. Publish to the VS Code Marketplace (optional)

To make it installable by anyone from the Marketplace:

1. Create a publisher and a Personal Access Token — see the [official publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
2. Make sure the `publisher` field in [`package.json`](package.json) matches your publisher ID (currently `Alan Szternberg`).
3. Publish:

   ```bash
   vsce login <publisher>     # one-time, paste your PAT
   vsce publish               # or: vsce publish <version>
   ```

### e. Tag the release on GitHub

```bash
git add package.json copy-file-and-line-<version>.vsix
git commit -m "Release v<version>"
git tag v<version>
git push && git push --tags
```

Then optionally create a GitHub Release and attach the `.vsix` so users can download it directly.

---

## License

MIT — see [LICENSE](LICENSE).

Repository: <https://github.com/alan345/vscode-copy-file-path-with-line-to-AI>
