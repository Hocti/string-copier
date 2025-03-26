import * as vscode from "vscode";

function findLastQuote(
  input: string,
  position: number,
  findChar: string
): number {
  let inEscape = false;
  for (let i = position; i >= 0; i--) {
    const char = input[i];
    if (char === findChar && !inEscape) {
      return i + 1;
    }
    inEscape = input[i - 2] === "\\";
  }
  return -1; // Return -1 if no quote is found
}

function findNextQuote(
  input: string,
  position: number,
  findChar: string
): number {
  let inEscape = false;
  for (let i = position; i <= input.length; i++) {
    const char = input[i];
    if (char === findChar && !inEscape) {
      return i;
    }
    inEscape = char === "\\"; // && !inEscape;
  }
  return -1; // Return -1 if no quote is found
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "string-copier.copyString",
    (uri?: vscode.Uri) => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      const selection = editor?.selection?.active;
      if (!selection) {
        return;
      }
      const lineText = editor.document.lineAt(selection.line).text;

      const stringContent = (() => {
        const char = ['"', "'", "`"];
        const ranges: Record<string, { start: number; end: number }> = {};
        for (let c of char) {
          ranges[c] = {
            start: findLastQuote(lineText, selection.character, c),
            end: findNextQuote(lineText, selection.character, c),
          };
        }
		let longestString='';
        for (let c of char) {
          if (ranges[c].start !== -1 && ranges[c].end !== -1) {
            //console.log('found',c,`~${lineText.substring(ranges[c].start,ranges[c].end)}~`);
			const currString=lineText.substring(ranges[c].start, ranges[c].end);
			if(currString.length>longestString.length) longestString=currString;
          }
        }
        return longestString;
      })();

      if (stringContent) {
        vscode.env.clipboard.writeText(stringContent).then(
          () => {
            vscode.window.showInformationMessage(`Copied[${stringContent}]`);
          },
          (error: any) => {
            vscode.window.showErrorMessage(`Failed to copy: ${error}`);
          }
        );
      }
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
