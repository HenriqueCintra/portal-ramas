import React, { useState } from 'react';
import { User, Users, Landmark, GraduationCap, Microscope, UserCheck } from 'lucide-react';
import ProdutorForm from './ProdutorForm';
import AssociacaoForm from './AssociacaoForm';
import PrefeituraForm from './PrefeituraForm';
import EscolaForm from './EscolaForm';
import InstituicaoForm from './InstituicaoForm';
import ParceiroForm from './ParceiroForm';

export default function CadastroGeralModule() {
  const [activeTab, setActiveTab] = useState('produtor');

  const menuItems = [
    { id: 'produtor', label: 'Produtor / Agricultor', icon: <User size={18} /> },
    { id: 'associacao', label: 'Associação / Cooperativa', icon: <Users size={18} /> },
    { id: 'prefeitura', label: 'Prefeitura', icon: <Landmark size={18} /> },
    { id: 'escola', label: 'Escola (Fund. / Médio)', icon: <GraduationCap size={18} /> },
    { id: 'instituicao', label: 'Instituição de Pesquisa', icon: <Microscope size={18} /> },
    { id: 'parceiro', label: 'Pesquisador e Parceiro', icon: <UserCheck size={18} /> },
  ];

  const renderForm = () => {
    switch (activeTab) {
      case 'produtor':
        return <ProdutorForm />;
      case 'associacao':
        return <AssociacaoForm />;
      case 'prefeitura':
        return <PrefeituraForm />;
      case 'escola':
        return <EscolaForm />;
      case 'instituicao':
        return <InstituicaoForm />;
      case 'parceiro':
        return <ParceiroForm />;
      default:
        return <ProdutorForm />;
    }
  };

  return (
    <div className="cadastro-layout">
      {/* Sidebar de Entidades */}
      <aside className="sidebar">
        <h3 className="sidebar-title">Cadastro Geral</h3>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <button onClick={() => setActiveTab(item.id)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Área Principal do Formulário Selecionado */}
      <div className="cadastro-content">
        {renderForm()}
      </div>
    </div>
  );
}
