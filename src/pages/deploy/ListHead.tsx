import {
  Box,
  Checkbox,
  TableRow,
  TableCell,
  TableHead,
  TableSortLabel,
} from "@mui/material";

interface HeadCell {
  id: string;
  alignRight?: boolean;
  label: string;
}

interface ListHeadProps {
  order: "asc" | "desc";
  orderBy: string;
  rowCount: number;
  headLabel: HeadCell[];
  numSelected: number;
  onRequestSort: (property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: "1px",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
};

export default function ListHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}: ListHeadProps) {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={() => onRequestSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="div" sx={{ ...visuallyHidden }}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
