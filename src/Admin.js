import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue } from "firebase/database";
import { Trophy, Medal, Clock3, Users, BarChart3, Binary, Share2, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// RNF01: Diseño Senior para Proyector (Alto Contraste y Claridad)
function Admin() {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarQR, setMostrarQR] = useState(false); // Estado para el Modal del QR

  // RF09: Lectura de datos en Tiempo Real
  useEffect(() => {
    const participantesRef = ref(db, 'participantes/');
    const unsubscribe = onValue(participantesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaConvertida = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        // RF10: Lógica de Ranking Avanzada
        const listaOrdenada = listaConvertida.sort((a, b) => {
          if (b.aciertos !== a.aciertos) {
            return b.aciertos - a.aciertos;
          }
          if (a.tiempo !== b.tiempo) {
            return a.tiempo - b.tiempo; 
          }
          return a.timestamp - b.timestamp; 
        });

        setParticipantes(listaOrdenada);
      } else {
        setParticipantes([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // RF09: Formateo de Tiempo a M:SS
  const formatearTiempo = (segundosTotales) => {
    if (segundosTotales === undefined || segundosTotales === null) return "N/A";
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  const obtenerIconoRango = (index) => {
    if (index === 0) return <Medal className="size-8 text-yellow-400" />; 
    if (index === 1) return <Medal className="size-7 text-slate-300" />;  
    if (index === 2) return <Medal className="size-6 text-orange-500" />; 
    return <span className="font-mono text-xl text-slate-500">{index + 1}</span>;
  };

  const obtenerClaseFila = (index) => {
    if (index === 0) return "bg-yellow-950/30 border-l-4 border-yellow-500";
    if (index === 1) return "bg-slate-800/50 border-l-4 border-slate-400";
    if (index === 2) return "bg-orange-950/30 border-l-4 border-orange-600";
    return "bg-slate-900 hover:bg-slate-800/80 border-l-4 border-transparent";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-300 font-sans p-6 text-center">
        <Binary className="size-16 animate-pulse text-sky-500 mb-6" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Cargando Leaderboard...</h1>
        <p className="mt-4 text-xl text-slate-400 font-medium italic underline decoration-sky-500/30">ESCOM - Arquitectura de Computadoras</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
      
      {/* HEADER DEL DASHBOARD */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-10 border-b border-slate-800 mb-10">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 text-sky-400 p-5 rounded-3xl border border-slate-800 shadow-xl">
            <Trophy size={48} className="stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Leaderboard</h1>
            <p className="text-xl text-slate-400 font-medium italic">Reto Técnico: Arquitectura de Computadoras</p>
          </div>
        </div>
        
        {/* Estadísticas y Botón de QR */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setMostrarQR(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-4 rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-sky-900/20 active:scale-95 uppercase text-sm tracking-widest"
          >
            <QrCode size={24} /> Mostrar Acceso
          </button>

          <div className="grid grid-cols-2 gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="text-center px-4 border-r border-slate-700/50">
              <Users className="mx-auto size-6 text-slate-500 mb-1" />
              <span className="block text-3xl font-black text-white tracking-tight">{participantes.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alumnos</span>
            </div>
            <div className="text-center px-4">
              <BarChart3 className="mx-auto size-6 text-slate-500 mb-1" />
              <span className="block text-xl font-bold text-sky-400 pt-1 tracking-tight italic">LIVE</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Firebase</span>
            </div>
          </div>
        </div>
      </header>

      {/* TABLA PRINCIPAL */}
      <main className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden">
        {participantes.length === 0 ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/50">
            <Users className="mx-auto size-16 text-slate-700 mb-6" />
            <h3 className="text-3xl font-bold text-slate-500">Esperando a los participantes...</h3>
            <button onClick={() => setMostrarQR(true)} className="mt-6 text-sky-400 font-black uppercase text-sm tracking-widest hover:text-sky-300">Proyectar Código QR ahora</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-5 text-sm uppercase font-bold text-slate-400 tracking-wider w-24">Rango</th>
                  <th className="px-6 py-5 text-sm uppercase font-bold text-slate-400 tracking-wider">Usuario</th>
                  <th className="px-6 py-5 text-sm uppercase font-bold text-slate-400 tracking-wider text-center">Aciertos / 20</th>
                  <th className="px-6 py-5 text-sm uppercase font-bold text-slate-400 tracking-wider text-right w-40">
                    <Clock3 className="inline size-5 mr-2 text-slate-500" />Tiempo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {participantes.map((p, index) => (
                  <tr key={p.id} className={`${obtenerClaseFila(index)} transition-colors`}>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-950/50 border border-slate-700/50 shadow-inner">
                        {obtenerIconoRango(index)}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`font-extrabold tracking-tight ${index < 3 ? 'text-2xl text-white' : 'text-xl text-slate-100'}`}>
                        {p.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`inline-flex items-end gap-1 font-black leading-none ${p.aciertos >= 18 ? 'text-green-400' : 'text-sky-400'}`}>
                        <span className="text-4xl tracking-tighter">{p.aciertos}</span>
                        <span className="text-xl text-slate-600 pb-0.5">/ 20</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-mono font-bold">
                      <div className={`tracking-tight ${index < 3 ? 'text-2xl text-white' : 'text-xl text-slate-200'}`}>
                        {formatearTiempo(p.tiempo)}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">min:seg</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL QR DINÁMICO */}
      {mostrarQR && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl max-w-sm w-full relative">
            <button 
              onClick={() => setMostrarQR(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={32} />
            </button>

            <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase text-slate-900 italic">Unirse al Reto</h3>
            <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">Escanea para comenzar el crucigrama</p>
            
            <div className="bg-slate-50 p-8 rounded-[2.5rem] inline-block border border-slate-100 shadow-inner">
              <QRCodeSVG value={window.location.origin} size={250} />
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 text-slate-400">
              <Share2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{window.location.origin}</span>
            </div>
            
            <button 
              onClick={() => setMostrarQR(false)} 
              className="mt-8 w-full py-5 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl"
            >
              Volver al Leaderboard
            </button>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center py-6 border-t border-slate-800 text-slate-600 font-medium">
        Escuela Superior de Cómputo - IPN | Arquitectura de Computadoras | {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default Admin;