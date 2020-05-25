
/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1] }] */
import * as vscode from 'vscode';
// import { removeSpecialChar2, getSkipSign } from '../../tools/removeSpecialChar';
import { getRange } from '../../tools/getRange';

// Switch case

export function getSwitchRange(document: vscode.TextDocument, textFix: string, line: number, RangeEnd: number): vscode.Range | undefined {
    if ((/^switch\s/).test(textFix) === false) return undefined;

    const lineFix = textFix.endsWith('{') ? line : line + 1;
    const range = getRange(document, lineFix, lineFix, RangeEnd);
    const PosStart = new vscode.Position(range.start.line, document.lineAt(range.start.line + 1).range.end.character);
    const PosEnd = new vscode.Position(range.end.line - 1, document.lineAt(range.end.line - 1).range.end.character);
    return new vscode.Range(PosStart, PosEnd);
}

export function inSwitchBlock(textFix: string, line: number, switchRangeArray: vscode.Range[]): number {
    const Pos = new vscode.Position(line, 0);
    let switchDeep = 0;
    for (const switchRange of switchRangeArray) {
        if (switchRange.contains(Pos)) {
            switchDeep += 1;
        }
    }

    if ((/^case\s/).test(textFix)
        || (/^default\s/).test(textFix)) {
        switchDeep -= 1;
    }
    return switchDeep;
}
/*
test code
```ahk
    Switch task_set_input
    {
        Case 1:
            Task_Options := -1

        Case 2, 3:
            text := "Task_Options := 15/25..."
                . "`n" "discuss := -1 "
            Task_Options := fn_Input_Box(title, text, 0, 0)

            Switch Task_Options {
                Case -1, 15, 25, 35, 45, 55, 65:
                    ; nothing
                Case "Cancel":
                    Task_Options := -1
                Default :
                    ListVars
                    err_code := "--16--208--73--" A_ThisFunc
                        . "`n [ " Task_Options " ] input error "
                    fn_music_msg(err_code)
            }
            MsgBox % "you need to fix mini map!`n--43--342--81--"
            MsgBox % "use little size win !`n--39--342--82--"

        Default :
            ListVars
            err_code := "--253--274--73--" A_ThisFunc
                . "`n [ " task_set_input " ] input error "
            fn_music_msg(err_code)
    }
```
*/