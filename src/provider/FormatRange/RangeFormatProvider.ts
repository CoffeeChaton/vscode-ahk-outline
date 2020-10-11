/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1,2,100] }] */
import * as vscode from 'vscode';
import { inCommentBlock } from '../../tools/inCommentBlock';
import { inLTrimRange } from '../../tools/inLTrimRange';
import { getLStr, getSkipSign } from '../../tools/removeSpecialChar';
import { callDiff, DiffType } from '../../tools/Diff';
import { VERSION } from '../../globalEnum';

function showWarn(timeStart: number): void {
    const time = Date.now() - timeStart;
    vscode.window.showInformationMessage(`Format Selection is ${VERSION.formatRange}, ${time}ms`);
}
function textReplace(textElement: string): string {
    return textElement.replace(/ *, */g, ', ')
        .replace(/ *:= */g, ' := ')
        .replace(/ *!= */g, ' != ')
        // .replace(/ *== */g, ' == ') test err
        // .replace(/ *>= */g, ' >= ') test err
        // .replace(/ *<= */g, ' <= ') test err
        // TODO .replace(/ *== */g, ' == ')
        .replace(/ *\.= */g, ' .= ')
        .replace(/ *\+= */g, ' += ')
        .replace(/ *-= */g, ' -= ')
        .replace(/ *\|\| */g, ' || ')
        .replace(/ *&& */g, ' && ')
        .replace(/ *<> */g, ' <> ')
        .replace(/\breturn  */g, 'return ')
        .replace(/\bReturn  */g, 'Return ')
        // .replace(/ *\? */g, ' ? ')
        .replace(/\( */g, '(')
        .replace(/ *\)/g, ')')
        .replace(/\[ */g, '[')
        .replace(/ *\]/g, ']')
        .replace(/ *\{ */g, ' {')
        .replace(/ *\}/g, '}')
        .replace(/\}  */g, '} ') // TODO WTF double \s ?
        .replace(/\)\s*\{ */g, ') {')
        .replace(/\bif\s*\(/g, 'if (')
        .replace(/\bIf\s*\(/g, 'If (')
        .replace(/\bIF\s*\(/g, 'IF (')
        .replace(/\bwhile\s*\(/g, 'while (')
        .replace(/\bWhile\s*\(/g, 'While (')
        .replace(/\bWHILE\s*\(/g, 'WHILE (')
        .replace(/ *;/g, ' ;');// TODO options of ";"
    // \s === [ \f\n\r\t\v]
    // TODO more TEST & options
}
function fnLR(strElement: string): string {
    const LR = strElement.indexOf(';');
    if (LR === -1) return textReplace(strElement);
    if (LR === 0) return strElement;
    if (LR > 0) {
        const Left = strElement.substring(0, LR + 1);
        const Right = strElement.substring(LR + 1, strElement.length) || '';
        return textReplace(Left) + Right;
    }
    return strElement;
}

function fnStrGroup(text: string): string {
    const headInt = text.search(/\S/);

    const head = (headInt > 0)
        ? text.substring(0, headInt)
        : '';

    const body = (headInt >= 0)
        ? text.substring(headInt)
        : text;

    const strGroup = body.split('"');
    const sMax = strGroup.length;
    let newBody = '';
    for (let s = 0; s < sMax; s += 1) {
        newBody += (s > 0 && s < sMax)
            ? '"'
            : '';

        const strElement = strGroup[s];
        newBody += ((s % 2) !== 0 || strElement.includes('`'))
            ? strElement
            : fnLR(strElement);
    }
    return head + newBody.trim();
}

// eslint-disable-next-line max-len
export function RangeFormat(RangeTextRaw: string, RangeText: string, fsPath: string, range: vscode.Range): vscode.ProviderResult<vscode.TextEdit[]> {
    const timeStart = Date.now();
    let CommentBlock = false;
    let inLTrim: 0 | 1 | 2 = 0;
    let textNew = '';

    const textLineGroup = RangeText.split('\n');
    const lineMax = textLineGroup.length;
    for (let line = 0; line < lineMax; line += 1) {
        const text = textLineGroup[line];
        CommentBlock = inCommentBlock(text, CommentBlock);
        const textFix = getLStr(text).trim();
        inLTrim = inLTrimRange(textFix, inLTrim);

        textNew += (CommentBlock || textFix === '' || inLTrim > 0 || getSkipSign(textFix) || textFix.startsWith(':') || textFix.includes('::'))
            ? text
            : fnStrGroup(text);

        textNew += (line < lineMax - 1)
            ? '\n'
            : '';
    }
    showWarn(timeStart);
    const diffVar: DiffType = {
        leftText: RangeTextRaw,
        rightTxt: textNew,
        fsPath,
    };
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(callDiff, 100, diffVar);

    return [
        new vscode.TextEdit(range, textNew),
    ];
}
export class RangeFormatProvider implements vscode.DocumentRangeFormattingEditProvider {
    // eslint-disable-next-line class-methods-use-this
    public provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const RangeText = document.getText(range);
        return RangeFormat(RangeText, RangeText, document.uri.fsPath, range);
    }
}