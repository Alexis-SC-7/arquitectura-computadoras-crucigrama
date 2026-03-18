import React, { useState } from 'react';
import { db } from './firebase';
import { ref, get } from "firebase/database";
import { UserCircle, ArrowRightCircle, ShieldAlert } from 'lucide-react';

function Login({ alContinuar }) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const nombreLimpio = nombre.trim();
    
    if (nombreLimpio !== '') {
      // RF: Validación de nombres únicos en Firebase
      const usuarioRef = ref(db, 'participantes/' + nombreLimpio);
      const snapshot = await get(usuarioRef);
      
      if (snapshot.exists()) {
        setError('Este nombre ya está en uso. Por favor, usa uno diferente.');
      } else {
        setError('');
        alContinuar(nombreLimpio); // Pasa al crucigrama
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="bg-sky-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-sky-600">
          <UserCircle size={48} />
        </div>
        
        <h1 className="text-3xl font-black mb-2 text-center text-slate-900 tracking-tighter uppercase">Identificación</h1>
        <p className="text-slate-500 text-center mb-8 text-sm font-medium italic">Acceso al Crucigrama Técnico</p>

        <form onSubmit={manejarEnvio} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`block w-full rounded-2xl border-2 ${error ? 'border-red-200' : 'border-slate-100'} bg-slate-50 p-4 text-slate-900 font-bold focus:border-sky-500 focus:ring-0 transition-all outline-none`}
              placeholder="Ej. Roberto Hernández"
              required
            />
            {error && (
              <p className="mt-3 text-red-500 text-xs font-bold flex items-center gap-1 animate-bounce">
                <ShieldAlert size={14} /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-5 px-6 rounded-2xl hover:bg-sky-600 transition-all font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            Comenzar Reto <ArrowRightCircle size={20} />
          </button>
        </form>
        
        <p className="mt-8 text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          ESCOM - IPN | ARQUITECTURA DE COMPUTADORAS
        </p>
      </div>
    </div>
  );
}

export default Login;