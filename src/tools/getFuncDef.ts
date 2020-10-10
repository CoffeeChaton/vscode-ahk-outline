/* eslint-disable no-console */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-type-alias */
/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1,10000] }] */
import * as vscode from 'vscode';
import { TDocArr } from '../globalEnum';

export type FuncDefData = {
    name: string;
    selectionRange: vscode.Range;
};

function lineText(DocStrMap: TDocArr, searchLine: number): string {
    return DocStrMap[searchLine].lStr;
}

type FuncTailType = { DocStrMap: TDocArr, searchText: string, name: string, searchLine: number, defLine: number };

function getSelectionRange(DocStrMap: TDocArr, defLine: number, blockStartLine: number): vscode.Range {
    // const argPos = Math.max(DocStrMap[defLine].lStr.indexOf('('), 0);
    const blockEndPos = DocStrMap[blockStartLine].lStr.indexOf('{');
    const endLen = blockEndPos === -1 ? DocStrMap[blockStartLine].lStr.length : blockEndPos;
    return new vscode.Range(
        new vscode.Position(defLine, 0),
        new vscode.Position(blockStartLine, endLen + 1),
    );
}

function getFuncTail({
    DocStrMap, searchText, name, searchLine, defLine,
}: FuncTailType): false | FuncDefData {
    const fnTail = /\)\s*\{\s*$/;
    // i+1   ^, something , something ........ ) {$
    if (fnTail.test(searchText)) {
        const selectionRange = getSelectionRange(DocStrMap, defLine, searchLine);
        return { name, selectionRange };
    }
    if (searchLine + 1 > DocStrMap.length) return false;

    // i+1   ^, something , something ......)$
    // i+2   ^{
    if ((/\)\s*$/).test(searchText)
        && lineText(DocStrMap, searchLine + 1).trimStart().startsWith('{')) {
        const selectionRange = getSelectionRange(DocStrMap, defLine, searchLine + 1);
        return { name, selectionRange };
    }

    return false;
}

export function getFuncDef(DocStrMap: TDocArr, defLine: number): false | FuncDefData {
    const fnHeadMatch = /^\s*(\w\w*)\(/; //  funcName(...
    const textFix = lineText(DocStrMap, defLine);
    const fnHead = fnHeadMatch.exec(textFix);
    if (fnHead === null) return false;

    const name = fnHead[1];
    if ((/^\s*(if|while)\s*$/i).test(name)) return false;

    const funcData = getFuncTail({
        DocStrMap,
        searchText: textFix,
        name,
        searchLine: defLine,
        defLine,
    });
    if (funcData) return funcData;

    if (lineText(DocStrMap, defLine).includes(')')) return false;// fn_Name( ... ) ...  ,this is not ahk function

    // eslint-disable-next-line no-magic-numbers
    const iMax = defLine + 15;
    for (let searchLine = defLine + 1; searchLine < iMax; searchLine += 1) {
        const searchText = lineText(DocStrMap, searchLine);

        if ((/^\s*,/).test(searchText) === false) return false;

        const funcData2 = getFuncTail({
            DocStrMap, searchText, name, searchLine, defLine,
        });
        if (funcData2) return funcData2;
    }
    return false;
}
