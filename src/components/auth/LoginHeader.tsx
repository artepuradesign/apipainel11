
import React from 'react';
import TextLogo from '@/components/TextLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const LoginHeader: React.FC = () => {
  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      <div className="mb-5">
        <TextLogo to="/" showFullOnMobile={true} />
      </div>
    </>
  );
};

export default LoginHeader;
