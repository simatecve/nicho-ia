
import { LeadData } from "../types";

// Note: Real implementation would use @supabase/supabase-js
// This simulates the database interaction as requested.

export const saveLead = async (data: LeadData): Promise<boolean> => {
  console.log("Simulando guardado en Supabase:", data);
  
  // En un entorno real, usaríamos:
  // const { data, error } = await supabase.from('leads').insert([data]);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Guardamos en localStorage para persistencia local de demo
      const existing = JSON.parse(localStorage.getItem('nicho_leads') || '[]');
      existing.push(data);
      localStorage.setItem('nicho_leads', JSON.stringify(existing));
      resolve(true);
    }, 1000);
  });
};
