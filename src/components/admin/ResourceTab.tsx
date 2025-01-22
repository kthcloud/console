import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Typography,
  Modal,
  Button,
  TablePagination,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ConfirmButton from "../ConfirmButton";
import SearchBar from "./SearchBar";
import { Category, QueryModifier } from "./searchTypes";
import { CustomTheme } from "../../theme/types";

interface ResourceTabProps<T> {
  resourceName: String;
  data: T[] | undefined;
  filteredData: T[] | undefined;
  filter: string | undefined;
  setFilter: Dispatch<SetStateAction<string | undefined>>;
  columns?: {
    id: keyof T | "*";
    label: string;
    renderFunc?: (value: any) => ReactNode;
    or?: string;
  }[];
  actions?: {
    label: string;
    onClick: (obj: T) => void;
    withConfirm?: boolean;
  }[];
  OnClickModal?: React.ComponentType<{ data: T }>;
  category?: Category;
  setCategory?: Dispatch<SetStateAction<Category | undefined>>;
  queryModifier?: QueryModifier[Category];
  setQueryModifier?: Dispatch<SetStateAction<QueryModifier[Category]>>;
}

const ResourceTab = <T extends { id: string | number }>({
  resourceName,
  data,
  filteredData,
  filter,
  setFilter,
  columns,
  actions,
  OnClickModal,
  category,
  setCategory,
  queryModifier,
  setQueryModifier,
}: ResourceTabProps<T>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const loading = !data;
  const resolvedColumns =
    columns && columns.length > 0
      ? columns
      : data && data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            id: key as keyof T,
            label: key.toString(),
            renderFunc: undefined,
            or: undefined,
          }))
        : [];
  const resolvedActions =
    columns && columns.length > 0
      ? [
          {
            label: t("details"),
            onClick: (value: T) => setSelectedItem(value),
          },
          ...(actions || []),
        ]
      : actions;
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentData = filter ? filteredData : data;
  const paginatedData = currentData?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // annoying TS compile issue for some reason
  const modalBoxStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    height: "80vh",
    backgroundColor: `${(theme as CustomTheme).palette.grey[500_32]} !important`,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
    padding: "1em",
    borderRadius: "2em",
    overflow: "auto",
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {resourceName}
      </Typography>
      <SearchBar
        searchText={"Search " + resourceName}
        searchQuery={filter || ""}
        setSearchQuery={setFilter}
        onSearch={() => {}}
        category={category}
        setCategory={setCategory}
        queryModifier={queryModifier}
        setQueryModifier={setQueryModifier}
      />

      {loading ? (
        <SkeletonTable columns={resolvedColumns.length} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {resolvedColumns.map((col) => (
                  <TableCell key={col.id as string}>{col.label}</TableCell>
                ))}
                {resolvedActions && (
                  <TableCell key={"admin-actions"}>
                    {t("admin-actions")}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData?.map((row, index) => (
                <TableRow key={row.id || index}>
                  {resolvedColumns.map((col) => (
                    <TableCell key={col.id as string}>
                      {(() => {
                        if (col.renderFunc) {
                          if (col.id === "*") {
                            return col.renderFunc(row);
                          }
                          return col.renderFunc(
                            typeof col.id === "string"
                              ? getNestedValue(row, col.id)
                              : row[col.id]
                          );
                        }
                        const value = formatCellValue(
                          typeof col.id === "string"
                            ? getNestedValue(row, col.id)
                            : row[col.id]
                        );
                        if (value === "undefined") {
                          return String(col.or);
                        }

                        return value;
                      })()}
                    </TableCell>
                  ))}
                  {resolvedActions && (
                    <TableCell key={"admin-actions"}>
                      {resolvedActions.map((action) =>
                        action.withConfirm ? (
                          <ConfirmButton
                            action={action.label}
                            actionText={action.label}
                            callback={() => {
                              action.onClick(row);
                            }}
                            props={{
                              color: "error",
                            }}
                          />
                        ) : (
                          <Button
                            size="small"
                            onClick={() => action.onClick(row)}
                          >
                            {action.label}
                          </Button>
                        )
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        component="div"
        count={currentData?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton={true}
        showLastButton={true}
        rowsPerPageOptions={[10, 25, 50, 100, -1]}
      />
      {selectedItem && OnClickModal ? (
        <Modal
          open={selectedItem !== undefined}
          onClose={() => {
            setSelectedItem(undefined);
          }}
        >
          <div style={modalBoxStyles}>
            <OnClickModal data={selectedItem} />
          </div>
        </Modal>
      ) : (
        selectedItem && (
          <Modal
            open={selectedItem !== undefined}
            onClose={() => {
              setSelectedItem(undefined);
            }}
          >
            <div style={modalBoxStyles}>
              <Typography variant="h6" gutterBottom>
                Item Details
              </Typography>
              {selectedItem ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(selectedItem).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {key}
                          </TableCell>
                          <TableCell>{formatCellValue(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1">No item selected.</Typography>
              )}
            </div>
          </Modal>
        )
      )}
    </Paper>
  );
};

const SkeletonTable = ({ columns }: { columns: number }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {[...Array(columns)].map((_, index) => (
            <TableCell key={index}>
              <Skeleton />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {[...Array(5)].map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const formatCellValue = (value: unknown): React.ReactNode => {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => (
          <li key={index}>{formatCellValue(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <Table size="small">
        <TableBody>
          {Object.entries(value).map(([key, val]) => (
            <TableRow key={key}>
              <TableCell sx={{ fontWeight: "bold" }}>{key}</TableCell>
              <TableCell>{formatCellValue(val)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  } else if (typeof value === "boolean") {
    return value ? "Yes" : "No"; // Show booleans as Yes/No
  }
  return String(value);
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
};

export default ResourceTab;
