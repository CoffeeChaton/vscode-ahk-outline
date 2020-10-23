export function getSkipSign2(text: string): boolean {
    if ((/^\s*[\w%[][\w%[\]]*\s*=[^=]/).test(text)) return true;
    return false;
}
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
        //   /^\s*[\w%[][\w%[\]]*\s*=[^=]/, // TODO TraditionAssignment
        //  // FIXME TEST THIS [^:=+.><!|\w-]=[^=]
        // [^+\--:=><*!/\w~)"]=[^=]
    ];
    const iMax = skipList.length;
    for (let i = 0; i < iMax; i += 1) {
        if (skipList[i].test(text)) return true;
    }
    return false;
}

function fnReplacer(match: string, p1: string): string {
    return '_'.repeat(p1.length);
}

// [textFix , '; comment text']
export function getLStrOld(textRaw: string): string {
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
export function getLStr(textRaw: string): string {
    if (textRaw[0] === ';') return '';
    if ((/^\s*;/).test(textRaw)) return '';

    //  TODD QUICK
    //  const text = textRaw.replace(/`./g, '__');
    let textFix = '';
    let tf = 1;
    let comma = 0;
    const sL = textRaw.length;
    for (let i = 0; i < sL; i++) {
        switch (textRaw[i]) {
            case '"':
                tf *= -1;
                textFix += '_';
                break;
            case '`':
                textFix += '_';
                comma = 2;
                break;
            case ';':
                return (/^\s*$/).test(textFix) ? '' : textFix;
            default:
                textFix += tf === 1 && comma === 0 ? textRaw[i] : '_';
                comma -= comma === 0 ? 0 : 1;
                break;
        }
    }
    return (/^\s*$/).test(textFix) ? '' : textFix;
}
