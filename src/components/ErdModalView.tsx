import React, { useState } from "react";
import { Database, X, Minus, Plus, Zap } from "lucide-react";

interface ErdModalViewProps {
  setErdModalOpen: (open: boolean) => void;
  liveSchema: any[];
  tableSchemas: any[];
}

export default function ErdModalView({
  setErdModalOpen,
  liveSchema,
  tableSchemas,
}: ErdModalViewProps) {
  // Scoped local states pushed down from App
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [erdZoom, setErdZoom] = useState(1);

  React.useEffect(() => {
    const modalElement = document.getElementById("erd-explorer-dialog");
    if (!modalElement) return;

    const focusable = modalElement.querySelectorAll('button, select, [tabindex="0"]');
    if (focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setErdModalOpen(false);
      }
      if (e.key === "Tab" && focusable.length > 0) {
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setErdModalOpen]);

  const activeTable = selectedTable || hoveredTable;
  const liveTables = liveSchema.length > 0 ? liveSchema : tableSchemas;
  
  const liveTablesWithDefaults = liveTables.map((t) => ({
    ...t,
    domain: (t as any).domain || (t.name.toLowerCase().startsWith("temp") ? "Temporary Data" : "Custom Data"),
    description:
      (t as any).description ||
      (t.name.toLowerCase().startsWith("temp")
        ? "Temporary table generated during session execution."
        : "Permanent database table created by user query."),
    primaryKey: (t as any).primaryKey || (t.columns[0] ? t.columns[0].name : ""),
    relationships: (t as any).relationships || [],
  }));

  const activeSchema = liveTablesWithDefaults.find((t) => t.name === activeTable);
  const CORE_TABLES = [
    "customers",
    "orders",
    "order_items",
    "products",
    "subscriptions",
    "departments",
    "employees",
    "payments",
  ];
  const extraTables = liveTablesWithDefaults.filter((t) => !CORE_TABLES.includes(t.name.toLowerCase()));
  const canvasWidth = extraTables.length > 0 ? 920 : 730;

  const handleErdNodeKeyDown = (e: React.KeyboardEvent<SVGElement>, tableName: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedTable(selectedTable === tableName ? null : tableName);
    }
  };

  const isConnected = (tableName: string) => {
    if (!activeTable) return false;
    if (tableName === activeTable) return true;
    const tableObj = liveTablesWithDefaults.find((t) => t.name === activeTable);
    if (tableObj) {
      const forward = tableObj.relationships.some((rel: string) => {
        const parts = rel.split(".");
        return parts[0] === tableName;
      });
      if (forward) return true;
    }

    const targetTableObj = liveTablesWithDefaults.find((t) => t.name === tableName);
    if (targetTableObj) {
      const reverse = targetTableObj.relationships.some((rel: string) => {
        const parts = rel.split(".");
        return parts[0] === activeTable;
      });
      if (reverse) return true;
    }

    return false;
  };

  const isPathHighlighted = (fromTable: string, toTable: string) => {
    if (!activeTable) return false;
    return (
      (fromTable === activeTable && isConnected(toTable)) ||
      (toTable === activeTable && isConnected(fromTable))
    );
  };

  const getAccentColor = (domain: string) => {
    switch (domain) {
      case "E-Commerce":
        return "var(--erd-customer-accent)";
      case "Sales":
        return "var(--erd-order-accent)";
      case "Retention":
        return "var(--erd-order-accent)";
      case "Product Performance":
        return "var(--erd-product-accent)";
      case "Finance":
        return "var(--erd-finance-accent)";
      case "Employees":
        return "var(--erd-employee-accent)";
      default:
        return "var(--cyan)";
    }
  };

  const ERD_RELATIONS = [
    {
      id: "cust-orders",
      t1: "customers",
      t2: "orders",
      x1: 180,
      y1: 90,
      x2: 290,
      y2: 90,
      stroke: "var(--erd-customer-accent)",
    },
    {
      id: "cust-subs",
      t1: "customers",
      t2: "subscriptions",
      x1: 105,
      y1: 130,
      x2: 105,
      y2: 190,
      stroke: "var(--erd-customer-accent)",
    },
    {
      id: "ord-items",
      t1: "orders",
      t2: "order_items",
      x1: 365,
      y1: 130,
      x2: 365,
      y2: 190,
      stroke: "var(--erd-order-accent)",
    },
    {
      id: "ord-pay",
      t1: "orders",
      t2: "payments",
      x1: 440,
      y1: 90,
      x2: 550,
      y2: 90,
      stroke: "var(--erd-order-accent)",
    },
    {
      id: "prod-items",
      t1: "products",
      t2: "order_items",
      x1: 550,
      y1: 230,
      x2: 440,
      y2: 230,
      stroke: "var(--erd-product-accent)",
    },
    {
      id: "dept-emp",
      t1: "departments",
      t2: "employees",
      x1: 285,
      y1: 370,
      x2: 405,
      y2: 370,
      stroke: "var(--erd-employee-accent)",
    },
    {
      id: "emp-self",
      t1: "employees",
      t2: "employees",
      isPath: true,
      d: "M 555 350 C 595 350, 595 410, 555 410",
      stroke: "var(--erd-employee-accent)",
    },
  ];

  return (
    <div className="erd-modal-overlay" onClick={() => setErdModalOpen(false)}>
      <div 
        id="erd-explorer-dialog"
        className="erd-modal-window" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="erd-explorer-title"
      >
        <div className="erd-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={18} style={{ color: "var(--cyan)" }} />
            <div>
              <h2 id="erd-explorer-title" style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Interactive ERD Explorer</h2>
              <p style={{ fontSize: "10.5px", color: "var(--muted)", margin: 0 }}>
                Hover to highlight joins, click to select and lock schema properties
              </p>
            </div>
          </div>
          <button
            className="icon-button"
            onClick={() => setErdModalOpen(false)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close ERD Explorer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="erd-modal-body">
          <div
            className="erd-modal-canvas-column"
            style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div className="erd-zoom-controls">
              <button
                className="icon-button small"
                title="Zoom Out"
                onClick={() => setErdZoom((z) => Math.max(0.5, z - 0.1))}
                style={{ padding: "4px", cursor: "pointer", display: "inline-flex" }}
                aria-label="Zoom Out"
              >
                <Minus size={12} />
              </button>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  minWidth: "36px",
                  textAlign: "center",
                  lineHeight: "20px",
                  color: "var(--text)",
                }}
              >
                {Math.round(erdZoom * 100)}%
              </span>
              <button
                className="icon-button small"
                title="Zoom In"
                onClick={() => setErdZoom((z) => Math.min(2, z + 0.1))}
                style={{ padding: "4px", cursor: "pointer", display: "inline-flex" }}
                aria-label="Zoom In"
              >
                <Plus size={12} />
              </button>
              <button
                className="secondary-button compact"
                onClick={() => setErdZoom(1)}
                style={{
                  padding: "2px 6px",
                  fontSize: "9px",
                  marginLeft: "4px",
                  cursor: "pointer",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  color: "var(--text)",
                }}
              >
                Reset
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                padding: "12px",
              }}
            >
              <svg
                viewBox={`0 0 ${canvasWidth} 450`}
                className={`erd-svg-canvas ${activeTable ? "erd-canvas-active" : ""}`}
                width={canvasWidth * erdZoom}
                height={450 * erdZoom}
                style={{
                  transition: "width 0.15s ease, height 0.15s ease",
                  display: "block",
                }}
              >
                <defs>
                  <filter id="glow-line" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Relationships pipelines */}
                {ERD_RELATIONS.map((rel) => {
                  const active = isPathHighlighted(rel.t1, rel.t2);
                  const isAnyActive = activeTable !== null;
                  const opacity = active ? 1.0 : isAnyActive ? 0.15 : 0.5;
                  const strokeWidth = active ? 2.5 : 1.5;

                  if (rel.isPath) {
                    return (
                      <path
                        key={rel.id}
                        d={rel.d}
                        fill="none"
                        stroke={active ? getAccentColor(activeSchema?.domain || "") : "var(--faint)"}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        className={`erd-relationship-path ${active ? "path-highlighted animate-flow" : ""}`}
                      />
                    );
                  }
                  return (
                    <line
                      key={rel.id}
                      x1={rel.x1}
                      y1={rel.y1}
                      x2={rel.x2}
                      y2={rel.y2}
                      stroke={active ? getAccentColor(activeSchema?.domain || "") : "var(--faint)"}
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      className={`erd-relationship-path ${active ? "path-highlighted animate-flow" : ""}`}
                    />
                  );
                })}

                {/* Table Nodes */}
                {/* Customers */}
                <g
                  className={`erd-node ${
                    selectedTable === "customers" ? "selected" : ""
                  } ${
                    isConnected("customers") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("customers")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "customers" ? null : "customers")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "customers")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "customers"}
                  aria-label={
                    "customers table. Primary key: customer_id. Fields: " +
                    "full name, city, region, signup date, segment"
                  }
                  transform="translate(30, 50)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-customer-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    customers
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: customer_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    full_name · city · region
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    signup_date · segment
                  </text>
                </g>

                {/* Orders */}
                <g
                  className={`erd-node ${
                    selectedTable === "orders" ? "selected" : ""
                  } ${
                    isConnected("orders") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("orders")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "orders" ? null : "orders")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "orders")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "orders"}
                  aria-label={
                    "orders table. Primary key: order_id. Fields: " +
                    "customer id, order date, status, total amount"
                  }
                  transform="translate(290, 50)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-order-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    orders
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: order_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    customer_id (FK) · order_date
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    status · total_amount
                  </text>
                </g>

                {/* Payments */}
                <g
                  className={`erd-node ${
                    selectedTable === "payments" ? "selected" : ""
                  } ${
                    isConnected("payments") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("payments")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "payments" ? null : "payments")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "payments")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "payments"}
                  aria-label={
                    "payments table. Primary key: payment_id. Fields: " +
                    "order id, payment date, payment mode, amount"
                  }
                  transform="translate(550, 50)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-finance-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    payments
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: payment_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    order_id (FK) · payment_date
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    payment_mode · amount
                  </text>
                </g>

                {/* Subscriptions */}
                <g
                  className={`erd-node ${
                    selectedTable === "subscriptions" ? "selected" : ""
                  } ${
                    isConnected("subscriptions") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("subscriptions")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "subscriptions" ? null : "subscriptions")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "subscriptions")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "subscriptions"}
                  aria-label={
                    "subscriptions table. Primary key: subscription_id. Fields: " +
                    "customer id, plan name, monthly fee, status"
                  }
                  transform="translate(30, 190)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-order-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    subscriptions
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: subscription_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    customer_id (FK) · plan_name
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    monthly_fee · status
                  </text>
                </g>

                {/* Order Items */}
                <g
                  className={`erd-node ${
                    selectedTable === "order_items" ? "selected" : ""
                  } ${
                    isConnected("order_items") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("order_items")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "order_items" ? null : "order_items")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "order_items")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "order_items"}
                  aria-label={
                    "order items table. Primary key: order_item_id. Fields: " +
                    "order id, product id, quantity, unit price"
                  }
                  transform="translate(290, 190)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-order-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    order_items
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: order_item_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    order_id (FK) · product_id (FK)
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    quantity · unit_price
                  </text>
                </g>

                {/* Products */}
                <g
                  className={`erd-node ${
                    selectedTable === "products" ? "selected" : ""
                  } ${
                    isConnected("products") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("products")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "products" ? null : "products")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "products")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "products"}
                  aria-label={
                    "products table. Primary key: product_id. Fields: " +
                    "product name, category, cost price, list price"
                  }
                  transform="translate(550, 190)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-product-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    products
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: product_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    product_name · category
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    cost_price · list_price
                  </text>
                </g>

                {/* Departments */}
                <g
                  className={`erd-node ${
                    selectedTable === "departments" ? "selected" : ""
                  } ${
                    isConnected("departments") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("departments")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "departments" ? null : "departments")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "departments")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "departments"}
                  aria-label={
                    "departments table. Primary key: department_id. Fields: " +
                    "department name, office city, budget lakhs"
                  }
                  transform="translate(135, 330)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-employee-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    departments
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: department_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    department_name
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    office_city · budget_lakhs
                  </text>
                </g>

                {/* Employees */}
                <g
                  className={`erd-node ${
                    selectedTable === "employees" ? "selected" : ""
                  } ${
                    isConnected("employees") ? "connected-highlight" : ""
                  }`}
                  onMouseEnter={() => setHoveredTable("employees")}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(selectedTable === "employees" ? null : "employees")}
                  onKeyDown={(e) => handleErdNodeKeyDown(e, "employees")}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedTable === "employees"}
                  aria-label={
                    "employees table. Primary key: employee_id. Fields: " +
                    "employee name, role, salary LPA, manager id"
                  }
                  transform="translate(405, 330)"
                  filter="url(#card-shadow)"
                >
                  <rect width="150" height="80" rx="8" className="erd-node-bg" />
                  <rect width="4" height="80" rx="2" fill="var(--erd-employee-accent)" />
                  <text x="16" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
                    employees
                  </text>
                  <text x="16" y="42" fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
                    PK: employee_id
                  </text>
                  <text x="16" y="58" fill="var(--faint)" fontSize="8.5">
                    role · dept_id (FK)
                  </text>
                  <text x="16" y="70" fill="var(--faint)" fontSize="8.5">
                    salary_lpa · mgr_id (FK)
                  </text>
                </g>

                {extraTables.map((table, index) => {
                  const x = 740;
                  const y = 50 + index * 95;
                  const active = activeTable === table.name;
                  const isAnyActive = activeTable !== null;
                  const opacity = active ? 1.0 : isAnyActive ? 0.25 : 0.85;
                  const isTemp = table.name.toLowerCase().startsWith("temp");

                  return (
                    <g
                      key={table.name}
                      className={`erd-node ${
                        selectedTable === table.name ? "selected" : ""
                      } ${
                        isConnected(table.name) ? "connected-highlight" : ""
                      }`}
                      onMouseEnter={() => setHoveredTable(table.name)}
                      onMouseLeave={() => setHoveredTable(null)}
                      onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                      onKeyDown={(e) => handleErdNodeKeyDown(e, table.name)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedTable === table.name}
                      transform={`translate(${x}, ${y})`}
                      filter="url(#card-shadow)"
                      opacity={opacity}
                      style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    >
                      <rect
                        width="150"
                        height="80"
                        rx="8"
                        className="erd-node-bg"
                        stroke={selectedTable === table.name ? "var(--purple)" : "var(--border)"}
                        strokeWidth={selectedTable === table.name ? 2 : 1}
                      />
                      <rect width="4" height="80" rx="2" fill="var(--purple, #a855f7)" />
                      <text x="16" y="24" fill="var(--text)" fontSize="11" fontWeight="700">
                        {table.name}
                      </text>
                      <text
                        x="16"
                        y="38"
                        fill="var(--purple, #a855f7)"
                        fontSize="8.5"
                        fontWeight="700"
                        opacity="0.9"
                      >
                        [{isTemp ? "TEMP" : "USER"}]
                      </text>
                      <text x="16" y="54" fill="var(--muted)" fontSize="8.5" fontFamily="var(--font-mono)">
                        PK: {table.primaryKey}
                      </text>
                      <text x="16" y="68" fill="var(--faint)" fontSize="8.5">
                        {table.columns
                          .slice(0, 3)
                          .map((c: any) => c.name)
                          .join(" | ")}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="erd-modal-detail-column">
            {activeSchema ? (
              <div className="erd-detail-sidebar">
                <div className="erd-detail-header">
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: getAccentColor(activeSchema.domain),
                      letterSpacing: "0.06em",
                    }}
                  >
                    {activeSchema.domain} Table
                  </span>
                  <h3 style={{ margin: "4px 0" }}>{activeSchema.name}</h3>
                  <p className="erd-detail-desc" style={{ margin: 0 }}>
                    {activeSchema.description}
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "6px",
                    }}
                  >
                    Columns Schema
                  </h4>
                  <table className="erd-column-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSchema.columns.map((col: any) => {
                        const isPk = activeSchema.primaryKey === col.name;
                        const isFk = col.name.endsWith("_id") && !isPk;
                        return (
                          <tr key={col.name}>
                            <td>
                              <span className={`column-name ${isPk ? "pk-col" : isFk ? "fk-col" : ""}`}>
                                {isPk && "🔑 "}
                                {isFk && "🔗 "}
                                {col.name}
                              </span>
                            </td>
                            <td>
                              <span className="column-type">{col.type}</span>
                            </td>
                            <td>
                              <span className="column-note" title={col.note}>
                                {col.note}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {activeSchema.relationships.length > 0 && (
                  <div style={{ marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <h4
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        marginBottom: "8px",
                      }}
                    >
                      Defined Key Relationships
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {activeSchema.relationships.map((rel: string) => (
                        <div
                          key={rel}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Zap size={11} style={{ color: "var(--cyan)" }} />
                          <span>
                            Matches <code>{rel.split(".")[1]}</code> in <strong>{rel.split(".")[0]}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="erd-sidebar-empty"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--muted)",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <Database size={24} style={{ opacity: 0.3, marginBottom: "8px" }} />
                <p style={{ fontSize: "13px", margin: 0 }}>
                  Click or hover over any table node in the diagram to inspect its column types, primary/foreign keys,
                  and join expressions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
