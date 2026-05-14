import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { loadDocumentById } from '@features/documents/documentSlice';
import { spreadsheetActions } from '@features/spreadsheet/spreadsheetSlice';
import SpreadsheetGrid from '@widgets/spreadsheet/spreadsheetGrid';

const SpreadsheetPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { documentId } = useParams();

  const spreadsheetDocument = useAppSelector(
    (state) => state.documents.currentDocument,
  );

  const saveStatus = useAppSelector((state) => state.ui.saveStatus);

  useEffect(() => {
    if (!documentId) {
      navigate('/documents');
      return;
    }

    dispatch(loadDocumentById(documentId))
      .unwrap()
      .then((document) => {
        dispatch(
          spreadsheetActions.loadTable({
            cells: document.cells,
            rows: document.rows,
            columns: document.columns,
          }),
        );
      })
      .catch(() => {
        navigate('/documents');
      });
  }, [dispatch, documentId, navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== 's') {
        return;
      }

      event.preventDefault();
    };

    window.document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.document.removeEventListener('keydown', handleKeyDown);
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
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="button" onClick={() => navigate('/documents')}>
          Назад
        </button>

        <h1>{spreadsheetDocument.title}</h1>

        <span>{statusText}</span>
      </div>

      <SpreadsheetGrid />
    </main>
  );
};

export default SpreadsheetPage;