/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-type-alias */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-regexp */
/* eslint max-classes-per-file: ["error", 3] */
/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1,10000] }] */
import * as vscode from 'vscode';
import { Detecter } from '../../core/Detecter';
import { removeSpecialChar } from '../../tools/removeSpecialChar';
import { inCommentBlock } from '../../tools/inCommentBlock';
import { EMode } from '../../globalEnum';

// Function     Description
// FileExist    Checks for the existence of a file or folder and returns its attributes.
// GetKeyState  Returns true (1) if the specified key is down and false (0) if it is up.
// InStr        Searches for a given occurrence of a string, from the left or the right.
// RegExMatch   Determines whether a string contains a pattern (regular expression).
// RegExReplace Replaces occurrences of a pattern (regular expression) inside a string.
// StrLen       Retrieves the count of how many characters are in a string.
// StrReplace   Replaces occurrences of the specified substring with a new string.
// StrSplit     Separates a string into an array of substrings using the specified delimiters.
// SubStr       Retrieves one or more characters from the specified position in a string.
// WinActive    Checks if the specified window exists and is currently active (foremost), and returns its Unique ID (HWND).
// WinExist     Checks if a matching window exists and returns the Unique ID (HWND) of the first matching window.

type funcDefType = {
    Name: string,
    Description: string,
    Parameters: string,
    ReturnValue: string,
}

const funcDef: funcDefType = {

};

export async function builtInFunc(document: vscode.TextDocument,
    position: vscode.Position, wordLower: string, listAllUsing: boolean): Promise<vscode.Location[] | undefined> {

}