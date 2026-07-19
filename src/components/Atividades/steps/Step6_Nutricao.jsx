import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step6_Nutricao({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'fonte', label: 'Fonte / Adubo', placeholder: 'Ex: Esterco, NPK 10-10-10', width: '200px' },
    { key: 'quantidade', label: 'Quantidade', placeholder: 'Ex: 150', type: 'number', width: '120px' },
    { key: 'unidade', label: 'Unidade', placeholder: 'Ex: kg, g/planta', width: '100px' },
    { key: 'formaAplicacao', label: 'Forma de Aplicação', placeholder: 'Ex: Cobertura, Incorporado', width: '180px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: Carlos Cruz', width: '160px' },
    { key: 'observacoes', label: 'Observações', placeholder: 'Observações adicionais', width: '200px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>6. Nutrição / Adubação</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Registre as adubações e correções de solo executadas no plantio ou cobertura.
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
