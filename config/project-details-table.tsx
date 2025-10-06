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
import axios from "axios";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Farmer } from "./project-details-columns";
interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

type ProjectDetails = {
	id: string;
	name: string;
	user_id: string;
	start_date: string;
	end_date: string;
	status: string;
	groups: string[];
	created_at: string;
	updated_at: string;
	user: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		picture: string | null;
		staff_code: string;
		role: string;
		is_active: boolean;
		last_logged_in: string | null;
		created_at: string;
		updated_at: string;
	};
};

export function ProjectDetailsDataTable<TData, TValue>({
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
	const [tableData, setTableData] = useState<TData[]>(data);
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
		null
	);
	const [farmers, setFarmers] = useState<Farmer[]>([]);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	useEffect(() => {
		setTableData(data); // Sync `tableData` with `data` prop
	}, [data]);

	// Function to filter data based on date range
	const filterDataByDateRange = () => {
		if (!dateRange?.from || !dateRange?.to) {
			setTableData(data);
			return;
		}

		const filteredData = data.filter((farmer: any) => {
			const dateJoined = new Date(farmer.created_at);
			return dateJoined >= dateRange.from! && dateJoined <= dateRange.to!;
		});

		setTableData(filteredData);
	};

	React.useEffect(() => {
		filterDataByDateRange();
	}, [dateRange]);

	const fetchProjectDetails = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			// Fetch project details
			const projectResponse = await axios.get<{
				status: string;
				message: string;
				data: ProjectDetails;
			}>(`https://api.wowdev.com.ng/api/v1/project/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			setProjectDetails(projectResponse.data.data);
		} catch (error) {
			console.error("Error fetching project data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchProjectDetails();
		}
	}, [id]);

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
			<div
				className="bg-white flex flex-row border-b-[1px] border-[#E2E4E9] justify-between items-center p-3"
				style={{
					borderTopLeftRadius: "0.5rem",
					borderTopRightRadius: "0.5rem",
				}}>
				<div className="flex flex-col sm:flex-row justify-between items-center w-full">
					<div className="flex flex-row justify-start items-center gap-2">
						<Image
							src="/images/proj2.png"
							alt="staff management"
							height={50}
							width={50}
						/>
						<div className="flex flex-col gap-0">
							<p className="text-sm text-dark-1 font-medium font-inter">
								{projectDetails?.name}
							</p>
							<p className="text-xs text-primary-6 capitalize">
								Created by: {projectDetails?.user?.first_name}{" "}
								{projectDetails?.user?.last_name}
							</p>
						</div>
					</div>
					<div className="flex flex-row justify-end items-center">
						<p>Status: </p>
						<Image
							src="/images/thick.png"
							alt="staff management"
							height={20}
							width={250}
						/>
						{projectDetails?.status === "open" && (
							<span className="capitalize status-inner green">
								{projectDetails?.status}
							</span>
						)}

						{projectDetails?.status === "closed" && (
							<span className="capitalize status-inner red">
								{projectDetails?.status}
							</span>
						)}

						{projectDetails?.status === "yet_to_open" && (
							<span className="capitalize status-inner yellow">
								{projectDetails?.status}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full">
				<div className="p-3 flex flex-row justify-between items-center gap-3 w-full ">
					<Input
						placeholder="Search Farmer ..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="focus:border-none bg-[#F9FAFB] w-[50%]"
					/>
					<div className="w-[250px]">
						<DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
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
