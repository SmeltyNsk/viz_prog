import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
      navigate('/dashboard');
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
        navigate('/dashboard');
      });
  }, [dispatch, documentId, navigate]);

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
      <div style={{ marginBottom: 12 }}>
        <Link to="/dashboard">Мои документы</Link>
        <span> → </span>
        <span>{spreadsheetDocument.title}</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <button type="button" onClick={() => navigate('/dashboard')}>
          Назад
        </button>

        <h1 style={{ margin: 0 }}>{spreadsheetDocument.title}</h1>

        <span>{statusText}</span>
      </div>

      <SpreadsheetGrid />
    </main>
  );
};

export default SpreadsheetPage;