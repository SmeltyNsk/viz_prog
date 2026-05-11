import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { documentsApi } from '@features/documents/documentApi';
import type { SpreadsheetDocument } from '@features/documents/documentType';
import type { CellData } from '@features/spreadsheet/spreadsheetType';
import SpreadsheetGrid from '@widgets/spreadsheet/spreadsheetGrid';

type SaveStatus = 'saved' | 'saving' | 'error';

const SpreadsheetPage = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [spreadsheetDocument, setSpreadsheetDocument] = useState<SpreadsheetDocument | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!documentId) {
      navigate('/documents');
      return;
    }

    const foundDocument = documentsApi.getById(documentId);

    if (!foundDocument) {
      navigate('/documents');
      return;
    }

    setSpreadsheetDocument(foundDocument);
  }, [documentId, navigate]);

  const saveDocument = useCallback(
    (cells: CellData[][]) => {
      if (!documentId) {
        return;
      }

      try {
        const updatedDocument = documentsApi.update(documentId, {
          cells,
          rows: cells.length,
          columns: cells[0]?.length ?? 0,
        });

        setSpreadsheetDocument(updatedDocument);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [documentId],
  );

  const handleGridChange = useCallback(
    (cells: CellData[][]) => {
      setSaveStatus('saving');

      setSpreadsheetDocument((currentDocument) => {
        if (!currentDocument) {
          return currentDocument;
        }

        return {
          ...currentDocument,
          cells,
          rows: cells.length,
          columns: cells[0]?.length ?? 0,
        };
      });

      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        saveDocument(cells);
      }, 500);
    },
    [saveDocument],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !spreadsheetDocument ||
        !event.ctrlKey ||
        event.key.toLowerCase() !== 's'
      ) {
        return;
      }
  
      event.preventDefault();
  
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
  
      setSaveStatus('saving');
      saveDocument(spreadsheetDocument.cells);
    };
  
    window.document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.document.removeEventListener('keydown', handleKeyDown);
    };
  }, [spreadsheetDocument, saveDocument]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveStatus === 'saved') {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (!spreadsheetDocument) {
    return <p style={{ padding: 24 }}>Загрузка...</p>;
  }

  const statusText =
    saveStatus === 'saved'
      ? 'Сохранено'
      : saveStatus === 'saving'
        ? 'Сохранение...'
        : 'Ошибка сохранения';

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <button type="button" onClick={() => navigate('/documents')}>
          Назад
        </button>

        <h1 style={{ margin: 0 }}>{spreadsheetDocument.title}</h1>

        <span>{statusText}</span>
      </div>

      <SpreadsheetGrid
        rows={spreadsheetDocument.rows}
        columns={spreadsheetDocument.columns}
        initialData={spreadsheetDocument.cells}
        onDataChange={handleGridChange}
      />
    </main>
  );
};

export default SpreadsheetPage;