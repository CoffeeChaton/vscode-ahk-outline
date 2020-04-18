
/* eslint-disable no-await-in-loop */
/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1,10000] }] */
import * as vscode from 'vscode';
import { Detecter } from '../core/Detecter';

export default class DefProvider implements vscode.DefinitionProvider {
    // eslint-disable-next-line no-unused-vars
    public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken)
        : Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[] | null> {
        const fileLink = await this.tryGetFileLink(document, position);
        if (fileLink) {
            return fileLink;
        }
        const methodLink = await this.tryGetMethodLink(document, position);
        if (methodLink) {
            if (methodLink.location.range.start.line === document.lineAt(position).lineNumber) {
                return Detecter.AhkFuncReference(document, position);
            }
            return new vscode.Location(methodLink.location.uri, methodLink.location.range.start);
        }

        // TODO return ahk Built-in func
        // for ()...
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    private async tryGetFileLink(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location | null> {
        const { text } = document.lineAt(position);
        const includeMatch = text.trim().match(/(?<=#include).+?\.(ahk|ext)\b/i);
        if (includeMatch) {
            const length = Math.max(document.uri.path.lastIndexOf('/'), document.uri.path.lastIndexOf('\\'));
            if (length <= 0) return null;
            const parent = document.uri.path.substr(0, length);
            const uri = vscode.Uri.file(includeMatch[0].replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parent));
            return new vscode.Location(uri, new vscode.Position(0, 0));
        }
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    private async tryGetMethodLink(document: vscode.TextDocument, position: vscode.Position)
        : Promise<vscode.SymbolInformation | null> {
        const { text } = document.lineAt(position);
        const word = document.getText(document.getWordRangeAtPosition(position)).toLowerCase();
        const wordReg = new RegExp(`\\b${word}\\(`, 'i');
        if (!wordReg.exec(text)) {
            return null;
        }
        for (const AhkFunc of await Detecter.getFuncList(document)) {
            if (AhkFunc.name.toLowerCase() === word) return AhkFunc;
        }
        for (const fileName of Detecter.getCacheFileUri()) {
            const tempDocument = await vscode.workspace.openTextDocument(fileName);
            for (const AhkFunc of await Detecter.getFuncList(tempDocument)) {
                if (AhkFunc.name.toLowerCase() === word) return AhkFunc;
            }
        }

        return null;
    }
}
