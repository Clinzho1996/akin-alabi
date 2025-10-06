"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconCircleX, IconEdit, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ProjectDataTable } from "./project-table";

export type Project = {
	id: string;
	name: string;
	start_date: string;
	end_date: string;
	status: "open" | "yet_to_open" | "closed";
	user_id: string;
	groups: {
		id: string;
		name: string;
		state_id: string;
		district_id: string;
		pod_id: string;
		site_id: string;
	}[];
	created_at: string;
	updated_at: string;
};

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

const ProjectTable = () => {
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isOpenModalOpen, setOpenModalOpen] = useState(false);

	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isCloseModalOpen, setCloseModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Project[]>([]);
	const [isModalOpen, setModalOpen] = useState(false);

	// Form states
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

	const openEditModal = (row: any) => {
		const project = row.original;
		setSelectedRow(project);

		setProjectName(project.name);
		setStartDate(project.start_date);
		setEndDate(project.end_date);
		setSelectedGroups(project.groups || []);

		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const openCloseModal = (row: any) => {
		setSelectedRow(row.original);
		setCloseModalOpen(true);
	};

	const openOpenModal = (row: any) => {
		setSelectedRow(row.original);
		setOpenModalOpen(true); // Fixed this line
	};

	const closeOpenModal = () => {
		setOpenModalOpen(false);
	};

	const closeCloseModal = () => {
		setCloseModalOpen(false);
	};

	const openDeleteModal = (row: any) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	useEffect(() => {
		fetchStates();
	}, []);
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

	const handleUpdateProject = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			const response = await axios.post(
				`https://api.wowdev.com.ng/api/v1/project/${selectedRow.id}`,
				{
					name: projectName,
					start_date: startDate,
					end_date: endDate,
					groups: selectedGroups.map((g) => g.id),
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				toast.success("Project updated successfully");
				fetchProjects();
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating project:", error);
			toast.error("Failed to update project");
		} finally {
			setIsLoading(false);
		}
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
				setTableData(response.data.data);
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

	const deleteProject = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(
				`https://api.wowdev.com.ng/api/v1/project/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				// Remove the deleted farmer from the table
				setTableData((prevData) =>
					prevData.filter((farmer) => farmer.id !== id)
				);

				toast.success("Project deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting project:", error);
		}
	};
	const openProject = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.patch(
				`https://api.wowdev.com.ng/api/v1/project/open/${id}`,
				{}, // Empty body if no data needs to be sent
				{
					// Headers as a separate object
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				await fetchProjects();
				toast.success("Project Opened successfully.");
				closeOpenModal();
			}
		} catch (error) {
			console.error("Error opening project:", error);
			toast.error("Failed to open project. Please try again.");
		}
	};

	const closeProject = async (id: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.patch(
				`https://api.wowdev.com.ng/api/v1/project/close/${id}`,
				{}, // Empty body if no data needs to be sent
				{
					// Headers as a separate object
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				await fetchProjects();
				toast.success("Project closed successfully.");
				closeCloseModal();
			}
		} catch (error) {
			console.error("Error closing project:", error);
			toast.error("Failed to close project. Please try again.");
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	const columns: ColumnDef<Project>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="check"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="check"
				/>
			),
		},
		{
			accessorKey: "name",
			header: "Project Name",
			cell: ({ row }) => {
				const name = row.getValue<string>("name");
				return <span className="text-xs text-black">{name}</span>;
			},
		},
		{
			accessorKey: "start_date",
			header: "Start Date",
			cell: ({ row }) => {
				const startDate = row.getValue<string>("start_date");
				return <span className="text-xs text-primary-6">{startDate}</span>;
			},
		},
		{
			accessorKey: "end_date",
			header: "End Date",
			cell: ({ row }) => {
				const endDate = row.getValue<string>("end_date");
				return <span className="text-xs text-primary-6">{endDate}</span>;
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-start items-start"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const status = row.getValue<string>("status");
				const statusDisplay =
					{
						open: "Open",
						yet_to_open: "Yet to Open",
						closed: "Closed",
					}[status] || status;

				return (
					<div
						className={`status ${
							status === "open"
								? "green"
								: status === "yet_to_open"
								? "yellow"
								: "red"
						}`}>
						{statusDisplay}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const project = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-5">
						<Link href={`/project-management/${project.id}`}>
							<Button className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter">
								View Verification
							</Button>
						</Link>
						{project.status === "open" ? (
							<Button
								className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
								onClick={() => openCloseModal(row)}>
								Close
							</Button>
						) : (
							<Button
								className="border-[#E8E8E8] border-[1px] text-xs font-medium text-[#6B7280] font-inter"
								onClick={() => openOpenModal(row)}>
								Open
							</Button>
						)}

						<Button
							className="border-[#E8E8E8] border-[1px] text-sm font-medium text-[#6B7280] font-inter"
							onClick={() => openEditModal(row)}>
							<IconEdit />
						</Button>

						<Button
							className="border-[#E8E8E8] border-[1px] text-sm font-medium text-[#6B7280] font-inter"
							onClick={() => openDeleteModal(row)}>
							<IconTrash />
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<>
			<ProjectDataTable columns={columns} data={tableData} />

			{/* Edit Project Modal */}
			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit Project Details">
					<div className="bg-white py-5 rounded-lg w-[600px] transition-transform ease-in-out">
						{/* Basic Information Section */}
						<div className="mb-6">
							<h3 className="text-sm font-semibold text-gray-800 mb-4">
								Basic Information
							</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-xs text-gray-600 mb-1">
										Project Name
									</label>
									<Input
										type="text"
										value={projectName}
										onChange={(e) => setProjectName(e.target.value)}
										className="w-full"
									/>
								</div>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="block text-xs text-gray-600 mb-1">
											Start Date
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
											End Date
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
								Assign Project to farmers:
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

							{/* Selected Groups List */}
							<div className="mt-4 space-y-2">
								{selectedGroups.map((group) => (
									<div
										key={group?.id}
										className="flex justify-between items-center p-2 bg-gray-50 rounded">
										<div className="text-xs">
											<span className="text-[#6B7280]">
												State:{" "}
												{states?.find((s) => s.id === group?.state_id)?.name ||
													group?.state_id}
											</span>{" "}
											<span>
												District:{" "}
												{districts?.find((d) => d.id === group?.district_id)
													?.name || group?.district_id}
											</span>{" "}
											<span className="text-[#6B7280]">
												POD/Sector:{" "}
												{pods?.find((p) => p.id === group?.pod_id)?.name ||
													group?.pod_id}
											</span>{" "}
											<span>
												Site:{" "}
												{sites?.find((s) => s.id === group?.site_id)?.name ||
													group?.site_id}
											</span>{" "}
											<span className="text-[#6B7280]">
												Group name: {group?.name}
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
								onClick={closeEditModal}
								className="text-gray-600 border-gray-300">
								Cancel
							</Button>
							<Button
								onClick={handleUpdateProject}
								disabled={isLoading}
								className="bg-primary-1 text-white">
								{isLoading ? "Saving..." : "Save and Close"}
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{isOpenModalOpen && (
				<Modal onClose={closeOpenModal} isOpen={isOpenModalOpen}>
					<p className="mt-4">
						Are you sure you want to open {selectedRow?.name}'s account?
					</p>
					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeOpenModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={() => {
								if (selectedRow) {
									openProject(selectedRow.id);
								}
							}}>
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}

			{isCloseModalOpen && (
				<Modal onClose={closeCloseModal} isOpen={isCloseModalOpen}>
					<p className="mt-4">
						Are you sure you want to close the project: {selectedRow?.name}?
					</p>

					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeCloseModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={() => {
								if (selectedRow) {
									closeProject(selectedRow.id);
								}
							}}>
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p className="mt-4">
						Are you sure you want to delete {selectedRow?.name}'s project?
					</p>

					<p className="text-sm text-primary-6">This can't be undone</p>
					<div className="flex flex-row justify-end items-center gap-3 font-inter mt-4">
						<Button
							className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
							onClick={closeDeleteModal}>
							Cancel
						</Button>
						<Button
							className="bg-[#F04F4A] text-white font-inter text-xs modal-delete"
							onClick={async () => {
								await deleteProject(selectedRow.id);
								closeDeleteModal();
							}}>
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default ProjectTable;
