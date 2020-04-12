/* eslint-disable max-statements */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1] }] */
// eslint-disable-next-line import/no-unresolved
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
            return methodLink;
        }

        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    public async tryGetFileLink(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location | null> {
        const { text } = document.lineAt(position.line);
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
    public async tryGetMethodLink(document: vscode.TextDocument, position: vscode.Position)
        : Promise<vscode.Location | null> {
        const { text } = document.lineAt(position.line);
        const word = document.getText(document.getWordRangeAtPosition(position));
        const callReg = new RegExp(`\\b${word}\\(`);
        if (!callReg.exec(text)) {
            return null;
        }
        for (const AhkFunc of await Detecter.getFuncList(document)) {
            if (AhkFunc.name === word) return AhkFunc.location;
        }
        for (const fileUri of Detecter.getCacheFileUri()) {
            const tempDocument = await vscode.workspace.openTextDocument(fileUri);
            for (const AhkFunc of await Detecter.getFuncList(tempDocument)) {
                if (AhkFunc.name === word) return AhkFunc.location;
            }
        }
        return null;
    }
}
