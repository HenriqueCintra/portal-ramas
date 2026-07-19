import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step7_Pragas({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'praga', label: 'Praga Identificada', placeholder: 'Ex: Mosca-branca', width: '180px' },
    { key: 'fenologia', label: 'Fenologia da Planta', placeholder: 'Ex: Crescimento', width: '180px' },
    { key: 'intensidade', label: 'Intensidade (%)', placeholder: 'Ex: 15', type: 'number', width: '120px' },
    { key: 'sintomas', label: 'Sintomas Observados', placeholder: 'Ex: Folhas amareladas', width: '220px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: Aline Martins', width: '160px' },
    { key: 'observacoes', label: 'Observações', placeholder: 'Observações adicionais', width: '200px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>7. Monitoramento de Pragas</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Monitore e identifique pragas, estimando o percentual de infestação na lavoura.
        </p>
      </div>

      <TableInput
        columns={columns}
        data={data}
        onChange={onChange}
      />
    </div>
  );
}
