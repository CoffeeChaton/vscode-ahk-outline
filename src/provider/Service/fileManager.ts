/* eslint-disable immutable/no-mutation */
/* eslint-disable promise/avoid-new */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-magic-numbers */
/* eslint-disable immutable/no-this */
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export const enum EFileModel {
    WRITE = 1,
    APPEND = 2,
}

export function checkAndMkdir(pathA: string): void {
    if (!fs.existsSync(pathA)) fs.mkdirSync(pathA);
}

export function FileManagerRecord(fileName: string, content: string, model: EFileModel): string {
    const ahkRootPath = vscode.workspace.workspaceFolders;
    const storagePath: string | null = ahkRootPath ? ahkRootPath[0].uri.fsPath : null;

    if (!storagePath) {
        const message = 'Please open program to debug --96--47--21--by neko-help';
        console.log(message);
        throw new Error(message);
    }

    const recordPath = `${storagePath}/${fileName}`;
    checkAndMkdir(storagePath);
    checkAndMkdir(path.resolve(recordPath, '..'));

    if (model === EFileModel.WRITE) {
        fs.writeFileSync(recordPath, content, { encoding: 'utf8' });
    } else {
        fs.appendFileSync(recordPath, content, { encoding: 'utf8' });
    }
    return recordPath;
    // return new Promise<string>((resolve) => {
    //     checkAndMkdir(storagePath);
    //     checkAndMkdir(path.resolve(recordPath, '..'));

    //     if (model === EFileModel.WRITE) {
    //         fs.writeFileSync(recordPath, content, { encoding: 'utf8' });
    //     } else {
    //         fs.appendFileSync(recordPath, content, { encoding: 'utf8' });
    //     }
    //     resolve(recordPath);
    // });
}
