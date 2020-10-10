/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1] }] */

export function getSkipSign(text: string): boolean {
    const skipList: RegExp[] = [
        //   /^\s*;/,
        // /^sleep\b/i,
        /^\s*msgbox\b/i,
        //  /^gui\b/i,
        //  /^send(?:raw|input|play|event)?[,\s]/i,
        /^\s*sendRaw\b/i,
        /^\s*send\b\s*{Raw}/i,
        //  /^\s*::/,
        //  /^menu[,\s]/i,
        //   /^s*loop[,\s][,\s]*parse,/,
        /^\s*[\w%[][\w%[\]]*\s*=[^=]/, // TraditionAssignment
        // [^+\--:=><*!/\w~)"]=[^=]
    ];
    const iMax = skipList.length;
    for (let i = 0; i < iMax; i += 1) {
        // eslint-disable-next-line security/detect-object-injection
        if (skipList[i].test(text)) return true;
    }
    return false;
}

function fnReplacer(match: string, p1: string): string {
    // eslint-disable-next-line no-magic-numbers
    return '_'.repeat(p1.length);
}

// [textFix , '; comment text']
export function getLStr(textRaw: string): string {
    if (textRaw[0] === ';') return '';
    if ((/^\s*;/).test(textRaw)) return '';
    const textFix = textRaw.replace(/`./g, '__').replace(/("[^"]*?")/g, fnReplacer);
    const i = textFix.indexOf(';');
    switch (i) {
        case -1:
            return textFix;
        case 0:
            return '';
        default:
            return textFix.substring(0, i);
    }
}
