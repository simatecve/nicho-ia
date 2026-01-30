
import React, { useState, useEffect } from 'react';
import { Hero } from './sections/Hero';
import { BrutalButton } from './components/BrutalButton';
import { analyzeNiche, generateNicheVisual } from './services/geminiService'; // Fixed: removed non-existent saveLead import
import { saveLead as saveToDb } from './services/supabaseService';
import { UserInput, NicheAnalysis, LeadData } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<NicheAnalysis | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserInput>({
    niche: '',
    salesStatus: 'No',
    ticketPrice: '<$20',
    acquisitionChannel: 'No sé'
  });
  const [emailData, setEmailData] = useState({
    email: '',
    subscribe: false
  });
  const [isSent, setIsSent] = useState(false);
  
  // State for mandatory API key selection when using Gemini 3 Pro models
  const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);

  // Check if API key is selected on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } catch (e) {
        setApiKeySelected(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    // Assume success per guidelines to avoid race condition
    setApiKeySelected(true);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.niche.trim()) return;

    setLoading(true);
    setAnalysis(null);
    setVisualUrl(null);
    
    try {
      const result = await analyzeNiche(formData);
      setAnalysis(result);
      
      // Auto-scroll to results
      setTimeout(() => {
        document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Generate visual using Pro model
      const img = await generateNicheVisual(formData.niche);
      setVisualUrl(img);
    } catch (err: any) {
      console.error(err);
      // Handle "Requested entity was not found." by prompting for a valid paid API key
      if (err.message?.includes("Requested entity was not found.")) {
        setApiKeySelected(false);
        alert("Tu API Key no es válida o no pertenece a un proyecto de pago. Por favor, selecciona una nueva.");
      } else {
        alert("Error al analizar. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis || !emailData.email) return;

    const lead: LeadData = {
      ...formData,
      analysis,
      email: emailData.email,
      subscribe: emailData.subscribe,
      createdAt: new Date().toISOString()
    };

    const success = await saveToDb(lead);
    if (success) {
      setIsSent(true);
    }
  };

  // Mandatory selection screen if key is missing
  if (apiKeySelected === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white brutalist-border brutalist-shadow p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-black mb-6 uppercase tracking-tighter">Acceso Requerido</h1>
          <p className="text-xl font-bold mb-6">
            Esta app utiliza modelos avanzados de Gemini que requieren tu propia clave de API vinculada a un proyecto de pago.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block mb-8 text-blue-600 underline font-bold uppercase text-sm"
          >
            Documentación sobre facturación
          </a>
          <BrutalButton fullWidth onClick={handleSelectKey}>
            Conectar API Key
          </BrutalButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Hero />

      {/* Main Analysis Section */}
      <section id="analizador" className="py-20 px-4 bg-[#e5e7eb] border-b-8 border-black">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-white brutalist-border brutalist-shadow p-8">
            <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">1. Danos el contexto</h2>
            <form onSubmit={handleAnalyze} className="space-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-xl font-bold uppercase">Tu nicho o idea de negocio:</label>
                <textarea 
                  required
                  placeholder="Ej: Agencia de marketing para dentistas especializados en ortodoncia invisible..."
                  className="brutalist-input p-4 text-lg min-h-[120px] resize-none"
                  value={formData.niche}
                  onChange={(e) => setFormData({...formData, niche: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-bold uppercase">¿Ya vendes esto?</label>
                  <select 
                    className="brutalist-input p-3 bg-white text-lg font-bold"
                    value={formData.salesStatus}
                    onChange={(e) => setFormData({...formData, salesStatus: e.target.value})}
                  >
                    <option value="No">No, es una idea</option>
                    <option value="He vendido 1-5">He vendido 1–5</option>
                    <option value="Vendo constante">Vendo constante</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-bold uppercase">Ticket promedio</label>
                  <select 
                    className="brutalist-input p-3 bg-white text-lg font-bold"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                  >
                    <option value="<$20">&lt;$20</option> {/* Fixed line 111: Escaped < to avoid JSX parsing error */}
                    <option value="$20-$100">$20–$100</option>
                    <option value="$100-$500">$100–$500</option>
                    <option value="$500+">$500+</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-bold uppercase">¿Cómo atraes clientes?</label>
                  <select 
                    className="brutalist-input p-3 bg-white text-lg font-bold"
                    value={formData.acquisitionChannel}
                    onChange={(e) => setFormData({...formData, acquisitionChannel: e.target.value})}
                  >
                    <option value="No sé">No sé todavía</option>
                    <option value="Orgánico (redes/SEO)">Orgánico (Redes/SEO)</option>
                    <option value="Ads">Ads (Google/Meta)</option>
                    <option value="Alianzas/B2B">Alianzas / B2B</option>
                  </select>
                </div>
              </div>

              <BrutalButton 
                type="submit" 
                fullWidth 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Analizando con IA...' : 'Calcular NichoScore'}
              </BrutalButton>
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {analysis && (
        <section id="resultados" className="py-20 px-4 bg-white border-b-8 border-black">
          <div className="max-w-[900px] mx-auto">
            <div className="bg-yellow-300 brutalist-border brutalist-shadow p-8 mb-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b-4 border-black pb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase">Tu NichoScore es:</h3>
                  <div className="text-8xl md:text-9xl font-black tracking-tighter">{analysis.score}<span className="text-4xl">/100</span></div>
                </div>
                <div className="bg-black text-white p-6 brutalist-border text-center min-w-[200px]">
                  <p className="uppercase text-sm font-bold opacity-70">Nivel de Viabilidad</p>
                  <p className="text-4xl font-black">{analysis.level.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-3xl font-black uppercase mb-2">"{analysis.headline}"</h4>
                  <p className="text-xl font-bold leading-tight">{analysis.diagnosis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white brutalist-border p-6 brutalist-shadow">
                    <h5 className="text-xl font-black uppercase mb-4 underline decoration-4 decoration-yellow-300">Recomendaciones</h5>
                    <ul className="space-y-2 font-bold list-disc pl-5">
                      {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white brutalist-border p-6 brutalist-shadow">
                    <h5 className="text-xl font-black uppercase mb-4 underline decoration-4 decoration-red-500">Riesgos Principales</h5>
                    <ul className="space-y-2 font-bold list-disc pl-5">
                      {analysis.risks.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Display extracted search grounding sources as required by guidelines */}
                {analysis.sources && analysis.sources.length > 0 && (
                  <div className="bg-white brutalist-border p-6 brutalist-shadow">
                    <h5 className="text-xl font-black uppercase mb-4 underline decoration-4 decoration-blue-500">Fuentes y Validación Real</h5>
                    <ul className="space-y-2 font-bold">
                      {analysis.sources.map((s, i) => (
                        <li key={i}>
                          <a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                            <span>🔗</span> {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {visualUrl && (
                  <div className="mt-8">
                    <h5 className="text-xl font-black uppercase mb-4">Visualización Conceptual del Nicho:</h5>
                    <img src={visualUrl} alt="Niche Visual" className="w-full brutalist-border brutalist-shadow" />
                  </div>
                )}
              </div>
            </div>

            {/* Lead Capture */}
            {!isSent ? (
              <div className="bg-black text-white brutalist-border p-8 brutalist-shadow">
                <h3 className="text-3xl font-black uppercase mb-4">¿Quieres el reporte completo por correo?</h3>
                <p className="text-xl mb-6 font-bold">Incluye un plan de acción detallado de 30 días basado en este análisis.</p>
                <form onSubmit={handleLeadSubmit} className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="email" 
                    required
                    placeholder="Tu mejor email..."
                    className="flex-1 brutalist-border p-4 text-black text-lg font-bold"
                    value={emailData.email}
                    onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                  />
                  <BrutalButton variant="secondary" type="submit">Enviar reporte</BrutalButton>
                </form>
                <div className="mt-4 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="subscribe" 
                    className="w-6 h-6 brutalist-border"
                    checked={emailData.subscribe}
                    onChange={(e) => setEmailData({...emailData, subscribe: e.target.checked})}
                  />
                  <label htmlFor="subscribe" className="font-bold text-sm uppercase">Quiero recibir tips de nichos rentables cada semana</label>
                </div>
              </div>
            ) : (
              <div className="bg-green-400 brutalist-border p-8 brutalist-shadow text-center">
                <h3 className="text-4xl font-black uppercase mb-2">¡HECHO!</h3>
                <p className="text-xl font-bold">Revisa tu correo. Si no llega en 5 min, mira en SPAM.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Process Section */}
      <section id="proceso" className="py-20 px-4 bg-[#f0f0f0] border-b-8 border-black">
        <div className="max-w-[1100px] mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">Cómo funciona esto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { step: "01", title: "ESCRIBES TU IDEA", desc: "Danos el contexto de lo que quieres construir sin filtros." },
              { step: "02", title: "RESPONDES 3 CLAVES", desc: "Validamos ventas, ticket y adquisición con datos reales." },
              { step: "03", title: "RECIBES EL PLAN", desc: "Nuestra IA analiza el mercado y te da el score final." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white brutalist-border p-8 brutalist-shadow text-left">
                <span className="text-6xl font-black opacity-20 block mb-4">{item.step}</span>
                <h3 className="text-2xl font-black uppercase mb-4">{item.title}</h3>
                <p className="text-lg font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white border-b-8 border-black">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-12 text-center">FAQ</h2>
          <div className="space-y-6">
            <details className="brutalist-border p-6 bg-[#e5e7eb] brutalist-shadow cursor-pointer group">
              <summary className="text-2xl font-black uppercase list-none flex justify-between items-center">
                ¿Esto es 100% exacto?
                <span className="group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-lg font-bold">No. Es una guía de señales basada en IA y datos de mercado. El mercado real siempre tiene la última palabra cuando pides la tarjeta de crédito.</p>
            </details>
            <details className="brutalist-border p-6 bg-[#e5e7eb] brutalist-shadow cursor-pointer group">
              <summary className="text-2xl font-black uppercase list-none flex justify-between items-center">
                ¿Qué analiza la IA exactamente?
                <span className="group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-lg font-bold">Analizamos saturación, claridad del cliente ideal, potencial de monetización y facilidad de adquisición de clientes mediante búsqueda en tiempo real.</p>
            </details>
            <details className="brutalist-border p-6 bg-[#e5e7eb] brutalist-shadow cursor-pointer group">
              <summary className="text-2xl font-black uppercase list-none flex justify-between items-center">
                ¿Guarda mis datos?
                <span className="group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-lg font-bold">Sí, guardamos tu nicho y correo para enviarte el reporte y análisis. Respetamos tu privacidad (odio el spam tanto como tú).</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black text-white text-center">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-3xl font-black tracking-tighter italic">NICHOSCORE</div>
          <div className="font-bold uppercase tracking-widest text-sm opacity-70">Hecho para founders reales</div>
          <div className="flex gap-8 font-bold uppercase text-sm">
            <a href="#" className="hover:text-yellow-300">Privacidad</a>
            <a href="#" className="hover:text-yellow-300">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;