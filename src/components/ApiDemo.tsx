
import React from 'react';
import ApiFeatures from './api-demo/ApiFeatures';
import ApiExamples from './api-demo/ApiExamples';

const ApiDemo = () => {
  return (
    <section id="api" className="py-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API RESTful
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Integre nosso serviço diretamente no seu sistema com nossa API simples e poderosa.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-6xl mx-auto">
          <div className="lg:w-1/3 w-full">
            <ApiFeatures />
          </div>
          
          <div className="lg:w-2/3 w-full min-w-0">
            <ApiExamples />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApiDemo;
