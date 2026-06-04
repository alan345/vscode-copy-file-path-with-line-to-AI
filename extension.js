const vscode = require("vscode");
const nodePath = require("path");

/** @type {vscode.OutputChannel} */
let output;

/**
 * Given a selection, return the inclusive 0-based range of fully/partially
 * covered lines: { startLine, endLine }.
 *
 * A gutter line-number click/drag selects from the start of the first line to
 * the START of the line after the last. In that case selection.end sits at
 * character 0 of a line that is NOT actually part of the selection, so we pull
 * the end line back by one.
 * @param {vscode.Selection} selection
 */
function selectedLineRange(selection) {
  const startLine = selection.start.line;
  let endLine = selection.end.line;

  if (endLine > startLine && selection.end.character === 0) {
    endLine -= 1;
  }

  return { startLine, endLine };
}

/**
 * Build the clipboard string from the configured format and a line range.
 * @param {vscode.TextEditor} editor
 * @param {vscode.Selection} selection
 */
function buildClipboardText(editor, selection) {
  const config = vscode.workspace.getConfiguration("copyFileAndLine");
  const useRelative = config.get("useRelativePath", true);

  const { startLine, endLine } = selectedLineRange(selection);
  const isRange = endLine > startLine;

  const format = isRange
    ? config.get("rangeFormat", "${path}:${startLine}-${endLine}")
    : config.get("format", "${path}:${line}");

  const uri = editor.document.uri;
  const absPath = uri.fsPath;

  let path = absPath;
  if (useRelative) {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (folder) {
      path = nodePath.relative(folder.uri.fsPath, absPath);
    }
  }

  const relativePath = vscode.workspace.asRelativePath(uri, false);
  const fileName = uri.path.split("/").pop() || "";

  // 1-based for humans.
  const start1 = startLine + 1;
  const end1 = endLine + 1;
  const column = selection.active.character + 1;

  // ${lineText} is the full text of the covered lines.
  const lineTextRange = new vscode.Range(
    startLine,
    0,
    endLine,
    editor.document.lineAt(endLine).text.length
  );
  const lineText = editor.document.getText(lineTextRange);

  return format
    .replace(/\$\{path\}/g, path)
    .replace(/\$\{relativePath\}/g, relativePath)
    .replace(/\$\{fileName\}/g, fileName)
    .replace(/\$\{startLine\}/g, String(start1))
    .replace(/\$\{endLine\}/g, String(end1))
    .replace(/\$\{line\}/g, String(start1))
    .replace(/\$\{column\}/g, String(column))
    .replace(/\$\{lineText\}/g, lineText);
}

/**
 * Copy file + line (or line range) to the clipboard for a selection.
 * @param {vscode.TextEditor} editor
 * @param {vscode.Selection} selection
 */
async function copyForSelection(editor, selection) {
  const text = buildClipboardText(editor, selection);
  await vscode.env.clipboard.writeText(text);
  vscode.window.setStatusBarMessage(`Copied: ${text}`, 2500);

  const time = new Date().toLocaleTimeString();
  output.appendLine(`[${time}] Copied: ${text}`);
  // Reveal the Output panel without stealing focus from the editor.
  output.show(true);
}

/**
 * Detect a selection produced by clicking/dragging gutter line numbers: it
 * starts at column 0 and spans one or more WHOLE lines. Returns true for both
 * a single full line and a multi-line full-line block.
 * @param {vscode.Selection} selection
 * @param {vscode.TextDocument} document
 */
function isFullLineSelection(selection, document) {
  const start = selection.start;
  const end = selection.end;

  if (start.character !== 0) {
    return false;
  }

  // One or more whole lines: selection ends at the start of a later line.
  if (end.line > start.line && end.character === 0) {
    return true;
  }

  // Last line of the file: there is no "start of next line", so the selection
  // ends at the end of the line's text instead.
  const lastLineIndex = document.lineCount - 1;
  if (
    end.line === lastLineIndex &&
    end.character === document.lineAt(lastLineIndex).text.length &&
    end.character > 0 &&
    // Either a single last line, or a block ending on the last line.
    end.line >= start.line
  ) {
    // Guard against an ordinary in-line selection that happens to reach EOL on
    // a single line: require it to actually be the whole line (starts at col 0,
    // already checked) — a single-line full selection is valid here.
    return true;
  }

  return false;
}

function activate(context) {
  output = vscode.window.createOutputChannel("Copy File and Line");
  context.subscriptions.push(output);
  output.appendLine("Copy File and Line activated. Click a line number to copy.");

  // Command: copy for the current selection (also bound to a keyboard shortcut).
  context.subscriptions.push(
    vscode.commands.registerCommand("copyFileAndLine.copy", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      await copyForSelection(editor, editor.selection);
    })
  );

  // Command: toggle the click-to-copy behavior on/off.
  context.subscriptions.push(
    vscode.commands.registerCommand("copyFileAndLine.toggle", async () => {
      const config = vscode.workspace.getConfiguration("copyFileAndLine");
      const current = config.get("enableClickToCopy", true);
      await config.update(
        "enableClickToCopy",
        !current,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        `Copy File and Line: click-to-copy ${!current ? "enabled" : "disabled"}.`
      );
    })
  );

  // Detect line-number clicks/drags via full-line mouse selections.
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(async (event) => {
      const config = vscode.workspace.getConfiguration("copyFileAndLine");
      if (!config.get("enableClickToCopy", true)) {
        return;
      }
      if (event.kind !== vscode.TextEditorSelectionChangeKind.Mouse) {
        return;
      }
      if (event.selections.length !== 1) {
        return;
      }

      const selection = event.selections[0];
      const editor = event.textEditor;

      if (isFullLineSelection(selection, editor.document)) {
        await copyForSelection(editor, selection);
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
