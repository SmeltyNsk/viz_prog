import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { documentsApi } from '@features/documents/documentApi';
import type { CreateDocumentPayload, SpreadsheetDocument, UpdateDocumentPayload, } from '@features/documents/documentType';

export interface DocumentsState {
  items: SpreadsheetDocument[];
  activeDocumentId: string | null;
  currentDocument: SpreadsheetDocument | null;
  status: 'idle' | 'loading' | 'error';
}

const initialState: DocumentsState = {
  items: [],
  activeDocumentId: null,
  currentDocument: null,
  status: 'idle',
};

export const loadDocuments = createAsyncThunk('documents/loadDocuments', async () =>
  documentsApi.getAll(),
);

export const loadDocumentById = createAsyncThunk(
  'documents/loadDocumentById',
  async (documentId: string) => {
    const document = documentsApi.getById(documentId);

    if (!document) {
      throw new Error('Документ не найден');
    }

    return document;
  },
);

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async (payload: CreateDocumentPayload) => documentsApi.create(payload),
);

export const renameDocument = createAsyncThunk(
  'documents/renameDocument',
  async (payload: { id: string; title: string }) =>
    documentsApi.update(payload.id, {
      title: payload.title,
    }),
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async (payload: { id: string; data: UpdateDocumentPayload }) =>
    documentsApi.update(payload.id, payload.data),
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId: string) => {
    documentsApi.delete(documentId);
    return documentId;
  },
);

export const duplicateDocument = createAsyncThunk(
  'documents/duplicateDocument',
  async (documentId: string) => documentsApi.duplicate(documentId),
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocumentId(state, action: PayloadAction<string | null>) {
      state.activeDocumentId = action.payload;
    },

    replaceDocument(state, action: PayloadAction<SpreadsheetDocument>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id);

      if (index === -1) {
        state.items.push(action.payload);
      } else {
        state.items[index] = action.payload;
      }

      if (state.currentDocument?.id === action.payload.id) {
        state.currentDocument = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocuments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(loadDocuments.rejected, (state) => {
        state.status = 'error';
      })
      .addCase(loadDocumentById.fulfilled, (state, action) => {
        state.activeDocumentId = action.payload.id;
        state.currentDocument = action.payload;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(renameDocument.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const documentsActions = documentsSlice.actions;
export default documentsSlice.reducer;