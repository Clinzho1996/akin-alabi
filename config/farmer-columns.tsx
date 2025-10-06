"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
} from "lucide-react";

import Loader from "@/components/Loader";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	IconCloudDownload,
	IconEye,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FarmerDataTable } from "./farmer-table";
import { Group } from "./group-columns";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Farmer = {
	id: string;
	oaf_id: string;
	first_name: string;
	last_name: string;
	other_name: string;
	gender: string;
	email: string;
	phone_number: string;
	dob: string;
	state_id: string;
	district_id: string;
	pod_id: string;
	site_id: string;
	group_id: string;
	pic: string;
	finger_bio: string | null;
	facial_bio: string | null;
	created_at: string;
	updated_at: string;
	group: {
		id: string;
		state_id: string;
		district_id: string;
		pod_id: string;
		site_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	site: {
		id: string;
		state_id: string;
		district_id: string;
		pod_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	pod: {
		id: string;
		state_id: string;
		district_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	district: {
		id: string;
		state_id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
	state: {
		id: string;
		name: string;
	};
};

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
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

const FarmerTable = () => {
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [allFarmersData, setAllFarmersData] = useState<Farmer[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<Farmer[]>([]);
	const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
	const [featuredImage, setFeaturedImage] = useState<File | null>(null);
	const [isAddingFarmer, setIsAddingFarmer] = useState(false);
	const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
		null
	);

	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalItems: 0,
		lastPage: 1,
		pageSize: 10,
		hasNextPage: false,
		hasPrevPage: false,
	});
	const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [gender, setGender] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [oafId, setOafId] = useState<string>("");
	const [otherName, setOtherName] = useState<string>("");
	const [dob, setDob] = useState<string>("");
	const [states, setStates] = useState<State[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [pods, setPods] = useState<Pod[]>([]);
	const [sites, setSites] = useState<Site[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const openEditModal = (row: any) => {
		const farmer = row.original;
		setSelectedRow(farmer);

		setFirstName(farmer.first_name || "");
		setLastName(farmer.last_name || "");
		setOtherName(farmer.other_name || "");
		setGender(farmer.gender || "");
		setOafId(farmer.oaf_id || "");
		setDob(farmer.dob || "");
		setPhoneNumber(farmer.phone_number || "");
		setEmail(farmer.email || "");
		setSelectedStateId(farmer.state_id || null);
		setSelectedDistrictId(farmer.district_id || null);
		setSelectedPodId(farmer.pod_id || null);
		setSelectedSiteId(farmer.site_id || null);
		setSelectedGroupId(farmer.group_id || null);

		if (farmer.pic) {
			setPreviewImage(farmer.pic);
		}

		// Fetch dependent data here
		if (farmer.state_id) {
			fetchDistricts(farmer.state_id);
		}
		if (farmer.district_id) {
			fetchPods(farmer.district_id);
		}
		if (farmer.pod_id) {
			fetchSites(farmer.pod_id);
		}
		if (farmer.site_id) {
			fetchGroups(farmer.site_id);
		}

		setEditModalOpen(true);
	};

	useEffect(() => {
		if (selectedStateId) {
			fetchDistricts(selectedStateId);
		}
	}, [selectedStateId]);

	useEffect(() => {
		if (selectedDistrictId) {
			fetchPods(selectedDistrictId);
		}
	}, [selectedDistrictId]);

	useEffect(() => {
		if (selectedPodId) {
			fetchSites(selectedPodId);
		}
	}, [selectedPodId]);

	useEffect(() => {
		if (selectedSiteId) {
			fetchGroups(selectedSiteId);
		}
	}, [selectedSiteId]);

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

	const fetchGroups = async (groupId: string) => {
		try {
			const session = await getSession();

			const accessToken = session?.backendData?.token;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}
			const response = await axios.get(
				`https://api.wowdev.com.ng/api/v1/group/site/${groupId}`,
				{
					headers: {
						Accept: "application/json",
						redirect: "follow",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setGroups(response.data.data);
			console.log("Group data", response.data.data);
		} catch (error) {
			console.error("Error fetching Groups:", error);
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

	useEffect(() => {
		fetchStates();
	}, []);

	const openDeleteModal = (row: any) => {
		setSelectedRow(row.original); // Use row.original to store the full row data
		setDeleteModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const fetchFarmers = async (
		page: number = 1,
		pageSize: number = 10,
		search: string = ""
	) => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return { data: [], pagination: pagination };
			}

			const response = await axios.get<{
				data: Farmer[];
				pagination: {
					current_page: number;
					total: number;
					next_page_url: string | null;
					prev_page_url: string | null;
				};
			}>("https://api.wowdev.com.ng/api/v1/farmer", {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				params: {
					page,
					per_page: pageSize,
					search: search,
				},
			});

			const fetchedData = response.data.data;
			const paginationData = response.data.pagination;

			const mappedData = fetchedData.map((item) => ({
				id: item.id,
				oaf_id: item.oaf_id,
				first_name: item.first_name,
				last_name: item.last_name,
				other_name: item.other_name,
				gender: item.gender,
				email: item.email,
				phone_number: item.phone_number,
				dob: item.dob,
				state_id: item.state_id,
				district_id: item.district_id,
				pod_id: item.pod_id,
				site_id: item.site_id,
				group_id: item.group_id,
				pic: item.pic,
				finger_bio: item.finger_bio,
				facial_bio: item.facial_bio,
				created_at: item.created_at,
				updated_at: item.updated_at,
				group: item.group || "N/A",
				site: item.site || "N/A",
				pod: item.pod || "N/A",
				district: item.district || "N/A",
				state: item.state || "N/A",
				biometricStatus:
					item.finger_bio && item.facial_bio
						? "both"
						: item.facial_bio
						? "facial"
						: item.finger_bio
						? "fingerprint"
						: "none",
			}));

			console.log("Farmer Data:", mappedData);
			setTableData(mappedData);

			setPagination({
				currentPage: paginationData.current_page,
				totalItems: paginationData.total,
				lastPage: Math.ceil(paginationData.total / pageSize),
				pageSize,
				hasNextPage: !!paginationData.next_page_url,
				hasPrevPage: !!paginationData.prev_page_url,
			});

			return {
				data: mappedData,
				pagination: {
					currentPage: paginationData.current_page,
					totalItems: paginationData.total,
					lastPage: Math.ceil(paginationData.total / pageSize),
					pageSize,
					hasNextPage: !!paginationData.next_page_url,
					hasPrevPage: !!paginationData.prev_page_url,
				},
			};
		} catch (error) {
			console.error("Error fetching farmer data:", error);
			return {
				data: [],
				pagination: {
					currentPage: 1,
					totalItems: 0,
					lastPage: 1,
					pageSize: 10,
					hasNextPage: false,
					hasPrevPage: false,
				},
			};
		} finally {
			setIsLoading(false);
		}
	};

	const deleteFarmer = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(
				`https://api.wowdev.com.ng/api/v1/farmer/${id}`,
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

				toast.success("Farmer deleted successfully");
			}
		} catch (error) {
			console.error("Error deleting farmer:", error);
		}
	};

	useEffect(() => {
		fetchFarmers(pagination.currentPage, pagination.pageSize, search);
	}, [pagination.currentPage, pagination.pageSize, search]);

	useEffect(() => {
		const delay = setTimeout(() => {
			setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
			setSearch(searchInput); // Only now update the "active search"
		}, 500); // 500ms delay after typing stops

		return () => clearTimeout(delay);
	}, [searchInput]);

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= pagination.lastPage) {
			setPagination((prev) => ({ ...prev, currentPage: newPage }));
		}
	};

	const handlePageSizeChange = (newSize: number) => {
		setPagination((prev) => ({
			...prev,
			pageSize: newSize,
			currentPage: 1, // Reset to first page when changing page size
		}));
	};
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setFeaturedImage(file);

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setPreviewImage(null);
		}
	};

	const handleEditFarmer = async () => {
		setIsAddingFarmer(true);
		try {
			const session = await getSession();
			const accessToken = session?.backendData?.token;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const formData = new FormData();
			formData.append("first_name", firstName);
			formData.append("last_name", lastName);
			formData.append("other_name", otherName);
			formData.append("gender", gender);
			formData.append("oaf_id", oafId);
			formData.append("dob", dob);
			formData.append("phone_number", phoneNumber);
			formData.append("email", email);
			formData.append("group_id", selectedGroupId || "");
			formData.append("site_id", selectedSiteId || "");
			formData.append("pod_id", selectedPodId || "");
			formData.append("district_id", selectedDistrictId || "");
			formData.append("state_id", selectedStateId || "");

			if (featuredImage) {
				formData.append("pic", featuredImage);
			}

			const response = await axios.post(
				`https://api.wowdev.com.ng/api/v1/farmer/${selectedRow.id}`, // Use the selected farmer's ID
				formData,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			console.log("Farmer updated successfully:", response.data);
			await fetchFarmers(); // Refresh the table data
			toast.success("Farmer updated successfully");

			closeEditModal(); // Close the modal
		} catch (error) {
			console.error("Error updating farmer:", error);
			toast.error("Failed to update farmer");
		} finally {
			setIsAddingFarmer(false);
		}
	};
	const formatDate = (rawDate: string | Date) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};
	const columns: ColumnDef<Farmer>[] = [
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
			accessorKey: "oaf_id",
			header: "OAF-ID",
			cell: ({ row }) => {
				const oafId = row.getValue<string>("oaf_id");
				return <span className="text-xs text-black">{oafId}</span>;
			},
		},
		{
			accessorKey: "first_name",
			header: "First Name",
			cell: ({ row }) => {
				const firstName = row.getValue<string>("first_name");
				return (
					<span className="text-xs text-black capitalize">{firstName}</span>
				);
			},
		},
		{
			accessorKey: "last_name",
			header: "Last Name",
			cell: ({ row }) => {
				const lastName = row.getValue<string>("last_name");
				return (
					<span className="text-xs text-black capitalize">{lastName}</span>
				);
			},
		},
		{
			accessorKey: "group.name",
			header: "Group Name",
			cell: ({ row }) => {
				const groupName = row.original.group?.name || "N/A"; // Fix applied here
				return <span className="text-xs text-primary-6">{groupName}</span>;
			},
		},
		{
			accessorKey: "site.name",
			header: "Site Name",
			cell: ({ row }) => {
				const siteName = row.original.site?.name || "N/A"; // Fix applied here
				return <span className="text-xs text-primary-6">{siteName}</span>;
			},
		},
		{
			accessorKey: "pod.name",
			header: "Pod Name",
			cell: ({ row }) => {
				const podName = row.original.pod?.name || "N/A"; // Fix applied here
				return <span className="text-xs text-primary-6">{podName}</span>;
			},
		},
		{
			accessorKey: "created_at",
			header: "Date Joined",
			cell: ({ row }) => {
				const rawDate = row.original.created_at;
				const date = new Date(rawDate); // ✅ Convert it to a Date object

				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
		{
			accessorKey: "biometricStatus",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-[13px] text-start items-start"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}>
						Biometric Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const { facial_bio, finger_bio } = row.original;
				const status =
					facial_bio && finger_bio
						? "both"
						: facial_bio
						? "facial"
						: finger_bio
						? "fingerprint"
						: "none";

				return (
					<div
						className={`status ${
							status === "both"
								? "green"
								: status === "facial"
								? "blue"
								: status === "fingerprint"
								? "yellow"
								: "red"
						}`}>
						{status}
					</div>
				);
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
								className="h-8 w-8 p-2 bg-white border-[1px] bborder-[#E8E8E8]">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="bg-white">
							<Link href={`/farmer-management/${actions.id}`}>
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
			{isLoading ? (
				<Loader />
			) : (
				<>
					<div className="flex items-center justify-between  gap-3 ">
						<Input
							type="text"
							value={searchInput}
							className="bg-white"
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Search farmers..."
						/>

						<Button
							onClick={() => fetchFarmers(1, pagination.pageSize, search)}
							className="ml-2 bg-primary-1 text-white">
							Search
						</Button>
					</div>

					<FarmerDataTable columns={columns} data={tableData} />
				</>
			)}

			{/* Pagination Controls */}
			<div className="flex items-center justify-between px-2 py-4">
				<div className="flex items-center space-x-2 gap-3">
					<p className="text-sm font-medium">Rows per page</p>
					<Select
						value={`${pagination.pageSize}`}
						onValueChange={(value) => handlePageSizeChange(Number(value))}>
						<SelectTrigger className="h-8 w-[70px] bg-white border border-[#E8E8E8]">
							<SelectValue placeholder={pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top" className="z-200 post bg-white">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8 gap-3">
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {pagination.currentPage} of {pagination.lastPage}
					</div>
					<div className="flex items-center space-x-2 gap-2">
						<Button
							variant="outline"
							className="h-8 w-8 p-0 bg-white"
							onClick={() => handlePageChange(pagination.currentPage - 1)}
							disabled={!pagination.hasPrevPage}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0 bg-white"
							onClick={() => handlePageChange(pagination.currentPage + 1)}
							disabled={!pagination.hasNextPage}>
							<span className="sr-only">Go to next page</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit Farmer">
					<div className="bg-white py-1 rounded-lg w-[600px] transition-transform ease-in-out max-h[70vh] add-farmer overflow-y-auto">
						<div className="mt-3 border-t-[1px] border-[#E2E4E9] pt-2">
							{/* Basic Information Section */}
							<div>
								<p className="text-sm text-dark-1">Basic Information</p>
								<div className="flex flex-col gap-2 mt-4">
									<div className="flex flex-row gap-3 justify-between items-center">
										<div>
											<p className="text-xs text-primary-6 font-inter">
												First Name
											</p>
											<Input
												type="text"
												className="focus:border-none mt-2"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
											/>
										</div>
										<div>
											<p className="text-xs text-primary-6 font-inter">
												Last Name
											</p>
											<Input
												type="text"
												className="focus:border-none mt-2"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
											/>
										</div>
									</div>
									<div className="flex flex-row gap-3 justify-between items-center w-full">
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Other Name
											</p>
											<Input
												type="text"
												className="focus:border-none mt-2"
												value={otherName}
												onChange={(e) => setOtherName(e.target.value)}
											/>
										</div>
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Gender
											</p>
											<Select
												value={gender}
												onValueChange={(value) => setGender(value)}>
												<SelectTrigger className="w-full mt-2">
													<SelectValue placeholder="Select Gender" />
												</SelectTrigger>
												<SelectContent className="z-200 post bg-white">
													<SelectItem value="male">Male</SelectItem>
													<SelectItem value="female">Female</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="flex flex-row gap-3 justify-between items-center">
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												OAF-ID
											</p>
											<Input
												type="text"
												className="focus:border-none mt-2"
												value={oafId}
												onChange={(e) => setOafId(e.target.value)}
											/>
										</div>
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Date of Birth
											</p>
											<Input
												type="date"
												className="focus:border-none mt-2"
												value={dob}
												onChange={(e) => setDob(e.target.value)}
											/>
										</div>
									</div>
									<div className="flex flex-row gap-3 justify-between items-center">
										<div>
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Phone Number
											</p>
											<Input
												type="text"
												className="focus:border-none mt-2"
												value={phoneNumber}
												onChange={(e) => setPhoneNumber(e.target.value)}
											/>
										</div>
										<div>
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Email
											</p>
											<Input
												type="email"
												className="focus:border-none mt-2"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Location Section */}
							<div className="mt-4">
								<p className="text-sm text-dark-1">Location</p>
								<div className="flex flex-col gap-2 mt-2">
									<div className="flex flex-row items-center justify-between gap-5">
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												State
											</p>
											<Select
												value={selectedStateId || ""}
												onValueChange={(value) => setSelectedStateId(value)}>
												<SelectTrigger className="w-full mt-2">
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
												District
											</p>
											<Select
												value={selectedDistrictId || ""}
												onValueChange={(value) => setSelectedDistrictId(value)}>
												<SelectTrigger className="w-full mt-2">
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
									<div className="flex flex-row items-center justify-between gap-5 mt-1">
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												POD/Sector
											</p>
											<Select
												value={selectedPodId || ""}
												onValueChange={(value) => setSelectedPodId(value)}>
												<SelectTrigger className="w-full mt-2">
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
										<div className="w-[50%] lg:w-full">
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Site
											</p>
											<Select
												value={selectedSiteId || ""}
												onValueChange={(value) => setSelectedSiteId(value)}>
												<SelectTrigger className="w-full mt-2">
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
									<div className="flex flex-col gap-2">
										<div>
											<p className="text-xs text-primary-6 mt-2 font-inter">
												Group
											</p>
											<Select
												value={selectedGroupId || ""}
												onValueChange={(value) => setSelectedGroupId(value)}>
												<SelectTrigger className="w-full mt-2">
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
										</div>
									</div>
								</div>
							</div>

							{/* Image Upload Section */}
							<div className="mt-4">
								<p className="text-xs text-primary-6 font-inter">
									Upload Image
								</p>
								<div className="flex flex-col justify-center items-center gap-3 p-3 border-dashed border rounded-lg mt-3 mb-4">
									<IconCloudDownload size={14} />
									<p className="text-xs font-inter text-[#4B5563]">
										Choose a file
									</p>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										id="fileInput"
										onChange={handleFileChange}
									/>
									<Button
										className="border text-xs p-2"
										onClick={() =>
											document.getElementById("fileInput")?.click()
										}>
										Browse File
									</Button>
									{previewImage && (
										<div className="mt-2 flex flex-row justify-start items-center gap-3">
											<Image
												src={previewImage}
												width={100}
												height={100}
												alt="Preview"
												className="w-[200px] h-[200px] object-cover rounded-md"
											/>
											<Button
												onClick={() => {
													setFeaturedImage(null);
													setPreviewImage(null);
												}}
												className="border text-xs p-2">
												Remove
											</Button>
										</div>
									)}
								</div>
							</div>

							{/* Modal Footer */}
							<div className="flex flex-row justify-end items-center gap-3 font-inter">
								<Button
									className="border-[#E8E8E8] border-[1px] text-primary-6 text-xs"
									onClick={closeEditModal}>
									Cancel
								</Button>
								<Button
									className="bg-primary-1 text-white font-inter text-xs"
									onClick={handleEditFarmer}
									disabled={isAddingFarmer}>
									{isAddingFarmer ? "Updating..." : "Update"}
								</Button>
							</div>
						</div>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p className="mt-4">
						Are you sure you want to delete {selectedRow?.first_name}'s account?
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
								await deleteFarmer(selectedRow.id);
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

export default FarmerTable;
