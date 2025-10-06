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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { toast } from "react-toastify";
import { Group } from "./group-columns";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

interface State {
	id: string;
	name: string;
}

interface District {
	id: string;
	name: string;
	stateId: string;
}

interface Pod {
	id: string;
	name: string;
	districtId: string;
}

interface Site {
	id: string;
	name: string;
	podId: string;
}

export function GroupDataTable<TData, TValue>({
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
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<TData[]>(data);
	const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
	const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
		null
	);
	const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
	const [name, setName] = useState<string>("");
	const [states, setStates] = useState<State[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [pods, setPods] = useState<Pod[]>([]);
	const [sites, setSites] = useState<Site[]>([]);

	const fetchStates = async () => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				"https://api.wowdev.com.ng/api/v1/state",
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setStates(response.data.data);

			console.log("States fetched:", response.data);
		} catch (error) {
			console.error("Error fetching states:", error);
		}
	};

	const fetchDistricts = async (stateId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/district/state/${stateId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setDistricts(response.data.data);

			console.log("Districts fetched:", response.data);
		} catch (error) {
			console.error("Error fetching districts:", error);
		}
	};

	const fetchPods = async (districtId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/pod/district/${districtId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setPods(response.data.data);
		} catch (error) {
			console.error("Error fetching PODs:", error);
		}
	};

	const fetchSites = async (podId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/site/pod/${podId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setSites(response.data.data);
		} catch (error) {
			console.error("Error fetching sites:", error);
		}
	};

	const handleAddGroup = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);

		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			// Validate required fields
			if (
				!name ||
				!selectedStateId ||
				!selectedDistrictId ||
				!selectedPodId ||
				!selectedSiteId
			) {
				alert("Please fill all required fields.");
				return;
			}

			// Construct payload
			const payload = {
				name: name,
				state_id: selectedStateId,
				district_id: selectedDistrictId,
				pod_id: selectedPodId,
				site_id: selectedSiteId,
			};

			// Send POST request
			const response = await axios.post(
				`https://api.wowdev.com.ng/api/v1/group`,
				payload,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);

			if (response.status === 200) {
				console.log("Group posted successfully");
				toast.success("Group added successfully");
				setName("");
				closeModal();
				fetchGroups(); // Refresh device data
			}
		} catch (error) {
			console.error("Error posting device:", error);
			toast.error("Failed to add group. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStates();
	}, []);

	useEffect(() => {
		if (selectedStateId) {
			fetchDistricts(selectedStateId);
			setSelectedDistrictId(null);
			setSelectedPodId(null);
			setSelectedSiteId(null);
		}
	}, [selectedStateId]);

	useEffect(() => {
		if (selectedDistrictId) {
			fetchPods(selectedDistrictId);
			setSelectedPodId(null);
			setSelectedSiteId(null);
		}
	}, [selectedDistrictId]);

	useEffect(() => {
		if (selectedPodId) {
			fetchSites(selectedPodId);
			setSelectedSiteId(null);
		}
	}, [selectedPodId]);

	const fetchGroups = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.get<{
				status: string;
				message: string;
				data: Group[];
			}>("https://api.wowdev.com.ng/api/v1/group", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const fetchedData = response.data.data;

			console.log("Group Data:", fetchedData);

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				state_id: item.state_id,
				district_id: item.district_id,
				pod_id: item.pod_id,
				site_id: item.site_id,
				name: item.name,
				created_at: item.created_at,
				updated_at: item.updated_at,
				site: item.site,
				pod: item.pod,
				district: item.district,
				state: item.state,
			}));

			console.log("Mapped Data:", mappedData);
			setTableData(mappedData as TData[]);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching group data:", error);
			toast.error("Failed to fetch group data. Please try again.");
		}
	};

	useEffect(() => {
		fetchGroups();
	}, []);

	const openModal = () => setModalOpen(true);
	const closeModal = () => setModalOpen(false);

	const handleDelete = () => {
		const selectedRowIds = Object.keys(rowSelection).filter(
			(key) => rowSelection[key]
		);
		const filteredData = tableData.filter(
			(_, index) => !selectedRowIds.includes(index.toString())
		);
		setTableData(filteredData);
		setRowSelection({});
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

	useEffect(() => {
		setTableData(data); // Sync `tableData` with `data` prop
	}, [data]);

	return (
		<div className="rounded-lg border-[1px] py-0 border-[#E2E4E9] mt-4">
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title="Edit Group"
				className="w-[500px]">
				<div className="bg-white py-5 rounded-lg transition-transform ease-in-out ">
					<hr className="mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />
					<div className="mt-3  pt-2">
						<p className="text-xs text-primary-6 font-inter">
							Location Preference
						</p>
						<RadioGroup defaultValue="super-admin">
							<div className="flex flex-row justify-between items-center gap-5">
								<div className="flex flex-row justify-start items-center gap-2 shadow-md p-2 rounded-lg w-full mt-2">
									<RadioGroupItem value="super-admin" id="super-admin" />
									<p className="text-sm text-primary-6 whitespace-nowrap">
										Group
									</p>
								</div>
							</div>
						</RadioGroup>
						<div className="flex flex-col gap-2 mt-4">
							<div className="flex flex-row items-center justify-between gap-5">
								<div className="w-[50%] lg:w-full">
									<p className="text-xs text-primary-6 mt-2 font-inter">
										State
									</p>
									<Select onValueChange={(value) => setSelectedStateId(value)}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select State" />
										</SelectTrigger>
										<SelectContent className="z-200 post bg-white">
											{states.map((state) => (
												<SelectItem key={state.id} value={state.id}>
													{state.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="w-[50%] lg:w-full">
									<p className="text-xs text-primary-6 mt-2 font-inter">
										District Name
									</p>
									<Select
										onValueChange={(value) => setSelectedDistrictId(value)}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select District" />
										</SelectTrigger>
										<SelectContent className="z-200 post bg-white">
											{districts.map((district) => (
												<SelectItem key={district.id} value={district.id}>
													{district.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<p className="text-xs text-primary-6 mt-2 font-inter">POD</p>
							<Select onValueChange={(value) => setSelectedPodId(value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select POD" />
								</SelectTrigger>
								<SelectContent className="z-200 post bg-white">
									{pods.map((pod) => (
										<SelectItem key={pod.id} value={pod.id}>
											{pod.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<p className="text-xs text-primary-6 mt-2 font-inter">
								Site Name
							</p>
							<Select onValueChange={(value) => setSelectedSiteId(value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Site" />
								</SelectTrigger>
								<SelectContent className="z-200 post bg-white">
									{sites.map((site) => (
										<SelectItem key={site.id} value={site.id}>
											{site.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<p className="text-xs text-primary-6 mt-2 font-inter">Group Name</p>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Edit Group Name"
							className="focus:border-none mt-2 border border-primary-1"
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
							onClick={handleAddGroup}>
							{isLoading ? "Loading..." : "Add Group"}
						</Button>
					</div>
				</div>
			</Modal>

			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full mt-2">
				<div className="p-3 flex flex-row justify-between items-center gap-3 w-full ">
					<Input
						placeholder="Search Group..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="focus:border-none bg-[#F9FAFB] w-[50%]"
					/>
					<div className="flex flex-row justify-start items-center gap-3">
						<Button className="bg-primary-1 text-white" onClick={openModal}>
							<IconPlus /> Create Group
						</Button>
						<Button
							className="border-[#E8E8E8] border-[1px] bg-white"
							onClick={handleDelete}>
							<IconTrash /> Delete
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
