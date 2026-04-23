import React, { useState, useEffect, useCallback, useRef } from 'react';
import Crossword from '@jaredreisinger/react-crossword';
import { db } from './firebase';
import { ref, set } from "firebase/database";
import { Timer, Send, CheckCircle, AlertTriangle } from 'lucide-react'; 
import { data } from './datosCrucigrama';

function Juego({ nickname }) {
  const [segundos, setSegundos] = useState(900); 
  const [finalizado, setFinalizado] = useState(false);
  const [metodoFinalizacion, setMetodoFinalizacion] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const crosswordRef = useRef(null);

  useEffect(() => {
    const manejarAntesDeSalir = (e) => {
      if (!finalizado) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', manejarAntesDeSalir);
    return () => window.removeEventListener('beforeunload', manejarAntesDeSalir);
  }, [finalizado]);

  const enviarResultados = useCallback((motivo = 'tiempo') => {
    if (finalizado) return;
    setFinalizado(true);
    setMetodoFinalizacion(motivo);
    const tiempoEmpleado = 900 - segundos;
    
    set(ref(db, 'participantes/' + nickname), {
      nombre: nickname,
      aciertos: aciertos,
      tiempo: tiempoEmpleado,
      timestamp: Date.now()
    });
  }, [nickname, aciertos, segundos, finalizado]);

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

  const manejarCorrecto = () => {
    setAciertos(prev => (prev < 20 ? prev + 1 : prev));
  };

  if (finalizado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-center font-sans">
        <div className="bg-slate-800 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-700 max-w-lg w-full">
          {metodoFinalizacion === 'manual' ? (
            <>
              <CheckCircle className="size-16 md:size-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">¡Enviado!</h2>
              <p className="text-slate-400 mb-8 text-sm md:text-base italic">Resultados guardados en el sistema.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="size-16 md:size-20 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase text-sky-400 italic tracking-tighter">¡Tiempo Agotado!</h2>
              <p className="text-slate-400 mb-8 text-sm md:text-base">ESCOM - Arquitectura de Computadoras</p>
            </>
          )}
          <div className="text-6xl md:text-8xl font-black text-green-400 bg-slate-950 py-6 md:py-8 rounded-3xl border border-slate-700 shadow-inner">
            {aciertos} <span className="text-2xl md:text-3xl text-slate-600">/ 20</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="bg-slate-900 text-white px-2 py-1 rounded font-black text-[10px] italic">ESCOM</div>
          <span className="font-bold text-slate-700 uppercase text-[10px] md:text-xs tracking-widest truncate max-w-[80px] md:max-w-none">{nickname}</span>
        </div>

        <div className="bg-red-50 border border-red-100 px-4 md:px-8 py-1 md:py-2 rounded-full flex items-center">
          <Timer className="text-red-500 mr-2 size-4 md:size-6" />
          <span className="text-xl md:text-3xl font-black text-red-600 font-mono">
            {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <button onClick={() => enviarResultados('manual')} className="bg-green-600 text-white px-4 md:px-10 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm flex items-center shadow-lg uppercase active:scale-95 transition-all">
          <Send className="mr-2 size-4 md:size-5" /> ENVIAR
        </button>
      </header>

      <main className="w-full max-w-[110rem] mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-10">
        <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-xl border border-slate-200 p-4 md:p-12">
            {/* CONTENEDOR CON SCROLL PARA MÓVIL */}
            <div className="crossword-scroll-container">
                <div className="crossword-wrapper">
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
                            highlightBackground: "#e0f2fe"
                        }}
                    />
                </div>
            </div>
        </div>

        <div className="text-slate-400 text-center text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-black opacity-40 pb-10">
            Arquitectura de Computadoras - ESCOM - IPN
        </div>
      </main>
    </div>
  );
}

export default Juego;