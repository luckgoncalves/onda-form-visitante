import { CustomTooltipProps } from '../types';

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2 text-gray-500">
            <span 
              className="inline-block w-3 h-3 rounded-[2px]" 
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="font-medium mt-2 border-t pt-2">
          Total: {total}
        </p>
      </div>
    );
  }
  return null;
}; 