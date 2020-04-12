import * as vscode from 'vscode';

export class FileProvider {
    public static createEditorListenr(): vscode.Disposable {
        return vscode.window.onDidChangeActiveTextEditor((e) => {
            if (e && e.document.languageId === 'ahk' && e.document.getText() === '') {
                vscode.commands.executeCommand('editor.action.insertSnippet', { name: 'AhkTemplate' });
            }
        });
    }
}
