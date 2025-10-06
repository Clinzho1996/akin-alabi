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
import { IconPlus, IconTrash } from "@tabler/icons-react";
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
import { Device } from "./device-columns";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DeviceDataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [isModalOpen, setModalOpen] = useState(false);
	const [tableData, setTableData] = useState<TData[]>(data);
	const [isLoading, setIsLoading] = useState(false);
	const [alias, setAlias] = useState("");
	const [serial, setSerial] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	const openModal = () => setModalOpen(true);
	const closeModal = () => setModalOpen(false);

	// Function to filter data based on date range
	const filterDataByDateRange = () => {
		if (!dateRange?.from || !dateRange?.to) {
			setTableData(data); // Reset to all data if no date range is selected
			return;
		}

		const filteredData = data.filter((farmer: any) => {
			const dateJoined = new Date(farmer.dateJoined);
			return dateJoined >= dateRange.from! && dateJoined <= dateRange.to!;
		});

		setTableData(filteredData);
	};

	// Update the table data whenever the date range changes
	React.useEffect(() => {
		filterDataByDateRange();
	}, [dateRange]);

	useEffect(() => {
		setTableData(data);
	}, [data]);

	const fetchDevices = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			console.log("session", session);

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<{
				status: string;
				message: string;
				data: Device[];
			}>("https://api.wowdev.com.ng/api/v1/device", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const fetchedData = response.data.data;

			console.log("Device Data:", fetchedData);

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				serialNumber: item.serial_number || "N/A",
				dateJoined: item.created_at,
				deviceAlias: item.alias,
				alias: item.alias,
				created_at: item.created_at,
				state: item.state,
				serial_number: item.serial_number,
				status: item.status || "not posted",
			}));

			console.log("Mapped Data:", mappedData);
			setTableData(mappedData as TData[]);
		} catch (error) {
			console.error("Error fetching device data:", error);
			toast.error("Failed to fetch devices. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};
	const handleAddDevice = async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const payload = {
				serial_number: serial,
				alias: alias,
			};

			const response = await axios.post(
				"https://api.wowdev.com.ng/api/v1/device",
				payload,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200 || response.status === 201) {
				await fetchDevices();
				toast.success("Device added successfully!");

				// Close the modal and reset form fields
				closeModal();
				setAlias("");
				setSerial("");
			}
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.log(
					"Error Adding Staff:",
					error.response?.data || error.message
				);
				toast.error(
					error.response?.data?.message ||
						"An error occurred. Please try again."
				);
			} else {
				console.log("Unexpected error:", error);
				toast.error("Unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};
	const bulkDeleteDevice = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				return;
			}

			const selectedIds = Object.keys(rowSelection).map(
				(index) => (tableData[parseInt(index)] as any)?.id
			);

			if (selectedIds.length === 0) {
				toast.warn("No device selected for deletion.");
				return;
			}

			console.log("Selected IDs for deletion:", selectedIds);

			const response = await axios.delete(
				"https://api.wowdev.com.ng/api/v1/device/bulk/delete",
				{
					data: { user_ids: selectedIds }, // Ensure this matches the API's expected payload
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				toast.success("Selected staff deleted successfully!");

				// Update the table data by filtering out the deleted staff
				setTableData((prevData) =>
					prevData.filter((staff) => !selectedIds.includes((staff as any).id))
				);

				// Clear the selection
				setRowSelection({});
			}
		} catch (error) {
			console.error("Error bulk deleting staff:", error);
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Failed to delete staff. Please try again."
				);
			} else {
				toast.error("An unexpected error occurred. Please try again.");
			}
		}
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
		<div className="rounded-lg border-[1px] py-0 border-[#E2E4E9] mt-4">
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title="Add Device"
				className="w-[500px]">
				<div className="bg-white py-5 rounded-lg transition-transform ease-in-out ">
					<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
						<p className="text-sm text-dark-1 font-inter">Basic Information</p>
						<div className="flex flex-col gap-2 mt-4">
							<p className="text-xs text-primary-6 font-inter">Serial Number</p>
							<Input
								type="text"
								className="focus:border-none mt-2 h-5"
								value={serial}
								onChange={(e) => setSerial(e.target.value)}
							/>
							<p className="text-xs text-primary-6 mt-2 font-inter">
								Alias / Device Name
							</p>
							<Input
								type="text"
								className="focus:border-none mt-2 h-5"
								value={alias}
								onChange={(e) => setAlias(e.target.value)}
							/>
						</div>
						<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />
						<div className="flex flex-row justify-end items-center gap-3 font-inter">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeModal}>
								Cancel
							</Button>
							<Button
								className="bg-primary-1 text-white font-inter text-xs"
								onClick={handleAddDevice}
								disabled={isLoading}>
								{isLoading ? "Adding Device..." : "Add Device"}
							</Button>
						</div>
					</div>
				</div>
			</Modal>

			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full mt-2">
				<div className="p-3 flex flex-row justify-start items-center gap-3 w-full ">
					<Input
						placeholder="Search Device..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="focus:border-none bg-[#F9FAFB]"
					/>
					<Button
						className="border-[#E8E8E8] border-[1px] bg-white"
						onClick={bulkDeleteDevice}>
						<IconTrash /> Delete
					</Button>

					{/* filter by type */}
					<div className="w-[250px]">
						<DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
					</div>
					<div className="flex flex-row justify-start items-center gap-3 font-inter">
						<Button
							className="bg-primary-1 text-white font-inter"
							onClick={openModal}>
							<IconPlus /> Add Device
						</Button>
					</div>
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
