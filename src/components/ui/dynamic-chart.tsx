import dynamic from 'next/dynamic';
import type { BarChartProps, LineChartProps, PieChartProps, AreaChartProps } from './chart';

export const BarChart = dynamic<BarChartProps>(
  () => import('./chart').then(mod => mod.BarChart),
  { ssr: false }
);

export const LineChart = dynamic<LineChartProps>(
  () => import('./chart').then(mod => mod.LineChart),
  { ssr: false }
);

export const PieChart = dynamic<PieChartProps>(
  () => import('./chart').then(mod => mod.PieChart),
  { ssr: false }
);

export const AreaChart = dynamic<AreaChartProps>(
  () => import('./chart').then(mod => mod.AreaChart),
  { ssr: false }
);
