# Copy File and Line

A VS Code extension: **click a line number in the gutter** to copy the file path and line number to your clipboard (e.g. `src/app.js:42`).

## How it works

VS Code has no direct "line number clicked" event. But clicking a line number in the gutter selects the **entire line** with the mouse — this extension detects that exact gesture (`onDidChangeTextEditorSelection`) and copies the location.

## Try it

1. Open this folder in VS Code.
2. Press `F5` (or Run → "Run Extension"). A new **Extension Development Host** window opens.
3. Open any file in that window and **click a line number** in the gutter.
4. The path + line is now on your clipboard (you'll see a confirmation in the status bar).

## Other ways to copy

- **Keyboard:** `Cmd+Alt+C` (macOS) / `Ctrl+Alt+C` (Windows/Linux) copies the current cursor's location.
- **Command Palette:** `Copy File and Line`.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `copyFileAndLine.enableClickToCopy` | `true` | Copy when you click a line number. Toggle via the `Copy File and Line: Toggle Click-to-Copy` command. |
| `copyFileAndLine.format` | `${path}:${line}` | Output format. Tokens: `${path}`, `${relativePath}`, `${fileName}`, `${line}`, `${column}`, `${lineText}`. |
| `copyFileAndLine.useRelativePath` | `true` | Resolve `${path}` relative to the workspace folder. |

## Install permanently

Package it into a `.vsix` and install:

```bash
npm install -g @vscode/vsce
vsce package
code --install-extension copy-file-and-line-0.0.1.vsix
```

## Caveat

Because the trigger is "a full-line mouse selection," selecting an entire line by dragging across it will also copy. That's the only reliable signal the extension API exposes for gutter clicks. Disable click-to-copy and use the keybinding if you prefer an explicit trigger.
