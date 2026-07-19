import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function TableInput({ columns, data = [], onChange }) {
  
  const handleAddRow = () => {
    const newRow = columns.reduce((acc, col) => {
      acc[col.key] = '';
      return acc;
    }, {});
    // Add unique local ID for React list key tracking
    newRow._id = Math.random().toString(36).substring(2, 9);
    onChange([...data, newRow]);
  };

  const handleRemoveRow = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleCellChange = (index, key, value) => {
    const updated = data.map((row, i) => {
      if (i === index) {
        return { ...row, [key]: value };
      }
      return row;
    });
    onChange(updated);
  };

  return (
    <div className="table-wrapper">
      <div className="table-container">
        <table className="excel-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width || 'auto' }}>
                  {col.label}
                </th>
              ))}
              <th style={{ width: '60px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  Nenhum registro adicionado. Clique em "Adicionar Linha" para começar.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row._id || rowIndex}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <input
                        type={col.type || 'text'}
                        value={row[col.key] || ''}
                        onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                        placeholder={col.placeholder || ''}
                        className="excel-table-input"
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIndex)}
                      className="delete-row-btn"
                      title="Excluir Linha"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="table-actions">
        <button
          type="button"
          onClick={handleAddRow}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <Plus size={16} />
          Adicionar Linha
        </button>
      </div>
    </div>
  );
}
