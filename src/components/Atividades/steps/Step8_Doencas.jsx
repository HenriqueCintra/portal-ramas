import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step8_Doencas({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'fenologia', label: 'Fenologia da Planta', placeholder: 'Ex: Floração', width: '160px' },
    { key: 'doenca', label: 'Doença Identificada', placeholder: 'Ex: Antracnose', width: '180px' },
    { key: 'incidencia', label: 'Incidência (Brotos/Folhas/Ramos)', placeholder: 'Ex: Folhas e Ramos', width: '220px' },
    { key: 'sintomas', label: 'Sintomas Observados', placeholder: 'Ex: Manchas escuras', width: '220px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: Roberto Lima', width: '160px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>8. Monitoramento de Doenças</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Documente as doenças foliares, radiculares ou nos ramos encontradas nas parcelas.
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
