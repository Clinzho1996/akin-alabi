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

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
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
import { IconCircleX, IconPlus } from "@tabler/icons-react";
import axios from "axios";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Project } from "./project-columns";

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
	state_id: string;
}

interface Pod {
	id: string;
	name: string;
	district_id: string;
}

interface Site {
	id: string;
	name: string;
	pod_id: string;
}

interface Group {
	state_id: string;
	district_id: string;
	pod_id: string;
	id: string;
	name: string;
	site_id: string;
}

export function ProjectDataTable<TData, TValue>({
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
	const [selectedStatus, setSelectedStatus] = useState<string>("View All");
	const [globalFilter, setGlobalFilter] = useState("");
	const [isCreateModalOpen, setCreateModalOpen] = useState(false);
	const [tableData, setTableData] = useState(data);
	const [isLoading, setIsLoading] = useState(false);
	// Staff states
	const [staff, setStaff] = useState<
		{ id: string; first_name: string; last_name: string }[]
	>([]);
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

	// Form states for creating project
	const [projectName, setProjectName] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);

	// Location states
	const [states, setStates] = useState<State[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [pods, setPods] = useState<Pod[]>([]);
	const [sites, setSites] = useState<Site[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);

	const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
	const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
		null
	);
	const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

	const openCreateModal = () => setCreateModalOpen(true);
	const closeCreateModal = () => {
		setCreateModalOpen(false);
		resetForm();
	};

	const resetForm = () => {
		setProjectName("");
		setStartDate("");
		setEndDate("");
		setSelectedGroups([]);
		setSelectedStateId(null);
		setSelectedDistrictId(null);
		setSelectedPodId(null);
		setSelectedSiteId(null);
		setSelectedGroupId(null);
	};

	const fetchStates = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.get(
				"https://api.wowdev.com.ng/api/v1/state",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setStates(response.data.data);
		} catch (error) {
			console.error("Error fetching states:", error);
		}
	};

	const fetchDistricts = async (stateId: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/district/state/${stateId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setDistricts(response.data.data);
		} catch (error) {
			console.error("Error fetching districts:", error);
		}
	};

	const fetchPods = async (districtId: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/pod/district/${districtId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setPods(response.data.data);
		} catch (error) {
			console.error("Error fetching pods:", error);
		}
	};

	const fetchSites = async (podId: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/site/pod/${podId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setSites(response.data.data);
		} catch (error) {
			console.error("Error fetching sites:", error);
		}
	};

	const fetchGroups = async (siteId: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/group/site/${siteId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setGroups(response.data.data);
		} catch (error) {
			console.error("Error fetching groups:", error);
		}
	};

	const fetchStaff = async () => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.get(
				"https://api.wowdev.com.ng/api/v1/user",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			setStaff(response.data.data); // assuming API returns array of {id, name}
		} catch (error) {
			console.error("Error fetching staff:", error);
			toast.error("Failed to fetch staff list");
		}
	};

	useEffect(() => {
		if (isCreateModalOpen) {
			fetchStaff();
		}
	}, [isCreateModalOpen]);

	const handleAddGroup = () => {
		if (
			selectedGroupId &&
			selectedStateId &&
			selectedDistrictId &&
			selectedPodId &&
			selectedSiteId
		) {
			const groupToAdd = groups.find((g) => g.id === selectedGroupId);
			if (groupToAdd && !selectedGroups.some((g) => g.id === groupToAdd.id)) {
				setSelectedGroups([
					...selectedGroups,
					{
						...groupToAdd,
						state_id: selectedStateId,
						district_id: selectedDistrictId,
						pod_id: selectedPodId,
						site_id: selectedSiteId,
					},
				]);
			}
		}
	};

	const handleRemoveGroup = (groupId: string) => {
		setSelectedGroups(selectedGroups.filter((g) => g.id !== groupId));
	};

	const fetchProjects = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<{
				status: string;
				data: Project[];
				pagination: any;
			}>("https://api.wowdev.com.ng/api/v1/project", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				setTableData(response.data.data as TData[]);
			} else {
				throw new Error("Failed to fetch projects");
			}
		} catch (error) {
			console.error("Error fetching project data:", error);
			toast.error("Failed to fetch projects. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateProject = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!projectName || !startDate || !endDate) {
				toast.error("Please fill all required fields");
				return;
			}

			const response = await axios.post(
				"https://api.wowdev.com.ng/api/v1/project",
				{
					user_id: selectedStaffId,
					name: projectName,
					start_date: startDate,
					end_date: endDate,
					site_id: selectedSiteId,
					groups: selectedGroups.map((g) => g.id),
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				toast.success("Project created successfully");
				closeCreateModal();
				fetchProjects();
			}
		} catch (error) {
			console.error("Error creating project:", error);
			toast.error("Failed to create project");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStates();
	}, []);

	const handleStatusFilter = (status: string) => {
		setSelectedStatus(status);

		// Map UI status to API status values
		const statusMap: Record<string, string | null> = {
			"View All": null,
			Open: "open",
			"Yet to Open": "yet_to_open", // This was likely the issue
			Closed: "closed",
		};

		const apiStatus = statusMap[status];

		if (apiStatus === null) {
			setTableData(data); // Reset to all data
		} else {
			const filteredData = data.filter(
				(project: any) => project.status === apiStatus
			);
			setTableData(filteredData);
		}
	};

	useEffect(() => {
		handleStatusFilter(selectedStatus);
	}, [data]);

	useEffect(() => {
		setTableData(data);
	}, [data]);

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
			{/* Create Project Modal */}
			<Modal
				isOpen={isCreateModalOpen}
				onClose={closeCreateModal}
				title="Create New Project">
				<div className="bg-white py-5 rounded-lg w-[600px] transition-transform ease-in-out modal">
					{/* Basic Information Section */}
					<div className="mb-6">
						<h3 className="text-sm font-semibold text-gray-800 mb-4">
							Basic Information
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-xs text-gray-600 mb-1">
									Project Name *
								</label>
								<Input
									type="text"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									className="w-full"
									placeholder="Enter project name"
								/>
							</div>
							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-xs text-gray-600 mb-1">
										Start Date *
									</label>
									<Input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										className="w-full"
									/>
								</div>
								<div className="flex-1">
									<label className="block text-xs text-gray-600 mb-1">
										End Date *
									</label>
									<Input
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										className="w-full"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Assign to Farmers Section */}
					<div className="mb-6 mt-4">
						<h3 className="text-sm font-semibold text-gray-800 mb-4">
							Assign Project to farmers *
						</h3>

						{/* Location Selectors */}
						<div className="space-y-4">
							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-xs text-gray-600 mb-1">
										State
									</label>
									<Select
										value={selectedStateId || ""}
										onValueChange={(value) => {
											setSelectedStateId(value);
											setSelectedDistrictId(null);
											setSelectedPodId(null);
											setSelectedSiteId(null);
											setSelectedGroupId(null);
											fetchDistricts(value);
										}}>
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
								<div className="flex-1">
									<label className="block text-xs text-gray-600 mb-1">
										District Name
									</label>
									<Select
										value={selectedDistrictId || ""}
										onValueChange={(value) => {
											setSelectedDistrictId(value);
											setSelectedPodId(null);
											setSelectedSiteId(null);
											setSelectedGroupId(null);
											fetchPods(value);
										}}
										disabled={!selectedStateId}>
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

							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-xs text-gray-600 mb-1">
										POD/Sector
									</label>
									<Select
										value={selectedPodId || ""}
										onValueChange={(value) => {
											setSelectedPodId(value);
											setSelectedSiteId(null);
											setSelectedGroupId(null);
											fetchSites(value);
										}}
										disabled={!selectedDistrictId}>
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
								</div>
								<div className="flex-1">
									<label className="block text-xs text-gray-600 mb-1">
										Site Name
									</label>
									<Select
										value={selectedSiteId || ""}
										onValueChange={(value) => {
											setSelectedSiteId(value);
											setSelectedGroupId(null);
											fetchGroups(value);
										}}
										disabled={!selectedPodId}>
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
							</div>

							<div>
								<label className="block text-xs text-gray-600 mb-1">
									Group Name
								</label>
								<div className="flex gap-2">
									<Select
										value={selectedGroupId || ""}
										onValueChange={(value) => setSelectedGroupId(value)}
										disabled={!selectedSiteId}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select Group" />
										</SelectTrigger>
										<SelectContent className="z-200 post bg-white">
											{groups.map((group) => (
												<SelectItem key={group.id} value={group.id}>
													{group.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										onClick={handleAddGroup}
										disabled={!selectedGroupId}
										className="bg-primary-1 text-white">
										+ Add
									</Button>
								</div>
							</div>
						</div>

						<div>
							<label className="block text-xs text-gray-600 mb-1 mt-4">
								Assign Staff *
							</label>
							<Select
								value={selectedStaffId || ""}
								onValueChange={(value) => setSelectedStaffId(value)}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Staff" />
								</SelectTrigger>
								<SelectContent className="z-200 post bg-white ">
									{staff.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											{member.first_name} {member.last_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Selected Groups List */}
						<div className="mt-4 space-y-2">
							{selectedGroups.map((group) => (
								<div
									key={group.id}
									className="flex justify-between items-center p-2 bg-gray-50 rounded">
									<div className="text-xs">
										<span className="text-[#6B7280]">
											State:{" "}
											{states.find((s) => s.id === group.state_id)?.name ||
												group.state_id}
										</span>{" "}
										<span>
											District:{" "}
											{districts.find((d) => d.id === group.district_id)
												?.name || group.district_id}
										</span>{" "}
										<span className="text-[#6B7280]">
											POD/Sector:{" "}
											{pods.find((p) => p.id === group.pod_id)?.name ||
												group.pod_id}
										</span>{" "}
										<span>
											Site:{" "}
											{sites.find((s) => s.id === group.site_id)?.name ||
												group.site_id}
										</span>{" "}
										<span className="text-[#6B7280]">
											Group name: {group.name}
										</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveGroup(group.id)}
										className="text-red-500 hover:text-red-700">
										<IconCircleX color="red" />
									</Button>
								</div>
							))}
						</div>
					</div>

					{/* Modal Footer */}
					<div className="flex justify-end gap-3 pt-4  border-gray-200">
						<Button
							variant="outline"
							onClick={closeCreateModal}
							className="text-gray-600 border-gray-300">
							Cancel
						</Button>
						<Button
							onClick={handleCreateProject}
							disabled={isLoading || !projectName || !startDate || !endDate}
							className="bg-primary-1 text-white">
							{isLoading ? "Creating..." : "Create Project"}
						</Button>
					</div>
				</div>
			</Modal>

			{/* Rest of your table component */}
			<div
				className="bg-white flex flex-row border-b-[1px] border-[#E2E4E9] justify-between items-center p-3"
				style={{
					borderTopLeftRadius: "0.5rem",
					borderTopRightRadius: "0.5rem",
				}}>
				<div>
					<div className="flex flex-row justify-start items-center gap-2">
						<Image
							src="/images/staffm.png"
							alt="staff management"
							height={20}
							width={20}
						/>
						<p className="text-sm text-dark-1 font-medium font-inter">
							Project Management
						</p>
					</div>

					<p className="text-xs text-primary-6 mt-3">
						Here is an overview of all the project
					</p>
				</div>
				<div className="flex flex-row justify-start items-center gap-3 font-inter">
					<Button
						className="bg-primary-1 text-white font-inter"
						onClick={openCreateModal}>
						<IconPlus /> Create Project
					</Button>
				</div>
			</div>

			<div className="p-3 flex flex-row justify-between border-b-[1px] border-[#E2E4E9] bg-white items-center gap-20 max-w-full">
				<div className="flex flex-row justify-center bg-white items-center rounded-lg mx-auto special-btn-farmer pr-2">
					{["View All", "Open", "Yet to Open", "Closed"].map(
						(status, index, arr) => (
							<p
								key={status}
								className={`px-2 py-2 text-center text-sm cursor-pointer border border-[#E2E4E9] overflow-hidden ${
									selectedStatus === status
										? "bg-primary-5 text-dark-1"
										: "text-[#344054]"
								} 
			${index === 0 ? "rounded-l-lg firstRound" : ""} 
			${index === arr.length - 1 ? "rounded-r-lg lastRound" : ""}`}
								onClick={() => handleStatusFilter(status)}>
								{status}
							</p>
						)
					)}
				</div>

				<div className="p-3 flex flex-row justify-start items-center gap-3 w-full ">
					<Input
						placeholder="Search Project..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="focus:border-none bg-[#F9FAFB]"
					/>
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
