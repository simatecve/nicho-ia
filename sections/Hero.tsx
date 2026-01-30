
import React from 'react';
import { BrutalButton } from '../components/BrutalButton';

export const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden grid-visible border-b-8 border-black">
      <div className="max-w-[1100px] w-full py-20 bg-white brutalist-border brutalist-shadow p-8 md:p-16">
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tighter">
          ¿TU NICHO <span className="bg-yellow-300 px-2">SIRVE</span> O ES HUMO?
        </h1>
        <p className="text-xl md:text-2xl font-bold mb-12 max-w-2xl mx-auto uppercase">
          Escribe tu idea. Responde 3 preguntas. Te doy un score real basado en datos, no en optimismo barato.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <BrutalButton onClick={() => document.getElementById('analizador')?.scrollIntoView()}>
            Analizar mi nicho
          </BrutalButton>
          <BrutalButton variant="secondary" onClick={() => document.getElementById('proceso')?.scrollIntoView()}>
            Ver cómo funciona
          </BrutalButton>
        </div>
      </div>
      
      {/* Decorative blocks */}
      <div className="hidden lg:block absolute top-10 left-10 w-32 h-32 bg-red-500 brutalist-border -rotate-12 brutalist-shadow"></div>
      <div className="hidden lg:block absolute bottom-10 right-10 w-40 h-40 bg-blue-500 brutalist-border rotate-6 brutalist-shadow"></div>
    </section>
  );
};
