import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '@features/auth/api/authApi';
import { documentsApi } from '@features/documents/documentApi';
import type { SpreadsheetDocument } from '@features/documents/documentType';

const DocumentsPage = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<SpreadsheetDocument[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [title, setTitle] = useState('Новая таблица');
  const [rows, setRows] = useState('100');
  const [columns, setColumns] = useState('26');

  const loadDocuments = () => {
    const user = authApi.getCurrentUser();

    if (!user) {
      navigate('/login');
      return;
    }

    setDocuments(documentsApi.getAll());
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = () => {
    const rowsCount = Number(rows);
    const columnsCount = Number(columns);

    if (!title.trim()) {
      return;
    }

    const document = documentsApi.create({
      title: title.trim(),
      rows: Number.isNaN(rowsCount) ? 100 : rowsCount,
      columns: Number.isNaN(columnsCount) ? 26 : columnsCount,
    });

    setIsCreateOpen(false);
    setTitle('Новая таблица');
    setRows('100');
    setColumns('26');

    navigate(`/documents/${document.id}`);
  };

  const handleRenameDocument = (document: SpreadsheetDocument) => {
    const newTitle = window.prompt('Новое название документа', document.title);

    if (!newTitle?.trim()) {
      return;
    }

    documentsApi.update(document.id, {
      title: newTitle.trim(),
    });

    loadDocuments();
  };

  const handleDeleteDocument = (document: SpreadsheetDocument) => {
    const confirmed = window.confirm(`Удалить документ "${document.title}"?`);

    if (!confirmed) {
      return;
    }

    documentsApi.delete(document.id);
    loadDocuments();
  };

  const handleDuplicateDocument = (document: SpreadsheetDocument) => {
    documentsApi.duplicate(document.id);
    loadDocuments();
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <h1>Мои документы</h1>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setIsCreateOpen(true)}>
            Создать документ
          </button>

          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <p>Документов пока нет.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {documents.map((document) => (
            <div
              key={document.id}
              style={{
                border: '1px solid #ccc',
                padding: 12,
                display: 'grid',
                gap: 8,
              }}
            >
              <strong>{document.title}</strong>

              <span>Создан: {new Date(document.createdAt).toLocaleString()}</span>
              <span>Изменён: {new Date(document.updatedAt).toLocaleString()}</span>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => navigate(`/documents/${document.id}`)}
                >
                  Открыть
                </button>

                <button
                  type="button"
                  onClick={() => handleRenameDocument(document)}
                >
                  Переименовать
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicateDocument(document)}
                >
                  Дублировать
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteDocument(document)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 20,
              width: 360,
              display: 'grid',
              gap: 12,
              border: '1px solid #ccc',
            }}
          >
            <h2>Создание документа</h2>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Название"
            />

            <input
              value={rows}
              onChange={(event) => setRows(event.target.value)}
              placeholder="Количество строк"
            />

            <input
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
              placeholder="Количество столбцов"
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={handleCreateDocument}>
                Создать
              </button>

              <button type="button" onClick={() => setIsCreateOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DocumentsPage;