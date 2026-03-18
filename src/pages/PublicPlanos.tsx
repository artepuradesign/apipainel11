import React, { useEffect } from 'react';
import MenuSuperior from '@/components/MenuSuperior';
import PublicPlansSection from '@/components/sections/PublicPlansSection';
import NewFooter from '@/components/NewFooter';
import PageLayout from '@/components/layout/PageLayout';
import SocialMediaButtons from '@/components/SocialMediaButtons';

const PublicPlanos = () => {
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        duration: 600,
        once: true,
        offset: 50,
        delay: 0,
      });
    }
  }, []);

  return (
    <PageLayout
      variant="auth"
      backgroundOpacity="strong"
      showGradients={false}
      className="flex flex-col"
    >
      <MenuSuperior />

      <main className="w-full overflow-x-hidden">
        <PublicPlansSection />
      </main>

      <NewFooter />
      <SocialMediaButtons />
    </PageLayout>
  );
};

export default PublicPlanos;
