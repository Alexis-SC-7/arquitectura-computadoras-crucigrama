import React, { useState, useEffect, useCallback, useRef } from 'react';
import Crossword from '@jaredreisinger/react-crossword';
import { db } from './firebase';
import { ref, set } from "firebase/database";
import { Timer, Send, CheckCircle, AlertTriangle } from 'lucide-react'; 
import { data } from './datosCrucigrama';

function Juego({ nickname }) {
  // RF04: Sesión única - El tiempo inicia siempre en 15:00
  const [segundos, setSegundos] = useState(900); 
  
  const [finalizado, setFinalizado] = useState(false);
  const [metodoFinalizacion, setMetodoFinalizacion] = useState(null); // 'manual' o 'tiempo'
  const [aciertos, setAciertos] = useState(0);
  const crosswordRef = useRef(null);

  // --- BLOQUE DE SEGURIDAD: PESTAÑA DE EMERGENCIA ---
  // RNF01: Evita que el usuario pierda su progreso por error
  useEffect(() => {
    const manejarAntesDeSalir = (e) => {
      if (!finalizado) {
        e.preventDefault();
        e.returnValue = ''; // Muestra el mensaje de confirmación del navegador
      }
    };
    window.addEventListener('beforeunload', manejarAntesDeSalir);
    return () => window.removeEventListener('beforeunload', manejarAntesDeSalir);
  }, [finalizado]);

  // RF05 y RF06: Envío de resultados
  const enviarResultados = useCallback((motivo = 'tiempo') => {
    if (finalizado) return;
    setFinalizado(true);
    setMetodoFinalizacion(motivo);

    const tiempoEmpleado = 900 - segundos;
    
    // RF10: Registro único en Firebase [cite: 2026-02-16]
    set(ref(db, 'participantes/' + nickname), {
      nombre: nickname,
      aciertos: aciertos,
      tiempo: tiempoEmpleado,
      timestamp: Date.now()
    });
  }, [nickname, aciertos, segundos, finalizado]);

  // RF04: Lógica de Cronómetro de sesión única
  useEffect(() => {
    if (segundos > 0 && !finalizado) {
      const timer = setInterval(() => {
        setSegundos(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (segundos === 0 && !finalizado) {
      enviarResultados('tiempo');
    }
  }, [segundos, finalizado, enviarResultados]);

  // RNF05: Validación por palabra completa (Máximo 20)
  const manejarCorrecto = () => {
    setAciertos(prev => (prev < 20 ? prev + 1 : prev));
  };

  // Pantalla de Feedback Final Dinámica
  if (finalizado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-center font-sans">
        <div className="bg-slate-800 p-12 rounded-[3rem] shadow-2xl border border-slate-700 max-w-lg w-full">
          {metodoFinalizacion === 'manual' ? (
            <>
              <CheckCircle className="size-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">¡Enviado!</h2>
              <p className="text-slate-400 mb-8 font-medium italic">Tus respuestas han sido guardadas correctamente en el sistema.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="size-20 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter text-sky-400 italic">¡Tiempo Agotado!</h2>
              <p className="text-slate-400 mb-8 font-medium italic">ESCOM - Arquitectura de Computadoras</p>
            </>
          )}

          <div className="text-8xl font-black text-green-400 bg-slate-950 py-8 rounded-3xl border border-slate-700 shadow-inner">
            {aciertos} <span className="text-3xl text-slate-600">/ 20</span>
          </div>
          <p className="mt-8 text-slate-500 text-sm italic">Tu posición aparecerá en tiempo real en el Leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER SENIOR SIN BOTÓN QR */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-xs italic tracking-tighter">ESCOM</div>
          <span className="font-bold text-slate-700 uppercase text-xs tracking-[0.2em]">{nickname}</span>
        </div>

        <div className="bg-red-50 border border-red-100 px-8 py-2 rounded-full shadow-inner animate-pulse">
          <Timer className="text-red-500 mr-3 size-6" />
          <span className="text-3xl font-black text-red-600 font-mono tracking-tighter">
            {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => enviarResultados('manual')} className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-2xl font-black text-sm tracking-widest flex items-center shadow-xl uppercase active:scale-95 transition-all">
            <Send className="mr-3 size-5" /> ENVIAR
          </button>
        </div>
      </header>

      {/* ÁREA DE JUEGO: CRUCIGRAMA ARRIBA Y PALABRAS ABAJO */}
      <main className="max-w-[110rem] mx-auto w-full p-8 flex flex-col gap-10">
        
        {/* TABLERO CENTRADO ARRIBA */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 p-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-5xl">
                <Crossword 
                    ref={crosswordRef}
                    data={data} 
                    onAnswerCorrect={manejarCorrecto}
                    theme={{
                        gridBackground: "transparent",
                        cellBackground: "#ffffff",
                        cellBorder: "#000000",
                        textColor: "#000000",
                        numberColor: "#000000",
                        focusBackground: "#38bdf8",
                        highlightBackground: "#e0f2fe",
                        columnBreakpoint: '768px' // Renderiza pistas abajo
                    }}
                />
            </div>
        </div>

        {/* NOTA DE IDENTIDAD */}
        <div className="text-slate-400 text-center text-[10px] uppercase tracking-[0.4em] font-black opacity-40">
            Arquitectura de Computadoras - ESCOM - IPN
        </div>
      </main>
    </div>
  );
}

export default Juego;