import * as vscode from 'vscode';
import { EMode, TAhkSymbol } from '../globalEnum';
import { Pretreatment } from './Pretreatment';

function commentFix(commentText: string): string {
    return commentText !== ''
        ? `/**  \n  \n${commentText}  \n*/  \n`
        : '  \n'; // '/* not comment */  \n';
}

function getCommentText(textRaw: string): string {
    const textFix = textRaw.trimStart();
    return textFix.trimStart().startsWith(';')
        ? `${textFix.substring(1)}  \n`
        : '';
}

function getReturnText(lStr: string, textRaw: string): string {
    const col = lStr.search(/\breturn\b[\s,][\s,]*.+/i);
    if (col === -1) return '';

    let name = textRaw.substring(col).trim();
    const Func = (/^(\w\w*)\(/).exec(name);
    if (Func) {
        name = `${Func[1]}(...)`;
    } else if (name.indexOf('{') > -1 && name.indexOf(':') > -1) {
        const returnObj = (/^({\s*\w\w*\s*:)/).exec(name);
        if (returnObj) name = `obj ${returnObj[1]}`;
    }
    return `    ${name.trim()}\n`;
}

export function inCommentBlock2(textRaw: string, commentBlock: boolean): boolean {
    if (commentBlock) {
        if ((/^\s*\*\//).test(textRaw)) return false; // */
    } else if ((/^\s*\/\*\*/).test(textRaw)) {
        return true; // /**
    }
    return commentBlock;
}

type TSymbol = {
    AhkSymbol: TAhkSymbol;
    fsPath: string;
};

export async function setFuncHoverMD(mySymbol: TSymbol): Promise<vscode.MarkdownString> {
    const { AhkSymbol, fsPath } = mySymbol;
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(fsPath));
    if (AhkSymbol.kind !== vscode.SymbolKind.Function && AhkSymbol.kind !== vscode.SymbolKind.Method) {
        return new vscode.MarkdownString('just support Function/Method hover now', true);
    }
    // --set end---

    let commentBlock = false;
    let commentText = '';
    let returnList = '';
    const startLineBaseZero = AhkSymbol.range.start.line;
    const DocStrMap = Pretreatment(document.getText(AhkSymbol.range).split('\n'), startLineBaseZero);
    const starLine = 0;
    const endLine = DocStrMap.length;
    for (let line = starLine; line < endLine; line++) {
        const textRaw = DocStrMap[line].textRaw;
        commentBlock = inCommentBlock2(textRaw, commentBlock);
        if (commentBlock) {
            commentText += getCommentText(textRaw);
            continue;
        }
        returnList += getReturnText(DocStrMap[line].lStr, DocStrMap[line].textRaw);
    }

    const kindDetail = `(${EMode.ahkFunc}) ${AhkSymbol.detail}\n`;
    const title = `${document.getText(AhkSymbol.selectionRange)}{\n`;

    const commentText2 = commentFix(commentText);
    return new vscode.MarkdownString('', true)
        .appendCodeblock(kindDetail, 'ahk')
        .appendCodeblock(title, 'ahk')
        .appendCodeblock(returnList, 'ahk')
        .appendCodeblock('}\n', 'ahk')
        .appendMarkdown(commentText2);
}
