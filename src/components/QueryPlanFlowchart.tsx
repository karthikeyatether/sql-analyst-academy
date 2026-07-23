import React, { useMemo, useState } from "react";
import { Sparkles, Plus, Minus, Download } from "lucide-react";
import { QueryPlanStep } from "../utils/sqlEngine";

interface TreeNode {
  id: number;
  parent: number;
  detail: string;
  children: TreeNode[];
  x: number;
  y: number;
}

interface FlowchartProps {
  planSteps: QueryPlanStep[];
}

export default function QueryPlanFlowchart({ planSteps }: FlowchartProps) {
  const svgLayout = useMemo(() => {
    if (planSteps.length === 0) return null;

    const nodeMap: Record<number, TreeNode> = {};
    planSteps.forEach((step) => {
      nodeMap[step.id] = {
        id: step.id,
        parent: step.parent,
        detail: step.detail,
        children: [],
        x: 0,
        y: 0,
      };
    });

    const rootNodes: TreeNode[] = [];
    planSteps.forEach((step) => {
      const node = nodeMap[step.id];
      if (step.parent === 0) {
        rootNodes.push(node);
      } else {
        const parentNode = nodeMap[step.parent];
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    });

    const levelSpacing = 95;
    const siblingSpacing = 220;

    let maxDepth = 0;

    function computeLayout(node: TreeNode, depth: number, xStart: number, xEnd: number) {
      if (depth > maxDepth) maxDepth = depth;
      
      node.y = 50 + depth * levelSpacing;
      node.x = (xStart + xEnd) / 2;

      if (node.children.length > 0) {
        const width = (xEnd - xStart) / node.children.length;
        node.children.forEach((child, index) => {
          computeLayout(child, depth + 1, xStart + index * width, xStart + (index + 1) * width);
        });
      }
    }

    const canvasWidth = Math.max(800, rootNodes.length * siblingSpacing);
    const stepWidth = canvasWidth / rootNodes.length;
    rootNodes.forEach((root, idx) => {
      computeLayout(root, 0, idx * stepWidth, (idx + 1) * stepWidth);
    });

    const renderedNodes: TreeNode[] = [];
    const renderedLinks: { from: { x: number, y: number }, to: { x: number, y: number } }[] = [];

    function collect(node: TreeNode) {
      renderedNodes.push(node);
      node.children.forEach((child) => {
        renderedLinks.push({
          from: { x: child.x, y: child.y - 30 },
          to: { x: node.x, y: node.y + 30 },
        });
        collect(child);
      });
    }

    rootNodes.forEach(collect);

    return {
      nodes: renderedNodes,
      links: renderedLinks,
      width: canvasWidth,
      height: 100 + maxDepth * levelSpacing + 80
    };
  }, [planSteps]);

  if (planSteps.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: "12px" }}>
        No visual execution plan loaded. Run a query first!
      </div>
    );
  }

  const [flowchartZoom, setFlowchartZoom] = useState(1);

  const downloadFlowchartSvg = () => {
    const svgEl = document.getElementById("query-plan-svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "query_execution_plan_flowchart.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const layout = svgLayout;
  if (!layout) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={14} style={{ color: "var(--violet)" }} />
          <strong style={{ fontSize: "12px" }}>Visual Optimizer Pipeline (Cost & Row Estimates)</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--bg-panel, #15171e)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px" }}>
          <button onClick={() => setFlowchartZoom(z => Math.max(0.5, z - 0.1))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: "2px 4px", display: "inline-flex" }}><Minus size={10} /></button>
          <span style={{ fontSize: "9px", fontWeight: "bold", color: "var(--text)", minWidth: "30px", textAlign: "center" }}>{Math.round(flowchartZoom * 100)}%</span>
          <button onClick={() => setFlowchartZoom(z => Math.min(2, z + 0.1))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: "2px 4px", display: "inline-flex" }}><Plus size={10} /></button>
          <button onClick={() => setFlowchartZoom(1)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: "pointer", color: "var(--text)", padding: "1px 4px", fontSize: "9px", marginLeft: "2px" }}>Reset</button>
          <button onClick={downloadFlowchartSvg} title="Export Flowchart to SVG" style={{ background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: "pointer", color: "var(--cyan)", padding: "1px 6px", fontSize: "9px", marginLeft: "4px", display: "inline-flex", alignItems: "center", gap: "2px" }}><Download size={10} /> Export</button>
        </div>
      </div>
      <div style={{ overflow: "auto", background: "var(--bg2)", borderRadius: "6px", border: "1px solid var(--border)", padding: "10px", maxHeight: "400px" }}>
        <svg 
          id="query-plan-svg"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width * flowchartZoom} 
          height={layout.height * flowchartZoom}
          style={{
            display: 'block',
            transition: 'width 0.15s ease, height 0.15s ease'
          }}
        >
          {layout.links.map((link, idx) => {
            const dy = Math.abs(link.to.y - link.from.y) * 0.45;
            const pathData = `M ${link.from.x} ${link.from.y} C ${link.from.x} ${link.from.y - dy}, ${link.to.x} ${link.to.y + dy}, ${link.to.x} ${link.to.y}`;
            return (
              <g key={`link-${idx}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  style={{ transition: "stroke 0.2s" }}
                />
                <circle cx={link.to.x} cy={link.to.y} r="3" fill="var(--muted)" />
              </g>
            );
          })}

          {layout.nodes.map((node) => {
            const upDetail = node.detail.toUpperCase();
            const isScan = upDetail.includes("SCAN");
            const isCovering = upDetail.includes("COVERING INDEX");
            const isSearch = upDetail.includes("SEARCH");
            const isSort = upDetail.includes("SORT") || upDetail.includes("B-TREE");
            
            let color = "var(--text)";
            let badgeColor = "rgba(255,255,255,0.06)";
            let borderStroke = "var(--border)";
            let title = "OPERATOR";
            let estCost = "Cost: Low";
            let estRows = "~50 rows";

            if (isScan) {
              color = "var(--rose)";
              badgeColor = "rgba(255,96,133,0.1)";
              borderStroke = "rgba(255,96,133,0.3)";
              title = "FULL SCAN ✗";
              estCost = "Cost: High O(N)";
              estRows = "~1k+ rows";
            } else if (isCovering) {
              color = "var(--cyan)";
              badgeColor = "rgba(56,217,255,0.1)";
              borderStroke = "rgba(56,217,255,0.3)";
              title = "COVERING INDEX ⚡";
              estCost = "Cost: O(1)";
              estRows = "~10 rows";
            } else if (isSearch) {
              color = "var(--emerald)";
              badgeColor = "rgba(48,230,149,0.1)";
              borderStroke = "rgba(48,230,149,0.3)";
              title = "INDEX SEARCH ✓";
              estCost = "Cost: O(log N)";
              estRows = "~25 rows";
            } else if (isSort) {
              color = "var(--amber)";
              badgeColor = "rgba(255,190,61,0.1)";
              borderStroke = "rgba(255,190,61,0.3)";
              title = "TEMP SORT";
              estCost = "Cost: O(N log N)";
              estRows = "~100 rows";
            }

            return (
              <g key={`node-${node.id}`} transform={`translate(${node.x - 95}, ${node.y - 28})`}>
                <rect
                  width="190"
                  height="56"
                  rx="6"
                  ry="6"
                  fill="var(--panel)"
                  stroke={borderStroke}
                  strokeWidth="1.5"
                />
                
                <rect
                  width="188"
                  height="16"
                  rx="4"
                  ry="4"
                  fill={badgeColor}
                  x="1"
                  y="1"
                />
                <text
                  x="10"
                  y="12"
                  fill={color}
                  fontSize="9"
                  fontWeight="800"
                  letterSpacing="0.05em"
                >
                  {title}
                </text>
                <text
                  x="180"
                  y="12"
                  fill="var(--muted)"
                  fontSize="8.5"
                  textAnchor="end"
                >
                  ID: {node.id}
                </text>

                <text
                  x="10"
                  y="32"
                  fill="var(--text)"
                  fontSize="9.5"
                  fontFamily="var(--font-mono)"
                >
                  {node.detail.length > 27 ? `${node.detail.substring(0, 25)}...` : node.detail}
                  <title>{node.detail}</title>
                </text>

                <text
                  x="10"
                  y="48"
                  fill={color}
                  fontSize="8.5"
                  fontWeight="600"
                >
                  {estCost} · {estRows}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", fontSize: "10.5px", color: "var(--muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--rose)" }} /> Full Scan (O(N))
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--emerald)" }} /> Index Search (O(log N))
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cyan)" }} /> Covering Index (O(1))
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--amber)" }} /> Temp Sort (Overhead)
        </span>
      </div>
    </div>
  );
}
