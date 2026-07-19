import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step4_Meteorologia({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'chuva', label: 'Chuva (mm)', placeholder: 'Ex: 12.5', type: 'number', width: '110px' },
    { key: 'tmax', label: 'Tmax (°C)', placeholder: 'Ex: 31.2', type: 'number', width: '100px' },
    { key: 'tmin', label: 'Tmin (°C)', placeholder: 'Ex: 19.8', type: 'number', width: '100px' },
    { key: 'eto', label: 'ETo (mm)', placeholder: 'Ex: 4.8', type: 'number', width: '100px' },
    { key: 'ocorrencias', label: 'Ocorrências / Avisos', placeholder: 'Ex: Ventos fortes', width: '220px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: Maria Oliveira', width: '180px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>4. Condições Meteorológicas</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Registre dados diários sobre clima, precipitação e temperatura.
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
