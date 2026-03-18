import React from 'react';

interface ModuleGridWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const ModuleGridWrapper = ({ children, className = '' }: ModuleGridWrapperProps) => {
  return (
    <div 
      className={[
        "grid w-full mx-auto justify-items-center",
        "px-1 sm:px-2",
        "gap-x-1 gap-y-2.5",
        "[grid-template-columns:repeat(auto-fill,minmax(120px,1fr))]",
        "sm:[grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]",
        "md:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]",
        "lg:[grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]",
        "justify-center",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

export default ModuleGridWrapper;