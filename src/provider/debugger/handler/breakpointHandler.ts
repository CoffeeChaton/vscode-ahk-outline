/* eslint-disable immutable/no-mutation */
/* eslint-disable immutable/no-this */
/* eslint-disable no-underscore-dangle */

import { basename } from 'path';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Breakpoint, Source } from 'vscode-debugadapter';
import { readFileSync } from 'fs';

type TCallback = (breakPoint: DebugProtocol.Breakpoint) => void;
type TBps = DebugProtocol.Breakpoint[];

export class BreakPointHandler {
    private _breakPoints = new Map<string, TBps>();

    /**
     * set breakpoint to the script actual.
     */
    public loopPoints(fnCallback: TCallback): void {
        this._breakPoints.forEach((bps) => {
            bps.forEach((bp) => {
                fnCallback(bp);
            });
        });
    }

    public getBt(path: string): TBps | undefined {
        return this._breakPoints.get(path);
    }

    public buildBreakPoint(path: string, sourceBreakpoints: DebugProtocol.SourceBreakpoint[], fnCallback: TCallback): TBps {
        const sourceLines = readFileSync(path).toString().split('\n');
        const bps = sourceBreakpoints
            .map((sourceBreakpoint) => {
                const source = new Source(basename(path), path);
                const breakPoint = new Breakpoint(false,
                    sourceBreakpoint.line,
                    sourceBreakpoint.column,
                    source);
                const lineText = sourceLines[sourceBreakpoint.line];
                if (lineText && lineText.trim().charAt(0) !== ';') {
                    breakPoint.verified = true;
                }
                fnCallback(breakPoint);
                return breakPoint;
            });
        this._breakPoints.set(path, bps);
        return bps;
    }
}
