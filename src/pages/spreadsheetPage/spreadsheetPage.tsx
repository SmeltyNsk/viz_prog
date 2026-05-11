import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { documentsApi } from '@features/documents/documentApi';
import type { SpreadsheetDocument } from '@features/documents/documentType';

const SpreadsheetPage = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [document, setDocument] = useState<SpreadsheetDocument | null>(null);

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

    setDocument(foundDocument);
  }, [documentId, navigate]);

  if (!document) {
    return <p style={{ padding: 24 }}>Загрузка...</p>;
  }

  return (
    <main style={{ padding: 24 }}>
      <button type="button" onClick={() => navigate('/documents')}>
        Назад к документам
      </button>

      <h1>{document.title}</h1>

      <p>Здесь пусто, потом подключу spreadsheetgrid.</p>
    </main>
  );
};

export default SpreadsheetPage;