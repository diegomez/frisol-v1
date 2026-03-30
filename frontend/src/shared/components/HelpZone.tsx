interface HelpZoneProps {
  title: string;
  description: string;
  examples: string[];
}

export function HelpZone({ title, description, examples }: HelpZoneProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-blue-800 mb-2">{title}</h3>
      <p className="text-sm text-blue-700 mb-3">{description}</p>
      {examples.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-blue-600">Ejemplos:</p>
          <ul className="list-disc list-inside space-y-1">
            {examples.map((example, i) => (
              <li key={i} className="text-xs text-blue-600">{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
