"use client";

import { motion } from "framer-motion";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-foreground/70 uppercase bg-secondary/30 border-b border-card-border">
            <tr>
              {columns.map((col, index) => (
                <th key={col.accessorKey} className="px-6 py-4 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-foreground/50">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  key={rowIndex}
                  className="border-b border-card-border/50 hover:bg-secondary/20 transition-colors last:border-0"
                >
                  {columns.map((col) => (
                    <td key={col.accessorKey} className="px-6 py-4">
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
