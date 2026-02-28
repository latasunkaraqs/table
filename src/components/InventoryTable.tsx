"use client";
import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  BuildCircleOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { z } from "zod";

import { inventoryData } from "@/data";
import {
  RowNode,
  isGroup,
  isProduct,
  isService,
  Product,
  StatusGroup,
  ProductSchema,
  ServiceLineSchema,
} from "@/types";

// Editable cell component props
interface EditableCellProps {
  value: any;
  onChange: (value: any) => void;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  error?: string;
}

// Editable cell component
const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  type,
  options,
  error,
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  if (type === "select" && options) {
    return (
      <FormControl
        size="small"
        fullWidth
        error={!!error}
        sx={{ minWidth: 100 }}
      >
        <Select
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={handleBlur}
          onFocus={handleFocus}
          sx={{
            fontSize: "0.875rem",
            "& .MuiSelect-select": { py: 0.5 },
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (type === "number") {
    return (
      <TextField
        type="number"
        value={localValue}
        onChange={(e) =>
          setLocalValue(e.target.value === "" ? 0 : Number(e.target.value))
        }
        onBlur={handleBlur}
        onFocus={handleFocus}
        size="small"
        error={!!error}
        helperText={error}
        inputProps={{
          step: type === "number" && !Number.isInteger(value) ? "0.01" : "1",
          min: 0,
          style: { fontSize: "0.875rem", padding: "4px 8px" },
        }}
        sx={{ width: "100%" }}
      />
    );
  }

  return (
    <TextField
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
      size="small"
      error={!!error}
      helperText={error}
      inputProps={{ style: { fontSize: "0.875rem", padding: "4px 8px" } }}
      sx={{ width: "100%" }}
    />
  );
};

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const groupTotals = (group: StatusGroup) => {
  const products = group.children ?? [];
  const stock = products.reduce((s, p) => s + (p.stock ?? 0), 0);
  const sales = products.reduce((s, p) => s + (p.sales ?? 0), 0);
  const profit = products.reduce(
    (s, p) => s + (p.price - p.cost) * (p.sales ?? 0),
    0,
  );
  return { stock, sales, profit };
};

const StatusChip: React.FC<{ status: Product["status"] }> = ({ status }) => {
  const color =
    status === "In Stock"
      ? "success"
      : status === "Restocking"
        ? "warning"
        : "error";
  return (
    <Chip size="small" label={status} color={color as any} variant="outlined" />
  );
};

const ExpanderButton: React.FC<{ row: Row<RowNode> }> = ({ row }) => {
  if (!row.getCanExpand()) return null;
  return (
    <IconButton
      size="small"
      onClick={row.getToggleExpandedHandler()}
      aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
    >
      {row.getIsExpanded() ? (
        <ExpandMore fontSize="small" />
      ) : (
        <ChevronRight fontSize="small" />
      )}
    </IconButton>
  );
};

export default function InventoryTable() {
  const [data, setData] = React.useState(inventoryData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Function to update data with validation
  const updateData = (rowId: string, field: string, value: any) => {
    setData((prevData) => {
      const newData: StatusGroup[] = [...prevData];
      const updateNode = (nodes: RowNode[]): RowNode[] => {
        return nodes.map((node) => {
          if (node.id === rowId) {
            if (isProduct(node)) {
              const updated = { ...node, [field]: value };
              // Validate
              const result = ProductSchema.safeParse(updated);
              if (!result.success) {
                const error = result.error.issues.find(
                  (issue) => issue.path[0] === field,
                );
                setErrors((prev) => ({
                  ...prev,
                  [`${rowId}-${field}`]: error?.message || "",
                }));
                return node; // Don't update if invalid
              } else {
                setErrors((prev) => ({ ...prev, [`${rowId}-${field}`]: "" }));
                return updated;
              }
            } else if (isService(node)) {
              const updated = { ...node, [field]: value };
              const result = ServiceLineSchema.safeParse(updated);
              if (!result.success) {
                const error = result.error.issues.find(
                  (issue) => issue.path[0] === field,
                );
                setErrors((prev) => ({
                  ...prev,
                  [`${rowId}-${field}`]: error?.message || "",
                }));
                return node;
              } else {
                setErrors((prev) => ({ ...prev, [`${rowId}-${field}`]: "" }));
                return updated;
              }
            }
          }
          if (isGroup(node)) {
            return {
              ...node,
              children: updateNode(node.children) as Product[],
            };
          }
          if (isProduct(node) && node.services) {
            return {
              ...node,
              services: updateNode(node.services) as typeof node.services,
            };
          }
          return node;
        });
      };
      return updateNode(newData) as StatusGroup[];
    });
  };

  // Columns definition with access to updateData and errors
  const columns = React.useMemo<ColumnDef<RowNode>[]>(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => <ExpanderButton row={row} />,
        size: 48,
      },
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => {
          const node = row.original;
          const pad = row.depth * 16;
          if (isGroup(node)) {
            const totals = groupTotals(node);
            return (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ pl: pad }}
              >
                <Typography fontWeight={600}>{node.status}</Typography>
                <Chip size="small" label={`${node.children.length} products`} />
                <Tooltip title="Aggregated metrics (group)">
                  <InfoOutlined fontSize="small" color="disabled" />
                </Tooltip>
                <Box sx={{ ml: 1, color: "text.secondary", fontSize: 12 }}>
                  Stock: {totals.stock} • Sales: {totals.sales} • Profit:{" "}
                  {currency(totals.profit)}
                </Box>
              </Stack>
            );
          }
          if (isProduct(node)) {
            return (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ pl: pad }}
              >
                <EditableCell
                  value={node.product}
                  onChange={(value) => updateData(node.id, "product", value)}
                  type="text"
                  error={errors[`${node.id}-product`]}
                />
                <StatusChip status={node.status} />
              </Stack>
            );
          }
          return (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ pl: pad }}
            >
              <BuildCircleOutlined fontSize="small" color="action" />
              <EditableCell
                value={node.type}
                onChange={(value) => updateData(node.id, "type", value)}
                type="text"
                error={errors[`${node.id}-type`]}
              />
              —{" "}
              <EditableCell
                value={node.date}
                onChange={(value) => updateData(node.id, "date", value)}
                type="date"
                error={errors[`${node.id}-date`]}
              />
            </Stack>
          );
        },
        size: 320,
      },
      {
        id: "sku",
        header: "SKU",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.sku}
              onChange={(value) => updateData(row.original.id, "sku", value)}
              type="text"
              error={errors[`${row.original.id}-sku`]}
            />
          ) : (
            ""
          ),
        size: 120,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.status}
              onChange={(value) => updateData(row.original.id, "status", value)}
              type="select"
              options={["In Stock", "Out of Stock", "Restocking"]}
              error={errors[`${row.original.id}-status`]}
            />
          ) : (
            ""
          ),
        size: 140,
      },
      {
        id: "stock",
        header: "Stock",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.stock}
              onChange={(value) => updateData(row.original.id, "stock", value)}
              type="number"
              error={errors[`${row.original.id}-stock`]}
            />
          ) : isGroup(row.original) ? (
            groupTotals(row.original).stock
          ) : (
            ""
          ),
        size: 90,
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.price}
              onChange={(value) => updateData(row.original.id, "price", value)}
              type="number"
              error={errors[`${row.original.id}-price`]}
            />
          ) : (
            ""
          ),
        size: 110,
      },
      {
        id: "cost",
        header: "Cost",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.cost}
              onChange={(value) => updateData(row.original.id, "cost", value)}
              type="number"
              error={errors[`${row.original.id}-cost`]}
            />
          ) : (
            ""
          ),
        size: 110,
      },
      {
        id: "profit",
        header: "Profit",
        cell: ({ row }) => {
          const node = row.original;
          if (isProduct(node))
            return currency((node.price - node.cost) * node.sales);
          if (isGroup(node)) return currency(groupTotals(node).profit);
          return "";
        },
        size: 130,
      },
      {
        id: "rating",
        header: "Rating",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.rating}
              onChange={(value) => updateData(row.original.id, "rating", value)}
              type="number"
              error={errors[`${row.original.id}-rating`]}
            />
          ) : (
            ""
          ),
        size: 90,
      },
      {
        id: "sales",
        header: "Sales",
        cell: ({ row }) =>
          isProduct(row.original) ? (
            <EditableCell
              value={row.original.sales}
              onChange={(value) => updateData(row.original.id, "sales", value)}
              type="number"
              error={errors[`${row.original.id}-sales`]}
            />
          ) : isGroup(row.original) ? (
            groupTotals(row.original).sales
          ) : (
            ""
          ),
        size: 100,
      },
    ],
    [data, errors, updateData],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row: any) => {
      if (row?.children) return row.children; // groups -> products
      if (row?.services) return row.services; // products -> services
      return undefined; // services -> leaf
    },
    getRowCanExpand: (row) => {
      const n = row.original as RowNode;
      return isGroup(n) || isProduct(n);
    },
  });

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{ fontWeight: 600, bgcolor: "background.default" }}
                  width={header.getSize()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow hover key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} width={cell.column.getSize()}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {!table.getRowModel().rows.length && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box p={2} textAlign="center" color="text.secondary">
                  No data
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
