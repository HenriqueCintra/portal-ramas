import React from 'react';
import TableInput from '../../Common/TableInput';

export default function Step2_Parcelas({ data = [], onChange }) {
  const columns = [
    { key: 'denominacao', label: 'Denominação', placeholder: 'Ex: Parcela 01', width: '150px' },
    { key: 'latitude', label: 'Latitude', placeholder: 'Ex: -8.3456', width: '130px' },
    { key: 'longitude', label: 'Longitude', placeholder: 'Ex: -37.1234', width: '130px' },
    { key: 'cultivar', label: 'Cultivar', placeholder: 'Ex: Amélia', width: '130px' },
    { key: 'anoPlantio', label: 'Ano de Plantio', placeholder: 'Ex: 2026', type: 'number', width: '110px' },
    { key: 'sistemaIrrigacao', label: 'Sist. de Irrigação', placeholder: 'Ex: Gotejamento', width: '150px' },
    { key: 'areaHa', label: 'Área (ha)', placeholder: 'Ex: 0.5', width: '100px' },
    { key: 'espacamento', label: 'Espaçamento', placeholder: 'Ex: 1,0x0,8', width: '110px' },
    { key: 'densidade', label: 'Densidade (plantas/ha)', placeholder: 'Ex: 12500', width: '160px' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>2. Identificação das Parcelas</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          Defina as parcelas experimentais ou áreas de observação adicionando linhas abaixo.
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
