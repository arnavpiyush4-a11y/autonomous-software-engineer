import type { ArchitectureMap as ArchitectureMapType, ArchitectureNode } from '@/lib/types';

const NODE_STYLES: Record<ArchitectureNode['type'], { bg: string; border: string; text: string; icon: string }> = {
  frontend:  { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  text: '#60a5fa', icon: '◧' },
  gateway:   { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)', text: '#a78bfa', icon: '⬡' },
  service:   { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#34d399', icon: '◈' },
  database:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#fbbf24', icon: '◫' },
  cache:     { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)', text: '#fb923c', icon: '◪' },
  queue:     { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)',  text: '#22d3ee', icon: '⬟' },
  external:  { bg: 'rgba(107,114,128,0.12)',border: 'rgba(107,114,128,0.35)',text: '#9ca3af', icon: '◻' },
};

const NODE_WIDTH = 120;
const NODE_HEIGHT = 56;

function getNodeCenter(node: ArchitectureNode) {
  return {
    cx: node.x + NODE_WIDTH / 2,
    cy: node.y + NODE_HEIGHT / 2,
  };
}

interface ArchitectureMapProps {
  map: ArchitectureMapType;
}

export default function ArchitectureMap({ map }: ArchitectureMapProps) {
  // Calculate viewBox bounds
  const xs = map.nodes.map((n) => n.x);
  const ys = map.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + NODE_WIDTH + 20;
  const maxY = Math.max(...ys) + NODE_HEIGHT + 20;
  const vbWidth = maxX - minX;
  const vbHeight = maxY - minY;

  const nodeMap = Object.fromEntries(map.nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full rounded-xl border border-border-default bg-bg-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Architecture Map</h3>
          <p className="text-xs text-text-muted mt-0.5">System topology — {map.nodes.length} components, {map.edges.length} connections</p>
        </div>
        <div className="flex items-center gap-3">
          {(['frontend', 'service', 'database', 'cache', 'external'] as ArchitectureNode['type'][]).map((type) => (
            <div key={type} className="flex items-center gap-1">
              <span className="text-xs" style={{ color: NODE_STYLES[type].text }}>{NODE_STYLES[type].icon}</span>
              <span className="text-2xs text-text-muted capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <svg
          viewBox={`${minX} ${minY} ${vbWidth} ${vbHeight}`}
          className="w-full"
          style={{ height: `${Math.max(vbHeight, 300)}px`, maxHeight: '420px' }}
        >
          {/* Defs: arrowhead marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(107,114,128,0.6)" />
            </marker>
          </defs>

          {/* Edges */}
          {map.edges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            const fc = getNodeCenter(from);
            const tc = getNodeCenter(to);

            // Simple straight line with slight offset for visibility
            const dx = tc.cx - fc.cx;
            const dy = tc.cy - fc.cy;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len;
            const uy = dy / len;
            const startX = fc.cx + ux * (NODE_WIDTH / 2 + 4);
            const startY = fc.cy + uy * (NODE_HEIGHT / 2 + 4);
            const endX = tc.cx - ux * (NODE_WIDTH / 2 + 8);
            const endY = tc.cy - uy * (NODE_HEIGHT / 2 + 8);

            return (
              <g key={i}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="rgba(107,114,128,0.35)"
                  strokeWidth="1.5"
                  strokeDasharray={edge.protocol === 'internal' ? '4 3' : 'none'}
                  markerEnd="url(#arrowhead)"
                />
                {edge.protocol && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 5}
                    textAnchor="middle"
                    fill="rgba(107,114,128,0.5)"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {edge.protocol}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {map.nodes.map((node) => {
            const style = NODE_STYLES[node.type];
            return (
              <g key={node.id}>
                {/* Node background */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="8"
                  fill={style.bg}
                  stroke={style.border}
                  strokeWidth="1.5"
                />
                {/* Icon */}
                <text
                  x={node.x + 12}
                  y={node.y + NODE_HEIGHT / 2 + 1}
                  dominantBaseline="middle"
                  fill={style.text}
                  fontSize="14"
                >
                  {style.icon}
                </text>
                {/* Label */}
                <text
                  x={node.x + 28}
                  y={node.y + NODE_HEIGHT / 2 - 6}
                  dominantBaseline="middle"
                  fill="#f9fafb"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {node.label}
                </text>
                {/* Technology */}
                <text
                  x={node.x + 28}
                  y={node.y + NODE_HEIGHT / 2 + 7}
                  dominantBaseline="middle"
                  fill="rgba(156,163,175,0.8)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {node.technology}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
