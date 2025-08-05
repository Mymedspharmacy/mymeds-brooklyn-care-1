import { ResponsiveContainer } from 'recharts';

interface ChartProps {
  children: React.ReactNode;
  className?: string;
}

export function Chart({ children, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
