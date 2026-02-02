"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	RowSelectionState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { IconFileExport, IconPrinter } from "@tabler/icons-react";
import axios from "axios";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { EndUser } from "./end-user-columns";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onPaginationChange?: (pageIndex: number, pageSize: number) => void;
	totalItems?: number;
	currentPage?: number;
	totalPages?: number;
	pageSize?: number;
}

export function EndUserDataTable<TData, TValue>({
	columns,
	data,
	onPaginationChange,
	totalItems = 0,
	currentPage = 0,
	totalPages = 0,
	pageSize = 10,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [selectedStatus, setSelectedStatus] = useState<string>("View All");
	const [globalFilter, setGlobalFilter] = useState("");
	const [tableData, setTableData] = useState<TData[]>(data);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	// Track pagination state
	const [pagination, setPagination] = useState({
		pageIndex: currentPage,
		pageSize: pageSize,
	});

	// Update table data when prop changes
	useEffect(() => {
		setTableData(data);
	}, [data]);

	// Update pagination when props change
	useEffect(() => {
		setPagination({
			pageIndex: currentPage,
			pageSize: pageSize,
		});
	}, [currentPage, pageSize]);

	const handlePageChange = (pageIndex: number) => {
		console.log("Table page change to:", pageIndex);
		if (onPaginationChange) {
			onPaginationChange(pageIndex, pagination.pageSize);
		}
	};

	// Handle page size change
	const handlePageSizeChange = (newPageSize: number) => {
		console.log("Page size change to:", newPageSize);
		if (onPaginationChange) {
			onPaginationChange(0, newPageSize); // Go to first page when changing page size
		}
	};

	const filterDataByDateRange = () => {
		if (!dateRange?.from || !dateRange?.to) {
			setTableData(data); // Reset to all data
			return;
		}

		const filteredData = data.filter((farmer: any) => {
			const dateJoined = new Date(farmer.date);
			return dateJoined >= dateRange.from! && dateJoined <= dateRange.to!;
		});

		setTableData(filteredData);
	};

	useEffect(() => {
		filterDataByDateRange();
	}, [dateRange]);

	const handleStatusFilter = (status: string) => {
		setSelectedStatus(status);

		if (status === "View All") {
			setTableData(data); // Reset to all data
		} else if (status === "Active") {
			const filteredData = data?.filter(
				(user) => (user as any)?.is_active === true,
			);
			setTableData(filteredData as TData[]);
		} else if (status === "Inactive") {
			const filteredData = data?.filter(
				(user) => (user as any)?.is_active === false,
			);
			setTableData(filteredData as TData[]);
		}
	};

	const handleExport = () => {
		// Convert the table data to a worksheet
		const worksheet = XLSX.utils.json_to_sheet(tableData);

		// Create a new workbook and add the worksheet
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Farmers");

		// Generate a binary string from the workbook
		const binaryString = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "binary",
		});

		// Convert the binary string to a Blob
		const blob = new Blob([s2ab(binaryString)], {
			type: "application/octet-stream",
		});

		// Create a link element and trigger the download
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "staffs.xlsx";
		link.click();

		// Clean up
		URL.revokeObjectURL(url);
	};

	// Utility function to convert string to ArrayBuffer
	const s2ab = (s: string) => {
		const buf = new ArrayBuffer(s.length);
		const view = new Uint8Array(buf);
		for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
		return buf;
	};

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		// Use manual pagination state
		manualPagination: !!onPaginationChange,
		// Pass the pagination state
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			pagination: {
				pageIndex: currentPage,
				pageSize: pageSize,
			},
		},
		// Row count for manual pagination
		rowCount: totalItems,
		// When using manual pagination, don't use the built-in pagination handlers
		...(onPaginationChange
			? {
					getPaginationRowModel: undefined,
					onPaginationChange: undefined,
				}
			: {}),
	});

	const bulkPrintIDCards = () => {
		const selectedRows = Object.keys(rowSelection).map(
			(index) => tableData[parseInt(index)] as EndUser,
		);

		if (selectedRows.length === 0) {
			toast.warn("Please select users to print ID cards");
			return;
		}

		if (selectedRows.length > 10) {
			toast.warn("Maximum 10 ID cards can be printed at once");
			return;
		}

		const getFullName = (user: EndUser) => {
			return `${user.first_name} ${
				user.middle_name ? user.middle_name + " " : ""
			}${user.last_name}`.trim();
		};

		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		// Generate HTML for A4 page with 10 ID cards (2 columns × 5 rows)
		let cardsHTML = "";
		selectedRows.forEach((user, index) => {
			const userFullName = getFullName(user);
			const userDOB = user.dob
				? new Date(user.dob).toLocaleDateString()
				: "N/A";

			cardsHTML += `
        <div class="id-card" style="page-break-inside: avoid;">
          <div class="id-card-header">
            <div style="font-weight: bold; font-size: 10px; color: #1e40af;">ID CARD</div>
            <div style="text-align: center; flex: 2;">
              <h3 style="margin: 0; font-size: 11px; font-weight: bold; color: #1e40af;">MEMBERSHIP CARD</h3>
              <p style="margin: 0; font-size: 8px; color: #666;">Valid Until: ${
								new Date().getFullYear() + 1
							}/12/31</p>
            </div>
          </div>
          
          <div class="id-card-content">
            <div class="photo-section">
              ${
								user.pic
									? `<img src="${user.pic}" alt="${userFullName}" style="width: 25mm; height: 25mm; border: 1px solid #ccc; border-radius: 2mm; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width: 25mm; height: 25mm; border: 1px solid #ccc; border-radius: 2mm; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #666;\\'>No Photo</div>';">`
									: '<div style="width: 25mm; height: 25mm; border: 1px solid #ccc; border-radius: 2mm; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #666;">No Photo</div>'
							}
            </div>
            
            <div class="details-section">
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${userFullName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">ID No:</span>
                <span class="detail-value id-number">${user.membership_code}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Gender:</span>
                <span class="detail-value">${user.gender}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">DOB:</span>
                <span class="detail-value">${userDOB}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span style="color: ${
										user.is_active ? "#fff" : "#fff"
									}; font-weight: bold; background: ${
										user.is_active ? "#10b981" : "#ef4444"
									}; padding: 2px 5px; border-radius: 3px; font-size: 8px;">
                    ${user.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          <div class="id-card-footer">
            <div class="barcode" style="font-family: \'Courier New\', monospace; font-size: 12px; text-align: center; background: #f5f5f5; padding: 2px 5px; border-radius: 3px;">
              ${user.membership_code}
            </div>
            
          </div>
        </div>
      `;
		});

		const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print ID Cards</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            
            .a4-page {
              width: 210mm;
              height: 297mm;
              display: grid;
              grid-template-columns: repeat(2, 85mm);
              grid-template-rows: repeat(5, 50mm);
              gap: 5mm;
              justify-content: center;
              align-content: center;
              page-break-after: always;
            }
            
            .id-card {
              width: 85mm;
              height: 50mm;
              border: 2px solid #000;
              border-radius: 5px;
              padding: 2mm;
              box-sizing: border-box;
              background: white;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .id-card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #ccc;
              padding-bottom: 1mm;
              margin-bottom: 2mm;
            }
            
            .id-card-content {
              display: flex;
              gap: 3mm;
              margin: 1mm 0;
            }
            
            .photo-section {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .details-section {
              flex: 2;
            }
            
            .detail-row {
              display: flex;
              margin-bottom: 1mm;
              font-size: 8px;
            }
            
            .detail-label {
              font-weight: bold;
              width: 15mm;
              color: #333;
            }
            
            .detail-value {
              flex: 1;
              color: #555;
              text-transform: capitalize;
            }
            
            .id-number {
              font-family: 'Courier New', monospace;
              font-weight: bold;
              font-size: 9px;
              color: #1e40af;
            }
            
            .id-card-footer {
              border-top: 1px solid #ccc;
              margin-top: 1mm;
              padding-top: 1mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              text-align: center;
              background: #f5f5f5;
              padding: 1px 3px;
              border-radius: 2px;
              flex: 1;
            }
          }
        </style>
      </head>
      <body>
        <div class="a4-page">
          ${cardsHTML}
        </div>
        <div style="text-align: center; font-size: 10px; margin-top: 10mm; color: #666;">
          Printed on: ${new Date().toLocaleString()} | Total Cards: ${selectedRows.length}
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 100);
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

		printWindow.document.write(content);
		printWindow.document.close();
	};

	const bulkDeleteStaff = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				return;
			}

			const selectedIds = Object.keys(rowSelection).map(
				(index) => (tableData[parseInt(index)] as any)?.id,
			);

			if (selectedIds.length === 0) {
				toast.warn("No staff selected for deletion.");
				return;
			}

			console.log("Selected IDs for deletion:", selectedIds);

			const response = await axios.delete(
				"https://api.medbankr.ai/api/v1/administrator/user",
				{
					data: { ids: selectedIds }, // Ensure this matches the API's expected payload
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			if (response.status === 200) {
				toast.success("Selected staff deleted successfully!");

				// Update the table data by filtering out the deleted staff
				setTableData((prevData) =>
					prevData.filter((staff) => !selectedIds.includes((staff as any).id)),
				);

				// Clear the selection
				setRowSelection({});
			}
		} catch (error) {
			console.error("Error bulk deleting staff:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to delete staff. Please try again.",
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		}
	};

	// Calculate if next/previous buttons should be enabled
	const canPreviousPage = currentPage > 0;
	const canNextPage = currentPage < totalPages - 1;

	return (
		<div className="rounded-lg border-[1px] py-0">
			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full rounded-lg">
				<div className="flex flex-row justify-start bg-white items-center rounded-lg mx-auto special-btn-farmer pr-2 w-full ">
					{["View All", "Active", "Inactive"].map((status, index, arr) => (
						<p
							key={status}
							className={`px-4 py-2 text-center text-sm cursor-pointer border border-[#E2E4E9] overflow-hidden ${
								selectedStatus === status
									? "bg-primary-5 text-dark-1"
									: "text-dark-1"
							} 
            ${index === 0 ? "rounded-l-lg firstRound" : ""} 
            ${index === arr.length - 1 ? "rounded-r-lg lastRound" : ""}`}
							onClick={() => handleStatusFilter(status)}>
							{status}
						</p>
					))}
				</div>
				<div className="p-3 flex flex-row justify-start items-center gap-3 w-full sm:w-[70%] ">
					<Input
						placeholder="Search User..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="focus:border-none bg-[#F9FAFB] w-full"
					/>

					<div className="w-[250px]">
						<DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
					</div>

					{/* Bulk Print Button */}
					<Button
						className="bg-blue-600 hover:bg-blue-700 text-white font-inter"
						onClick={bulkPrintIDCards}
						disabled={
							Object.keys(rowSelection).length === 0 ||
							Object.keys(rowSelection).length > 10
						}>
						<IconPrinter className="mr-2 h-4 w-4" />
						Print IDs ({Object.keys(rowSelection).length})
					</Button>

					<Button
						className="bg-secondary-1 border-[1px] border-[#173C3D] text-white font-inter cborder"
						onClick={handleExport}>
						<IconFileExport /> Export Data
					</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="bg-primary-3">
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id} className="bg-primary-3 text-xs">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody className="bg-white">
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-left text-xs text-primary-6">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex items-center justify-between bg-white rounded-lg py-3 px-2 border-t-[1px] border-gray-300 mt-2">
				<div className="flex-1 text-xs text-primary-6 text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex items-center space-x-10 lg:space-x-10 gap-3">
					<div className="flex items-center space-x-4 gap-2">
						<p className="text-xs text-primary-6 font-medium">Rows per page</p>
						<Select
							value={`${pageSize}`}
							onValueChange={(value) => {
								handlePageSizeChange(Number(value));
							}}>
							<SelectTrigger className="h-8 w-[70px] bg-white z-10">
								<SelectValue placeholder={pageSize} />
							</SelectTrigger>
							<SelectContent side="top" className="bg-white">
								{[5, 10, 20, 30, 40, 50].map((pageSizeOption) => (
									<SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
										{pageSizeOption}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-[100px] items-center justify-center font-medium text-xs text-primary-6">
						{currentPage + 1} of {Math.max(totalPages, 1)} pages
					</div>
					<div className="flex items-center space-x-5 gap-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => handlePageChange(0)}
							disabled={!canPreviousPage}>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={!canPreviousPage}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={!canNextPage}>
							<span className="sr-only">Go to next page</span>
							<ChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => handlePageChange(totalPages - 1)}
							disabled={!canNextPage}>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
