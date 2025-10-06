"use client";

import { ColumnDef, RowSelectionState } from "@tanstack/react-table";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconEye, IconPencil, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { MoreHorizontal } from "lucide-react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DistrictDataTable } from "./district-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type District = {
	id: string;
	state_id: string;
	district_id: string;
	pod_id: string;
	site_id: string;
	name: string;
	created_at: string;
	updated_at: string;
	state: {
		id: string;
		name: string;
	};
};

interface State {
	id: string;
	name: string;
}

const DistrictTable = () => {
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [tableData, setTableData] = useState<District[]>([]);
	const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
	const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
		null
	);
	const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

	const [name, setName] = useState<string>("");
	const [states, setStates] = useState<State[]>([]);

	useEffect(() => {
		if (selectedRow && isEditModalOpen) {
			// Pre-fill the dropdowns with existing data
			setName(selectedRow.name);
			setSelectedStateId(selectedRow.state_id || null);
		}
	}, [selectedRow, isEditModalOpen]);

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

	useEffect(() => {
		fetchStates();
	}, []);

	useEffect(() => {
		if (selectedStateId) {
			setSelectedDistrictId(null);
			setSelectedPodId(null);
			setSelectedSiteId(null);
		}
	}, [selectedStateId]);

	useEffect(() => {
		if (selectedDistrictId) {
			setSelectedPodId(null);
			setSelectedSiteId(null);
		}
	}, [selectedDistrictId]);

	useEffect(() => {
		if (selectedPodId) {
			setSelectedSiteId(null);
		}
	}, [selectedPodId]);

	const handleEditDistrict = async (event: React.FormEvent) => {
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
			if (!name || !selectedStateId) {
				alert("Please fill all required fields.");
				return;
			}

			// Construct payload
			const payload = {
				name: name,
				state_id: selectedStateId,
			};

			// Send POST request
			const response = await axios.put(
				`https://api.wowdev.com.ng/api/v1/district/${selectedRow.id}`,
				payload,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);

			if (response.status === 200) {
				console.log("District posted successfully");
				await fetchDistricts();
				toast.success("District updated successfully");

				setName("");
				closeEditModal();
			}
		} catch (error) {
			console.error("Error adding district:", error);
			toast.error("Failed to edit district. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchDistricts = async () => {
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
				data: District[];
			}>("https://api.wowdev.com.ng/api/v1/district", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const fetchedData = response.data.data;

			console.log("Site Data:", fetchedData);

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				state_id: item.state_id,
				district_id: item.district_id,
				pod_id: item.pod_id,
				site_id: item.site_id,
				name: item.name,
				created_at: item.created_at,
				updated_at: item.updated_at,
				state: item.state,
			}));

			console.log("Mapped Data:", mappedData);
			setTableData(mappedData);

			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching district data:", error);
			toast.error("Failed to fetch district data. Please try again.");
		}
	};

	useEffect(() => {
		fetchDistricts();
	}, []);

	const deleteDistrict = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(
				`https://api.wowdev.com.ng/api/v1/district/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.status === 200) {
				await fetchDistricts();
				toast.success("District deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting district:", error);
		}
	};
	const openModal = (row: any) => {
		setSelectedRow(row.original); // Use row.original to store the full row data
		setModalOpen(true);
	};

	const openEditModal = (row: any) => {
		setSelectedRow(row.original); // Use row.original to store the full row data
		setEditModalOpen(true);
	};

	const openDeleteModal = (row: any) => {
		setSelectedRow(row.original); // Use row.original to store the full row data
		setDeleteModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const columns: ColumnDef<District>[] = [
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
			accessorKey: "district.name",
			header: "District",
			cell: ({ row }) => {
				const districtName = row.original.name;
				return <span className="text-xs text-primary-6">{districtName}</span>;
			},
		},
		{
			accessorKey: "state.name",
			header: "State",
			cell: ({ row }) => {
				const stateName = row.original.state.name;
				return <span className="text-xs text-primary-6">{stateName}</span>;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const actions = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 p-2 bg-white border-[1px] border-[#E8E8E8]">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="bg-white">
							<Link href={`/district-management/${actions.id}`}>
								<DropdownMenuItem className="action cursor-pointer hover:bg-secondary-3">
									<IconEye />
									<p className="text-xs font-inter">View</p>
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem
								className="action cursor-pointer hover:bg-yellow-300"
								onClick={() => openEditModal(row)}>
								<IconPencil />
								<p className="text-xs font-inter">Edit</p>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="action cursor-pointer hover:bg-red-500"
								onClick={() => openDeleteModal(row)}>
								<IconTrash color="#F43F5E" />
								<p className="text-[#F43F5E] delete text-xs font-inter">
									Delete
								</p>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return (
		<>
			<DistrictDataTable columns={columns} data={tableData} />

			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit District"
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
											District
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
										<Select
											value={selectedStateId || ""}
											onValueChange={(value) => setSelectedStateId(value)}>
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
								</div>
							</div>
							<p className="text-xs text-primary-6 mt-2 font-inter">
								District Name
							</p>
							<Input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Edit District Name"
								className="focus:border-none mt-2 border border-primary-1"
							/>
						</div>
						<hr className="mt-4 mb-4 text-[#9F9E9E40]" color="#9F9E9E40" />
						<div className="flex flex-row justify-end items-center gap-3 font-inter">
							<Button
								className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
								onClick={closeEditModal}>
								Cancel
							</Button>
							<Button
								className="bg-primary-1 text-white font-inter text-xs"
								onClick={handleEditDistrict}
								disabled={isLoading}>
								{isLoading ? "Loading..." : "Update District"}
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p className="mt-4">
						Are you sure you want to delete this district: {""}
						{selectedRow?.name}?
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
								await deleteDistrict(selectedRow.id);
								closeDeleteModal();
							}}>
							{isLoading ? "Deleting..." : "Yes, Confirm"}
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default DistrictTable;
