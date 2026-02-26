
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface BehavioralChartsProps {
  data: {
    if_history: Array<{ day: string, value: number }>;
    cdi_distribution: Array<{ name: string, value: number }>;
    engagement_metrics: Array<{ name: string, value: number }>;
  };
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

const BehavioralCharts: React.FC<BehavioralChartsProps> = ({ data }) => {
  return (
    <div className="space-y-8 my-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interaction Frequency Line Chart */}
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
              وتيرة النشاط الأسبوعي (IF)
            </h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.if_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} reversed={true} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} orientation="right" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', textAlign: 'right', direction: 'rtl' }}
                  itemStyle={{ color: '#3b82f6' }}
                  cursor={{ stroke: '#1e293b', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Diversity Pie Chart */}
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
              تنوع المحتوى الرقمي (CDI)
            </h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.cdi_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {data.cdi_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', textAlign: 'right', direction: 'rtl' }}
                   formatter={(value: number, name: string) => [`${value}%`, `النوع: ${name}`]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Engagement Metrics Bar Chart */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
            مقاييس التفاعل والارتباط (Engagement)
          </h4>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.engagement_metrics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.5} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} orientation="top" />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={80} orientation="right" />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', textAlign: 'right', direction: 'rtl' }}
                 cursor={{ fill: '#1e293b', fillOpacity: 0.4 }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 10, 10, 0]} 
                barSize={40}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.engagement_metrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BehavioralCharts;
