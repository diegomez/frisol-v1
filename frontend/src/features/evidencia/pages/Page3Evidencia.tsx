import { TextPage } from '../../../shared/components/TextPage';

export function Page3Evidencia() {
  return (
    <TextPage
      title="Evidencia (Datos cuantitativos)"
      fieldName="evidencia"
      helpTitle="Evidencia Cuantitativa"
      helpDescription="Cargá datos numéricos y métricas que respalden el problema. Esto ayuda al equipo de desarrollo a dimensionar el impacto real."
      helpExamples={[
        "Tiempo promedio de respuesta: 45 segundos (objetivo: 5s)",
        "Frecuencia de errores: 15 veces por semana",
        "Costo de retrabajo: $2,500/mes en horas hombre",
        "Usuarios afectados: 80% del equipo de ventas (40 personas)",
        "Pérdida estimada: 3 horas/productivo por día por usuario",
      ]}
      placeholder="Ingresá los datos cuantitativos, métricas, tiempos, costos, frecuencias de error, etc."
      prevPage="2-diagnostico"
      nextPage="4-voz-dolor"
    />
  );
}