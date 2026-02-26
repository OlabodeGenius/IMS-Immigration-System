import { useState, useMemo, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    TablePagination,
    Box,
    InputAdornment,
    IconButton,
    Typography,
    Checkbox,
    Skeleton,
    Fade,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

interface Column<T> {
    id: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    width?: string | number;
    align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (row: T) => void;
    searchable?: boolean;
    filterContent?: React.ReactNode;
    initialSearch?: string;
    selectable?: boolean;
    onSelectionChange?: (selectedIds: string[]) => void;
    selectedIds?: string[];
}

const EMPTY_ARRAY: string[] = [];

export function DataTable<T extends { id: string }>({
    columns,
    data,
    isLoading = false,
    searchPlaceholder = "Search...",
    onRowClick,
    searchable = true,
    filterContent,
    initialSearch = "",
    selectable = false,
    onSelectionChange,
    selectedIds = EMPTY_ARRAY,
}: DataTableProps<T>) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [internalSelected, setInternalSelected] = useState<string[]>(selectedIds);

    // Sync internal selection with external prop if provided
    useEffect(() => {
        setInternalSelected(selectedIds);
    }, [selectedIds]);

    const filteredData = useMemo(() => {
        const validData = Array.isArray(data) ? data : [];
        if (!searchQuery) return validData;
        const lowerQuery = searchQuery.toLowerCase();
        return validData.filter((row) =>
            Object.values(row).some((val) =>
                String(val).toLowerCase().includes(lowerQuery)
            )
        );
    }, [data, searchQuery]);

    const paginatedData = useMemo(() => {
        const safeData = Array.isArray(filteredData) ? filteredData : [];
        return safeData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredData, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredData.map((n) => n.id);
            setInternalSelected(newSelected);
            onSelectionChange?.(newSelected);
            return;
        }
        setInternalSelected([]);
        onSelectionChange?.([]);
    };

    const handleSelectOne = (id: string) => {
        const selectedIndex = internalSelected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(internalSelected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(internalSelected.slice(1));
        } else if (selectedIndex === internalSelected.length - 1) {
            newSelected = newSelected.concat(internalSelected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                internalSelected.slice(0, selectedIndex),
                internalSelected.slice(selectedIndex + 1)
            );
        }

        setInternalSelected(newSelected);
        onSelectionChange?.(newSelected);
    };

    const isSelected = (id: string) => internalSelected.indexOf(id) !== -1;

    return (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2, boxShadow: 1 }}>
            {(searchable || filterContent) && (
                <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
                    {searchable && (
                        <TextField
                            size="small"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ maxWidth: 300 }}
                        />
                    )}
                    {filterContent && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <IconButton size="small" sx={{ mr: 1 }}><FilterListIcon /></IconButton>
                            {filterContent}
                        </Box>
                    )}
                </Box>
            )}

            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox" sx={{ bgcolor: 'white' }}>
                                    <Checkbox
                                        indeterminate={internalSelected.length > 0 && internalSelected.length < filteredData.length}
                                        checked={filteredData.length > 0 && internalSelected.length === filteredData.length}
                                        onChange={handleSelectAll}
                                        size="small"
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell
                                    key={String(column.id)}
                                    align={column.align || "left"}
                                    style={{ width: column.width, fontWeight: "bold" }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            Array.from(new Array(5)).map((_, index) => (
                                <TableRow key={index}>
                                    {selectable && <TableCell padding="checkbox"><Skeleton variant="rectangular" width={20} height={20} /></TableCell>}
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton variant="text" width="80%" height={24} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No records found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                                <Fade in={true} key={row.id} timeout={400}>
                                    <TableRow
                                        hover
                                        onClick={() => onRowClick && onRowClick(row)}
                                        sx={{ cursor: onRowClick ? "pointer" : "default" }}
                                        selected={isSelected(row.id)}
                                    >
                                        {selectable && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected(row.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectOne(row.id);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    size="small"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column) => (
                                            <TableCell key={String(column.id)} align={column.align || "left"}>
                                                {column.render
                                                    ? column.render(row)
                                                    : (row[column.id as keyof T] as React.ReactNode)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </Fade>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
