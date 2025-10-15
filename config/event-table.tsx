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
import { IconFileExport } from "@tabler/icons-react";
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
	onRefresh?: () => void; // Add callback prop for refreshing data
}

interface ApiResponse {
	status: boolean;
	message: string;
	data: EndUser[];
	overview: {
		total: number;
		disable: number;
		active: number;
	};
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
	filters: Record<string, any>;
}

interface CreateEventData {
	name: string;
	location: string;
	start_date: string;
	end_date: string;
	start_time: string;
	end_time: string;
	benefit_ids: string[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function EventDataTable<TData, TValue>({
	columns,
	data,
	onRefresh,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [selectedStatus, setSelectedStatus] = useState<string>("View All");
	const [globalFilter, setGlobalFilter] = useState("");
	const [isModalOpen, setModalOpen] = useState(false);
	const [tableData, setTableData] = useState<TData[]>(data);
	const [isLoading, setIsLoading] = useState(false);
	const [stats, setStats] = useState<ApiResponse | null>(null);
	const [availableBenefits, setAvailableBenefits] = useState<any[]>([]);
	const [newBenefit, setNewBenefit] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	// Event form state
	const [eventForm, setEventForm] = useState<CreateEventData>({
		name: "",
		location: "",
		start_date: "",
		end_date: "",
		start_time: "",
		end_time: "",
		benefit_ids: [],
	});

	// Sync `tableData` with `data` prop
	useEffect(() => {
		setTableData(data);
	}, [data]);

	// Fetch available benefits
	const fetchAvailableBenefits = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) return;

			const response = await axios.get(`${BASE_URL}/benefit`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setAvailableBenefits(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching benefits:", error);
		}
	};

	useEffect(() => {
		fetchAvailableBenefits();
	}, []);

	const openModal = () => {
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		// Reset form when modal closes
		setEventForm({
			name: "",
			location: "",
			start_date: "",
			end_date: "",
			start_time: "",
			end_time: "",
			benefit_ids: [],
		});
		setNewBenefit("");
	};

	const handleAddEvent = async () => {
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
			if (
				!eventForm.name ||
				!eventForm.location ||
				!eventForm.start_date ||
				!eventForm.end_date ||
				!eventForm.start_time ||
				!eventForm.end_time
			) {
				toast.error("Please fill in all required fields.");
				return;
			}

			const response = await axios.post(
				`${BASE_URL}/event`,
				{
					name: eventForm.name,
					location: eventForm.location,
					start_date: eventForm.start_date,
					end_date: eventForm.end_date,
					start_time: eventForm.start_time,
					end_time: eventForm.end_time,
					benefit_ids: eventForm.benefit_ids,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success("Event created successfully!");
				closeModal();

				// Call the onRefresh prop to trigger refresh in parent component
				if (onRefresh) {
					onRefresh();
				} else {
					// Fallback: refresh the local table data
					await fetchEvents();
				}
			}
		} catch (error) {
			console.error("Error creating event:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to create event. Please try again."
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const fetchEvents = async (page = 1, limit = 50) => {
		try {
			setIsLoading(true);
			const session = await getSession();

			const accessToken = session?.accessToken;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`${BASE_URL}/event?page=${page}&limit=${limit}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === true) {
				setTableData(response.data.data as unknown as TData[]);

				console.log("Events Data:", response.data.data);
				console.log("Pagination:", response.data.pagination);
			}
		} catch (error) {
			console.error("Error fetching events data:", error);
			toast.error("Failed to fetch events.");
		} finally {
			setIsLoading(false);
		}
	};

	const addBenefit = (benefitId: string) => {
		if (benefitId && !eventForm.benefit_ids.includes(benefitId)) {
			setEventForm({
				...eventForm,
				benefit_ids: [...eventForm.benefit_ids, benefitId],
			});
			setNewBenefit("");
		}
	};

	const removeBenefit = (benefitIdToRemove: string) => {
		setEventForm({
			...eventForm,
			benefit_ids: eventForm.benefit_ids.filter(
				(benefitId) => benefitId !== benefitIdToRemove
			),
		});
	};

	const getBenefitName = (benefitId: string) => {
		const benefit = availableBenefits.find((b) => b.id === benefitId);
		return benefit ? benefit.name : "Unknown Benefit";
	};

	// Function to filter data based on date range
	const filterDataByDateRange = () => {
		if (!dateRange?.from || !dateRange?.to) {
			setTableData(data); // Reset to all data
			return;
		}

		const filteredData = data.filter((event: any) => {
			const eventDate = new Date(event.start_date);
			return eventDate >= dateRange.from! && eventDate <= dateRange.to!;
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
		} else {
			const filteredData = data?.filter(
				(event) =>
					(event as any)?.is_active?.toString().toLowerCase() ===
						status.toLowerCase() ||
					(event as any)?.status?.toLowerCase() === status.toLowerCase()
			);

			setTableData(filteredData as TData[]);
		}
	};

	const handleExport = () => {
		// Convert the table data to a worksheet
		const worksheet = XLSX.utils.json_to_sheet(tableData);

		// Create a new workbook and add the worksheet
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

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
		link.download = "events.xlsx";
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
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	return (
		<div className="rounded-lg border-[1px] py-0">
			{isModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={closeModal}
					title="Create New Event">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out w-[650px] form-big">
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Event Name *</p>
										<Input
											type="text"
											placeholder="Enter Event Name"
											className="focus:border-none"
											value={eventForm.name}
											onChange={(e) =>
												setEventForm({ ...eventForm, name: e.target.value })
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Location *</p>
										<Input
											type="text"
											placeholder="Enter Location"
											className="focus:border-none"
											value={eventForm.location}
											onChange={(e) =>
												setEventForm({ ...eventForm, location: e.target.value })
											}
										/>
									</div>
								</div>
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Start Date *</p>
										<Input
											type="date"
											className="focus:border-none"
											value={eventForm.start_date}
											onChange={(e) =>
												setEventForm({
													...eventForm,
													start_date: e.target.value,
												})
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">End Date *</p>
										<Input
											type="date"
											className="focus:border-none"
											value={eventForm.end_date}
											onChange={(e) =>
												setEventForm({ ...eventForm, end_date: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">Start Time *</p>
										<Input
											type="time"
											className="focus:border-none"
											value={eventForm.start_time}
											onChange={(e) =>
												setEventForm({
													...eventForm,
													start_time: e.target.value,
												})
											}
										/>
									</div>
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">End Time *</p>
										<Input
											type="time"
											className="focus:border-none"
											value={eventForm.end_time}
											onChange={(e) =>
												setEventForm({ ...eventForm, end_time: e.target.value })
											}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="mt-3 pt-2 bg-[#F6F8FA] p-3 border rounded-lg border-[#E2E4E9]">
							<div className="flex flex-col p-3 gap-4 bg-white shadow-lg rounded-lg">
								<div className="flex flex-col sm:flex-row gap-4 w-full">
									<div className="w-full flex flex-col gap-2">
										<p className="text-xs text-primary-6">
											Benefits (optional)
										</p>
										<div className="flex gap-2">
											<select
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												value={newBenefit}
												onChange={(e) => {
													if (e.target.value) {
														addBenefit(e.target.value);
													}
												}}>
												<option value="">Select a benefit</option>
												{availableBenefits.map((benefit) => (
													<option key={benefit.id} value={benefit.id}>
														{benefit.name} ({benefit.type})
													</option>
												))}
											</select>
										</div>
										<div className="flex flex-wrap gap-2 mt-2">
											{eventForm.benefit_ids.map((benefitId, index) => (
												<div
													key={index}
													className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
													<span className="text-xs">
														{getBenefitName(benefitId)}
													</span>
													<button
														type="button"
														onClick={() => removeBenefit(benefitId)}
														className="text-red-500 hover:text-red-700">
														×
													</button>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs px-4 py-2"
								onClick={closeModal}>
								Cancel
							</Button>
							<Button
								className="bg-secondary-1 text-white font-inter text-xs px-4 py-2"
								onClick={handleAddEvent}
								disabled={isLoading}>
								{isLoading ? "Creating Event..." : "Create Event"}
							</Button>
						</div>
					</div>
				</Modal>
			)}
			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full rounded-lg">
				<div className="flex flex-row justify-start bg-white items-center rounded-lg mx-auto special-btn-farmer pr-2">
					{["View All", "Active", "Closed"].map((status, index, arr) => (
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
						placeholder="Search Events..."
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
						<IconFileExport /> Add New Event
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
													header.getContext()
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
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}>
							<SelectTrigger className="h-8 w-[70px] bg-white z-10">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top" className="bg-white">
								{[5, 10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-[100px] items-center justify-center font-medium text-xs text-primary-6">
						{table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()} pages
					</div>
					<div className="flex items-center space-x-5 gap-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}>
							<span className="sr-only">Go to next page</span>
							<ChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
