import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

const CHART_GRADIENTS = [
  { id: 'blueGrad', from: '#3B82F6', to: '#93C5FD' },
  { id: 'greenGrad', from: '#10B981', to: '#6EE7B7' },
  { id: 'amberGrad', from: '#F59E0B', to: '#FDE68A' },
  { id: 'redGrad', from: '#EF4444', to: '#FCA5A5' },
  { id: 'purpleGrad', from: '#8B5CF6', to: '#C4B5FD' },
];

interface ChartBaseProps {
  data: Record<string, unknown>[];
  className?: string;
  height?: number;
}

export interface BarChartProps extends ChartBaseProps {
  xKey: string;
  bars: { key: string; color?: string; name?: string }[];
  stacked?: boolean;
}

export function BarChart({
  data,
  xKey,
  bars,
  stacked,
  height = 300,
  className,
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            {CHART_GRADIENTS.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.from} stopOpacity={0.9} />
                <stop offset="100%" stopColor={g.to} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fontWeight: 500 }} stroke="#9CA3AF" axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F3F4F6', opacity: 0.4 }} />
          {bars.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />}
          {bars.map((bar, i) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name || bar.key}
              fill={bar.color ? `url(#${CHART_GRADIENTS.find(g => g.from === bar.color)?.id || 'blueGrad'})` : `url(#${CHART_GRADIENTS[i % CHART_GRADIENTS.length].id})`}
              stackId={stacked ? 'stack' : undefined}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface LineChartProps extends ChartBaseProps {
  xKey: string;
  lines: { key: string; color?: string; name?: string }[];
}

export function LineChart({
  data,
  xKey,
  lines,
  height = 300,
  className,
}: LineChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            {CHART_GRADIENTS.map((g) => (
              <linearGradient key={g.id} id={`${g.id}Area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.from} stopOpacity={0.25} />
                <stop offset="100%" stopColor={g.from} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fontWeight: 500 }} stroke="#9CA3AF" axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
          {lines.map((line, i) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name || line.key}
              stroke={line.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface PieChartProps extends ChartBaseProps {
  dataKey: string;
  nameKey: string;
  donut?: boolean;
  colors?: string[];
}

export function PieChart({
  data,
  dataKey,
  nameKey,
  donut,
  height = 300,
  className,
  colors = CHART_COLORS,
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 60 : 0}
            outerRadius={100}
            paddingAngle={3}
            strokeWidth={0}
            label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 30;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text x={x} y={y} fill="#6B7280" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={600}>
                  {name} {(percent * 100).toFixed(0)}%
                </text>
              );
            }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface AreaChartProps extends ChartBaseProps {
  xKey: string;
  areas: { key: string; color?: string; name?: string }[];
}

export function AreaChart({
  data,
  xKey,
  areas,
  height = 300,
  className,
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            {areas.map((area, i) => {
              const color = area.color || CHART_COLORS[i % CHART_COLORS.length];
              const id = `areaGrad-${i}`;
              return (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fontWeight: 500 }} stroke="#9CA3AF" axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D1D5DB', strokeDasharray: '4 4' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
          {areas.map((area, i) => {
            const color = area.color || CHART_COLORS[i % CHART_COLORS.length];
            return (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name || area.key}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#areaGrad-${i})`}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
      <p className="mb-1.5 text-xs font-medium text-gray-400">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
