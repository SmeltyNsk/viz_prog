import type { Middleware } from '@reduxjs/toolkit';

import { documentsApi } from '@features/documents/documentApi';
import { documentsActions, type DocumentsState,} from '@features/documents/documentSlice';
import { type SpreadsheetState, } from '@features/spreadsheet/spreadsheetSlice';
import { uiActions } from '@features/ui/uiSlice';

interface AutosaveState {
  documents: DocumentsState;
  spreadsheet: SpreadsheetState;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function isActionWithType(action: unknown): action is { type: string } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string'
  );
}

function shouldAutosave(actionType: string): boolean {
  return [
    'spreadsheet/setCellValue',
    'spreadsheet/addRowAfter',
    'spreadsheet/deleteRowAt',
    'spreadsheet/addColumnAfter',
    'spreadsheet/deleteColumnAt',
    'spreadsheet/undo',
    'spreadsheet/redo',
  ].includes(actionType);
}

export const autosaveMiddleware: Middleware<
  Record<string, never>,
  AutosaveState
> = (store) => (next) => (action) => {
  const result = next(action);

  if (!isActionWithType(action) || !shouldAutosave(action.type)) {
    return result;
  }

  const state = store.getState();
  const documentId = state.documents.activeDocumentId;

  if (!documentId) {
    return result;
  }

  store.dispatch(uiActions.setSaveStatus('saving'));

  if (saveTimer !== null) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    try {
      const currentState = store.getState();

      const updatedDocument = documentsApi.update(documentId, {
        cells: currentState.spreadsheet.cells,
        rows: currentState.spreadsheet.cells.length,
        columns: currentState.spreadsheet.cells[0]?.length ?? 0,
      });

      store.dispatch(documentsActions.replaceDocument(updatedDocument));
      store.dispatch(uiActions.setSaveStatus('saved'));
    } catch {
      store.dispatch(uiActions.setSaveStatus('error'));
    }
  }, 500);

  return result;
};