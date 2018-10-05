"use strict";

import * as process from "process";
import * as vscode from "vscode";
import * as fs from "fs-extra";

const dirPath = `${process.env.HOME}/.vscode/jsnippet`;
const extension = "snippet";
const template = "console.log($1);";

const open = async (name: string, code: string = "") => {
  const path = `${dirPath}/${encodeName(name)}`;
  if (!fs.existsSync(path)) {
    await fs.outputFile(path, code);
  }

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path));
  vscode.window.showTextDocument(doc);
};

const encodeName = (name: string) => `${encodeURIComponent(name)}.${extension}`;

const decodeName = (name: string) =>
  decodeURIComponent(name.replace(new RegExp(`\.${extension}$`), ""));

const createSnippet = async () => {
  const name = await vscode.window.showInputBox({
    prompt: "Enter snippet name"
  });
  if (!name || name.length === 0) {
    return;
  }

  let code = null;
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    code = editor.document.getText(selection);
  }
  code = code || template;

  open(name, code);
};

const selectSnippet = async () => {
  const files = await fs.readdir(dirPath);
  const items = files
    .filter((i: string) => i.endsWith(`.${extension}`))
    .map(decodeName);
  return await vscode.window.showQuickPick(items);
};

const openSnippet = async () => {
  const name = await selectSnippet();
  if (!name) {
    return;
  }
  open(name);
};

const pasteSnippet = async () => {
  const name = await selectSnippet();
  if (!name) {
    return;
  }
  const path = `${dirPath}/${encodeName(name)}`;
  const code = await fs.readFile(path, "utf8");
  if (vscode.window.activeTextEditor) {
    await vscode.window.activeTextEditor.insertSnippet(
      new vscode.SnippetString(code)
    );
  }
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.jsnippet.createSnippet",
      createSnippet
    ),
    vscode.commands.registerCommand(
      "extension.jsnippet.openSnippet",
      openSnippet
    ),
    vscode.commands.registerCommand(
      "extension.jsnippet.pasteSnippet",
      pasteSnippet
    )
  );
}

export function deactivate() {}
