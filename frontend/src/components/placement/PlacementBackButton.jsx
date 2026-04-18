import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PlacementBackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(139, 92, 246, 0.18)',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(14px)',
        color: '#6d28d9',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.12)'
      }}
    >
      <ArrowLeft size={14} />
      Back
    </button>
  );
};

export default PlacementBackButton;
