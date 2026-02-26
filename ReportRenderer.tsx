
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import BehavioralCharts from './BehavioralCharts';

interface ReportRendererProps {
  content: string;
}

const ReportRenderer: React.FC<ReportRendererProps> = ({ content }) => {
  // Extract chart data from the content
  const chartMatch = content.match(/\[CHART_DATA\]([\s\S]*?)\[\/CHART_DATA\]/);
  const cleanContent = content.replace(/\[CHART_DATA\][\s\S]*?\[\/CHART_DATA\]/, '');
  
  let chartData = null;
  if (chartMatch && chartMatch[1]) {
    try {
      chartData = JSON.parse(chartMatch[1].trim());
    } catch (e) {
      console.error("Failed to parse chart data:", e);
    }
  }

  return (
    <div className="prose prose-invert prose-blue max-w-none text-right rtl">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-blue-400 border-b border-blue-900 pb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-indigo-300" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-6 mb-2 text-cyan-200" {...props} />,
          p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-slate-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
          strong: ({ node, ...props }) => <strong className="text-blue-300 font-bold" {...props} />,
          // Enhanced code block rendering
          pre: ({ node, ...props }) => (
            <div className="relative my-6 group">
              <pre 
                className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 overflow-x-auto text-left dir-ltr shadow-2xl shadow-blue-500/5"
                style={{ direction: 'ltr' }} 
                {...props} 
              />
            </div>
          ),
          // Differentiate between inline code and code blocks
          code: ({ node, ...props }) => {
            const isInline = !props.className; 
            return isInline ? (
              <code className="bg-slate-800/80 text-cyan-400 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-slate-700/50" {...props} />
            ) : (
              <code className="text-blue-100 font-mono text-sm leading-relaxed" {...props} />
            );
          },
          // Table rendering for structured data if the model provides it
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-800">
              <table className="w-full text-sm text-right" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="bg-slate-800/50 p-3 font-bold text-blue-300 border-b border-slate-700" {...props} />,
          td: ({ node, ...props }) => <td className="p-3 border-b border-slate-800/50 text-slate-300" {...props} />,
        }}
      >
        {cleanContent}
      </ReactMarkdown>

      {chartData && <BehavioralCharts data={chartData} />}
    </div>
  );
};

export default ReportRenderer;
