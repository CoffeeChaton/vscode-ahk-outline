/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import * as vscode from 'vscode';
import { Detecter } from '../core/Detecter';


// eslint-disable-next-line import/prefer-default-export
export class CompletionProvider implements vscode.CompletionItemProvider {
  private keywordList: string[] = [];

  private keywordComplectionItems: vscode.CompletionItem[] = [];

  constructor() {
    this.initKeywordComplectionItem();
  }

  public async provideCompletionItems(document: vscode.TextDocument,
    position: vscode.Position): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
    const result: vscode.CompletionItem[] = [];
    (await Detecter.getFuncList(document, true)).forEach((method) => {
      const completionItem = new vscode.CompletionItem(`${method.name}()`, vscode.CompletionItemKind.Method);
      completionItem.detail = method.Remark;
      result.push(completionItem);
    });

    return this.keywordComplectionItems.concat(result);
  }

  public resolveCompletionItem?(item: vscode.CompletionItem)
    : vscode.ProviderResult<vscode.CompletionItem> {
    return item;
  }

  private initKeywordComplectionItem() {
    this.keywordList.forEach((keyword) => {
      const keywordComplectionItem = new vscode.CompletionItem(`${keyword} `);
      keywordComplectionItem.kind = vscode.CompletionItemKind.Property;
      this.keywordComplectionItems.push(keywordComplectionItem);
    });
  }
}
