import React, { useState, useEffect } from 'react';
import Login from './Login';
import Juego from './Juego';
import Admin from './Admin'; // Importante importar el Admin

function App() {
  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    // Si entras a: localhost:3000/?admin=true verás el ranking
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setEsAdmin(true);
    }
  }, []);

  if (esAdmin) return <Admin />;

  return (
    <div className="App">
      {!usuario ? (
        <Login alContinuar={(nombre) => setUsuario(nombre)} />
      ) : (
        <Juego nickname={usuario} />
      )}
    </div>
  );
}

export default App;