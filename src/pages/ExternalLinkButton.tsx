import React, { ReactNode } from 'react';

interface ExternalLinkButtonProps {
  url: string;
  children: ReactNode;
  className?: string;
}

const ExternalLinkButton: React.FC<ExternalLinkButtonProps> = ({ 
  url, 
  children, 
  className = '' 
}) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`px-6 py-2.5 text-base bg-black text-white hover:bg-gray-800 rounded font-semibold transition-colors shadow-lg hover:shadow-xl min-w-[180px] text-center ${className}`}
    >
      {children}
    </a>
  );
};

export default ExternalLinkButton;