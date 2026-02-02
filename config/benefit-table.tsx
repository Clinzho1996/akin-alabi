"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	RowSelectionState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import Modal from "@/components/Modal";
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
import { IconPlus } from "@tabler/icons-react";
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

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onRefresh?: () => void;
	onPaginationChange?: (pageIndex: number, pageSize: number) => void;
	totalItems?: number;
	currentPage?: number;
	totalPages?: number;
	pageSize?: number;
	hasNextPage?: boolean;
	hasPrevPage?: boolean;
}

interface CreateBenefitData {
	name: string;
	type: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function BenefitDataTable<TData, TValue>({
	columns,
	data,
	onRefresh,
	onPaginationChange,
	totalItems = 0,
	currentPage = 0,
	totalPages = 0,
	pageSize = 10,
	hasNextPage = false,
	hasPrevPage = false,
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
	const [isModalOpen, setModalOpen] = useState(false);
	const [tableData, setTableData] = useState<TData[]>(data);
	const [isLoading, setIsLoading] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	// Benefit form state
	const [benefitForm, setBenefitForm] = useState<CreateBenefitData>({
		name: "",
		type: "material",
	});

	// Sync `tableData` with `data` prop
	useEffect(() => {
		setTableData(data);
	}, [data]);

	const openModal = () => {
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		// Reset form when modal closes
		setBenefitForm({
			name: "",
			type: "material",
		});
	};

	const handleAddBenefit = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				return;
			}

			// Validate required fields
			if (!benefitForm.name || !benefitForm.type) {
				toast.error("Please fill in all required fields.");
				return;
			}

			const response = await axios.post(
				`${BASE_URL}/benefit`,
				{
					name: benefitForm.name,
					type: benefitForm.type,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			if (response.data.status === "success") {
				toast.success("Benefit created successfully!");
				closeModal();

				// Call the onRefresh prop to trigger refresh in parent component
				if (onRefresh) {
					onRefresh();
				}
			}
		} catch (error) {
			console.error("Error creating benefit:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to create benefit. Please try again.",
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Function to filter data based on date range
	const filterDataByDateRange = () => {
		if (!dateRange?.from || !dateRange?.to) {
			setTableData(data); // Reset to all data
			return;
		}

		const filteredData = data.filter((benefit: any) => {
			const dateCreated = new Date(benefit.created_at);
			return dateCreated >= dateRange.from! && dateCreated <= dateRange.to!;
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

	const handlePageChange = (pageIndex: number) => {
		console.log("Table page change to:", pageIndex);
		if (onPaginationChange) {
			onPaginationChange(pageIndex, pageSize);
		}
	};

	// Handle page size change
	const handlePageSizeChange = (newPageSize: number) => {
		console.log("Page size change to:", newPageSize);
		if (onPaginationChange) {
			onPaginationChange(0, newPageSize); // Go to first page when changing page size
		}
	};

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
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

	// Calculate if next/previous buttons should be enabled using API's next_page_url and prev_page_url
	const canPreviousPage = hasPrevPage;
	const canNextPage = hasNextPage;

	return (
		<div className="rounded-lg border-[1px] py-0">
			{isModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={closeModal}
					title="Create New Benefit">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out form modal-small w-[500px]">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col sm:flex-row gap-2 w-full bg-white shadow-lg p-3 rounded-lg">
								<div className="w-full">
									<p className="text-xs text-primary-6">Benefit Name *</p>
									<Input
										type="text"
										placeholder="Enter Benefit Name"
										className="focus:border-none mt-2"
										value={benefitForm.name}
										onChange={(e) =>
											setBenefitForm({ ...benefitForm, name: e.target.value })
										}
									/>
								</div>

								<div className="w-full">
									<p className="text-xs text-primary-6 mt-2">Benefit Type *</p>
									<Select
										value={benefitForm.type}
										onValueChange={(value) =>
											setBenefitForm({ ...benefitForm, type: value })
										}>
										<SelectTrigger className="w-full option select">
											<SelectValue placeholder="Select benefit type" />
										</SelectTrigger>
										<SelectContent className="bg-white z-10 select text-gray-300">
											<SelectItem value="monetary">Monetary</SelectItem>
											<SelectItem value="material">Material</SelectItem>
											<SelectItem value="service">Service</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeModal}>
								Cancel
							</Button>
							<Button
								className="bg-secondary-1 text-white font-inter text-xs"
								onClick={handleAddBenefit}
								disabled={isLoading}>
								{isLoading ? "Creating Benefit..." : "Create Benefit"}
							</Button>
						</div>
					</div>
				</Modal>
			)}
			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full rounded-lg">
				<div className="flex flex-row justify-start bg-white items-center rounded-lg mx-auto special-btn-farmer pr-2">
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
				<div className="p-3 flex flex-row justify-start items-center gap-3 w-full ">
					<Input
						placeholder="Search Benefit..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="focus:border-none bg-[#F9FAFB]"
					/>
					<div className="w-[250px]">
						<DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
					</div>
					<Button
						className="bg-secondary-1 border-[1px] border-[#173C3D] text-white font-inter cborder"
						onClick={openModal}>
						<IconPlus /> New Benefit
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
							disabled={!hasPrevPage}>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={!hasPrevPage}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={!hasNextPage}>
							<span className="sr-only">Go to next page</span>
							<ChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => handlePageChange(totalPages - 1)}
							disabled={!hasNextPage}>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
