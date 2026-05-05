import SpreadsheetGrid from '@widgets/spreadsheet/spreadsheetGrid';

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Табличный процессор</h1>
      <SpreadsheetGrid rows={100} columns={26} />
    </div>
  );
}

export default App;