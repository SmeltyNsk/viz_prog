import { createTable } from '@features/lib/tableFactory';
import { authApi } from '@features/auth/api/authApi';
import type { CreateDocumentPayload, SpreadsheetDocument, UpdateDocumentPayload, } from '@features/documents/documentType';

const DOCUMENTS_KEY = 'spreadsheet_documents';

function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getStoredDocuments(): SpreadsheetDocument[] {
  const rawDocuments = localStorage.getItem(DOCUMENTS_KEY);

  if (!rawDocuments) {
    return [];
  }

  try {
    return JSON.parse(rawDocuments) as SpreadsheetDocument[];
  } catch {
    return [];
  }
}

function saveDocuments(documents: SpreadsheetDocument[]): void {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

export const documentsApi = {
  getAll(): SpreadsheetDocument[] {
    const user = authApi.getCurrentUser();

    if (!user) {
      return [];
    }

    return getStoredDocuments().filter((document) => document.userId === user.id);
  },

  getById(id: string): SpreadsheetDocument | null {
    const user = authApi.getCurrentUser();

    if (!user) {
      return null;
    }

    const document = getStoredDocuments().find(
      (item) => item.id === id && item.userId === user.id,
    );

    return document ?? null;
  },

  create(payload: CreateDocumentPayload): SpreadsheetDocument {
    const user = authApi.getCurrentUser();

    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    const now = new Date().toISOString();

    const document: SpreadsheetDocument = {
      id: generateId(),
      userId: user.id,
      title: payload.title,
      rows: payload.rows,
      columns: payload.columns,
      cells: createTable({
        rows: payload.rows,
        columns: payload.columns,
      }),
      createdAt: now,
      updatedAt: now,
    };

    const documents = getStoredDocuments();

    saveDocuments([...documents, document]);

    return document;
  },

  update(id: string, payload: UpdateDocumentPayload): SpreadsheetDocument {
    const user = authApi.getCurrentUser();

    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    const documents = getStoredDocuments();

    const documentIndex = documents.findIndex(
      (document) => document.id === id && document.userId === user.id,
    );

    if (documentIndex === -1) {
      throw new Error('Документ не найден');
    }

    const currentDocument = documents[documentIndex];

    const updatedDocument: SpreadsheetDocument = {
      ...currentDocument,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const updatedDocuments = [...documents];
    updatedDocuments[documentIndex] = updatedDocument;

    saveDocuments(updatedDocuments);

    return updatedDocument;
  },

  delete(id: string): void {
    const user = authApi.getCurrentUser();

    if (!user) {
      return;
    }

    const documents = getStoredDocuments().filter(
      (document) => !(document.id === id && document.userId === user.id),
    );

    saveDocuments(documents);
  },

  duplicate(id: string): SpreadsheetDocument {
    const user = authApi.getCurrentUser();

    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    const document = this.getById(id);

    if (!document) {
      throw new Error('Документ не найден');
    }

    const now = new Date().toISOString();

    const copiedDocument: SpreadsheetDocument = {
      ...document,
      id: generateId(),
      title: `${document.title} копия`,
      createdAt: now,
      updatedAt: now,
    };

    const documents = getStoredDocuments();

    saveDocuments([...documents, copiedDocument]);

    return copiedDocument;
  },
};