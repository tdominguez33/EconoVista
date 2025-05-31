export async function medirRendimiento(url: string, repeticiones: number = 5) {
  const tiempos: number[] = [];

  for (let i = 0; i < repeticiones; i++) {
    const inicio = performance.now();
    try {
      await fetch(url);
    } catch (err) {
      console.error("Error en la solicitud:", err);
      continue;
    }
    const fin = performance.now();
    const duracion = fin - inicio;
    tiempos.push(duracion);
    console.log(`Prueba ${i + 1}: ${duracion.toFixed(2)} ms`);
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  console.log(`\nTiempo promedio de respuesta: ${promedio.toFixed(2)} ms`);
}
