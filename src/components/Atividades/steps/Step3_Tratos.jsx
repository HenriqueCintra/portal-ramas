import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step3_Tratos({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'parcela', label: 'Parcela', placeholder: 'Ex: Parcela 01', width: '150px' },
    { key: 'tratos', label: 'Tratos / Operações', placeholder: 'Ex: Capina manual, Adubação', width: '250px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: José Silva', width: '180px' },
    { key: 'observacoes', label: 'Observações', placeholder: 'Observações adicionais', width: '250px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>3. Tratos Culturais</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Registre as atividades cotidianas de manejo realizadas nas parcelas (limpezas, podas, capinas, etc.).
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
