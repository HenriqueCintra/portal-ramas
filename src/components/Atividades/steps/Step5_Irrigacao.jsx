import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step5_Irrigacao({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'eto', label: 'ETo (mm)', placeholder: 'Ex: 5.2', type: 'number', width: '110px' },
    { key: 'kc', label: 'KC (Coef. Cultura)', placeholder: 'Ex: 0.85', type: 'number', width: '130px' },
    { key: 'laminaBruta', label: 'Lâmina Bruta (mm)', placeholder: 'Ex: 4.5', type: 'number', width: '140px' },
    { key: 'tempoIrrigacao', label: 'Tempo Irrigação (min)', placeholder: 'Ex: 45', type: 'number', width: '160px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: João Santos', width: '180px' },
    { key: 'observacoes', label: 'Observações', placeholder: 'Observações adicionais', width: '220px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>5. Irrigação</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Registre as lâminas de água aplicadas e o tempo gasto nas regas das culturas.
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
