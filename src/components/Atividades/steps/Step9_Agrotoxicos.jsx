import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step9_Agrotoxicos({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'fenologia', label: 'Fenologia da Planta', placeholder: 'Ex: Frutificação', width: '150px' },
    { key: 'produto', label: 'Produto Aplicado', placeholder: 'Ex: Óleo de Neem, Defensivo X', width: '180px' },
    { key: 'carencia', label: 'Carência (Dias)', placeholder: 'Ex: 7', type: 'number', width: '120px' },
    { key: 'previsaoColheita', label: 'Previsão Colheita', type: 'date', width: '150px' },
    { key: 'dosagem', label: 'Dosagem (ml/L)', placeholder: 'Ex: 5 ml/L', width: '120px' },
    { key: 'volumeCalda', label: 'Volume de Calda (L)', placeholder: 'Ex: 20 L', width: '150px' },
    { key: 'operador', label: 'Operador', placeholder: 'Ex: Pedro Cunha', width: '160px' },
    { key: 'observacoes', label: 'Observações', placeholder: 'Observações adicionais', width: '200px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>9. Controle Químico / Defensivos</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Registre produtos defensivos (biológicos ou químicos), dosagens, prazos de carência e segurança alimentar.
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
