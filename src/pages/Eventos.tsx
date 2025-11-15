import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const Eventos: React.FC = () => {
  const { locale } = useParams();
  const target = `/${locale ?? 'pt'}/gestao-estoque`;
  return <Navigate to={target} replace />;
};

export default Eventos;
