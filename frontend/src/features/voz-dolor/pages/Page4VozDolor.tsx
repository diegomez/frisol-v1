import { TextPage } from '../../../shared/components/TextPage';

export function Page4VozDolor() {
  return (
    <TextPage
      title="Voz del Dolor (Insights)"
      fieldName="voz_dolor"
      helpTitle="Voz del Dolor — Insights"
      helpDescription="Cargá cómo se siente el usuario, citas textuales, frustraciones expresadas. Esta información le da contexto emocional al equipo de desarrollo."
      helpExamples={[
        '"Cada lunes pierdo 2 horas peleando con el sistema" — Juan Pérez, CFO',
        "El equipo está frustrado porque el proceso manual les quita tiempo de ventas",
        "Sienten que la herramienta no fue diseñada para su flujo de trabajo",
        "Un cliente amenazó con irse por los demoras causadas por el sistema",
      ]}
      placeholder="Ingresá las impresiones del usuario, citas textuales, sentimientos, frustraciones..."
      prevPage="3-evidencia"
      nextPage="5-causas"
    />
  );
}