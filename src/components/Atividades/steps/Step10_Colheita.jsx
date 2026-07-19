import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step10_Colheita({ data = [], onChange }) {
  const columns = [
    { key: 'data', label: 'Data', type: 'date', width: '150px' },
    { key: 'producaoKg', label: 'Produção (Kg)', placeholder: 'Ex: 450', type: 'number', width: '130px' },
    { key: 'qualidadeRaizes', label: 'Qualidade das Raízes', placeholder: 'Ex: Ótima (Graúdas)', width: '200px' },
    { key: 'plantasColhidas', label: 'Plantas Colhidas (Qtd)', placeholder: 'Ex: 180', type: 'number', width: '160px' },
    { key: 'destinoProduto', label: 'Destino do Produto', placeholder: 'Ex: Doação, Associação', width: '200px' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Ex: José Silva', width: '160px' },
    { key: 'observacoes', label: 'Observações', placeholder: 'Observações adicionais', width: '200px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>10. Registro de Colheitas</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Documente os rendimentos de colheita obtidos, qualidade e destinação dos alimentos colhidos.
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
