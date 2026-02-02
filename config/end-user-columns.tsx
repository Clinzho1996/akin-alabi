"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, Printer } from "lucide-react";

import Loader from "@/components/Loader";
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
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EndUserDataTable } from "./end-user-table";

// This type is used to define the shape of our data.
export type EndUser = {
	id: string;
	membership_code: string;
	first_name: string;
	last_name: string;
	middle_name: string | null;
	dob: string;
	gender: string;
	email: string;
	phone: string;
	residential_address: string;
	residential_state: string;
	residential_lga: string;
	residential_city: string;
	state_of_origin: string;
	lga_of_origin: string;
	nationality: string;
	identity_type: string;
	identity_number: string;
	association: string | null;
	education_level: string | null;
	employment_status: string;
	occupation: string;
	pic: string | null;
	finger_bio: string | null;
	facial_bio: string | null;
	finger_bio_encoding: string | null;
	facial_bio_encoding: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

interface ApiResponse {
	status: string;
	message: string;
	data: EndUser[];
	pagination?: {
		current_page: number;
		next_page_url: string | null;
		prev_page_url: string | null;
		total: number;
		per_page: number;
	};
}

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}

interface EditData {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	gender: string;
	dob: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const EndUserTable = () => {
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<EndUser | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tableData, setTableData] = useState<EndUser[]>([]);
	const [isEditModalOpen, setEditModalOpen] = useState(false);
	const [serverPagination, setServerPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 1,
	});

	const [editData, setEditData] = useState<EditData>({
		id: "",
		first_name: "",
		last_name: "",
		email: "",
		gender: "male",
		dob: "",
	});

	const openEditModal = (row: Row<EndUser>) => {
		const user = row.original;
		setEditData({
			id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			gender: user.gender,
			dob: user.dob ? user.dob.split("T")[0] : "",
		});
		setEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditModalOpen(false);
	};

	const handleEditUser = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.post(
				`${BASE_URL}/beneficiary/${editData.id}`,
				{
					first_name: editData.first_name,
					last_name: editData.last_name,
					email: editData.email,
					gender: editData.gender,
					dob: editData.dob,
				},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			if (response.data.status === "success") {
				toast.success("User updated successfully.");
				fetchUsers(serverPagination.page, serverPagination.limit);
				closeEditModal();
			}
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error("Failed to update user. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteModal = (row: Row<EndUser>) => {
		setSelectedRow(row.original);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
	};

	const fetchUsers = async (page = 1, limit = 10) => {
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
				`${BASE_URL}/beneficiary?page=${page}&limit=${limit}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			console.log("API Response:", response.data); // Debug log

			if (response.data.status === "success") {
				const formattedData = response.data.data.map((user) => ({
					...user,
					id: user.id,
				}));

				setTableData(formattedData);

				if (response.data.pagination) {
					const pagination = response.data.pagination;
					const totalPages = Math.ceil(pagination.total / pagination.per_page);

					console.log("Setting pagination:", {
						page: pagination.current_page,
						limit: pagination.per_page,
						total: pagination.total,
						pages: totalPages,
						next_page: pagination.next_page_url,
					});

					setServerPagination({
						page: pagination.current_page,
						limit: pagination.per_page,
						total: pagination.total,
						pages: totalPages,
					});
				}
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			toast.error("Failed to fetch users. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(1, 10);
	}, []);

	const deleteUser = async (id: string) => {
		try {
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/beneficiary/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				data: { id },
			});

			if (response.data.status === "success") {
				fetchUsers(serverPagination.page, serverPagination.limit);
				toast.success("User deleted successfully.");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error("Failed to delete user. Please try again.");
		}
	};

	const formatDate = (rawDate: string | Date | null) => {
		if (!rawDate) return "N/A";

		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		const parsedDate =
			typeof rawDate === "string" ? new Date(rawDate) : rawDate;
		return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
	};

	const handlePaginationChange = (pageIndex: number, pageSize: number) => {
		// Convert 0-based index to 1-based for API
		console.log("Pagination change:", pageIndex + 1, pageSize);
		fetchUsers(pageIndex + 1, pageSize);
	};

	const getFullName = (user: EndUser) => {
		return `${user.first_name} ${
			user.middle_name ? user.middle_name + " " : ""
		}${user.last_name}`.trim();
	};

	const getStatus = (user: EndUser) => {
		return user.is_active ? "active" : "inactive";
	};

	// Print ID Card function (unchanged - your existing code)
	const printIDCard = (user: EndUser) => {
		// Your existing printIDCard function remains the same
		const userFullName = getFullName(user);
		const userDOB = user.dob ? new Date(user.dob).toLocaleDateString() : "N/A";
		const today = new Date().toLocaleString();

		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			toast.error(
				"Could not open print window. Please check your pop-up blocker.",
			);
			return;
		}

		// Simple HTML content without complex image handling
		const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ID Card - ${user.membership_code}</title>
      <style>
        @page {
          size: 80mm 50mm;
          margin: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          font-size: 10px;
          background: white;
        }
        
        .id-card {
          width: 80mm;
          height: 50mm;
          border: 2px solid #000;
          border-radius: 5px;
          padding: 3mm;
          box-sizing: border-box;
          position: relative;
        }
        
        .header {
          text-align: center;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2mm;
          margin-bottom: 2mm;
        }
        
        .header h2 {
          margin: 0;
          font-size: 12px;
          color: #1e40af;
        }
        
        .header p {
          margin: 2px 0 0 0;
          font-size: 8px;
          color: #666;
        }
        
        .content {
          display: flex;
          gap: 3mm;
          margin: 2mm 0;
        }
        
        .photo-container {
          width: 25mm;
          height: 25mm;
          border: 1px solid #ccc;
          border-radius: 3mm;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          font-size: 9px;
          color: #666;
        }
        
        .photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 3mm;
        }
        
        .details {
          flex: 1;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 2px;
        }
        
        .label {
          font-weight: bold;
          width: 25mm;
          color: #333;
        }
        
        .value {
          flex: 1;
          color: #555;
          text-transform: capitalize;
        }
        
        .id-number {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #1e40af;
          font-size: 11px;
        }
        
        .status {
          display: inline-block;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: bold;
          font-size: 8px;
          ${
						user.is_active
							? "background: #10b981; color: white;"
							: "background: #ef4444; color: white;"
					}
        }
        
        .footer {
          border-top: 1px solid #ccc;
          padding-top: 2mm;
          margin-top: 2mm;
          text-align: center;
        }
        
        .barcode {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          background: #f5f5f5;
          padding: 2px 5px;
          border-radius: 3px;
          margin-bottom: 2px;
        }
        
        .print-info {
          font-size: 7px;
          color: #666;
          text-align: right;
          margin-top: 2mm;
        }
        
        /* Hide during screen view, show during print */
        @media screen {
          body {
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          
          .id-card {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        }
        
        @media print {
          body {
            background: white !important;
          }
          
          .id-card {
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="id-card">
        <div class="header">
          <h2>MEMBERSHIP ID CARD</h2>
          <p>Valid Until: 12/${new Date().getFullYear() + 1}</p>
        </div>
        
        <div class="content">
          <div class="photo-container">
            ${
							user.pic
								? `<img src="${user.pic}" alt="Photo" class="photo-img" onerror="this.style.display='none'; this.parentElement.innerHTML='No Photo Available'; this.parentElement.style.fontSize='9px'; this.parentElement.style.color='#666';">`
								: "No Photo Available"
						}
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Full Name:</span>
              <span class="value">${userFullName}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">ID Number:</span>
              <span class="value id-number">${user.membership_code}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Gender:</span>
              <span class="value">${user.gender}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date of Birth:</span>
              <span class="value">${userDOB}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status">${user.is_active ? "ACTIVE" : "INACTIVE"}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="barcode">${user.membership_code}</div>
          <div style="font-size: 7px; color: #666;">Issued: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="print-info">
          Printed: ${today}
        </div>
      </div>
      
      <script>
        // Auto-print after a short delay
        setTimeout(() => {
          window.print();
          
          // Close window after print
          setTimeout(() => {
            window.close();
          }, 500);
        }, 500);
      </script>
    </body>
    </html>
  `;

		printWindow.document.write(content);
		printWindow.document.close();
	};

	const columns: ColumnDef<EndUser>[] = [
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
			accessorKey: "membership_code",
			header: "User ID",
			cell: ({ row }) => {
				const membershipCode = row.getValue<string>("membership_code") || "N/A";
				return <span className="text-xs text-primary-6">{membershipCode}</span>;
			},
		},
		{
			accessorKey: "first_name",
			header: "Full Name",
			cell: ({ row }) => {
				const user = row.original;
				const fullName = getFullName(user);
				const pic = user.pic;
				return (
					<div className="flex flex-row justify-start items-center gap-2">
						<Image
							src={pic || "/images/avatar.png"}
							alt={fullName}
							width={30}
							height={30}
							className="w-8 h-8 rounded-full object-cover"
						/>
						<span className="text-xs text-primary-6 capitalize">
							{fullName}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => {
				const email = row.getValue<string>("email") || "N/A";
				return <span className="text-xs text-primary-6">{email}</span>;
			},
		},
		{
			accessorKey: "is_active",
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
				const user = row.original;
				const status = getStatus(user);
				return (
					<div className={`status ${status === "active" ? "green" : "red"}`}>
						{status}
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			header: "Joined Date",
			cell: ({ row }) => {
				const date = row.getValue<string>("created_at");
				return (
					<span className="text-xs text-primary-6">{formatDate(date)}</span>
				);
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const user = row.original;

				return (
					<div className="flex flex-row justify-start items-center gap-3">
						<Link href={`/beneficiary-management/${user.id}`}>
							<Button className="border border-[#E8E8E8] text-xs">
								View Details
							</Button>
						</Link>

						<Button
							className="border border-[#E8E8E8] text-xs"
							onClick={() => openEditModal(row)}>
							Edit
						</Button>

						<Button
							className="border border-[#E8E8E8] text-xs bg-blue-50 hover:bg-blue-100 text-blue-600"
							onClick={() => printIDCard(user)}>
							<Printer className="h-4 w-4 mr-1" />
							Print ID
						</Button>

						<Button
							className="border border-[#E8E8E8] text-xs"
							onClick={() => openDeleteModal(row)}>
							<IconTrash className="h-4 w-4" />
						</Button>
					</div>
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
					<EndUserDataTable
						columns={columns}
						data={tableData}
						onPaginationChange={handlePaginationChange}
						totalItems={serverPagination.total}
						currentPage={serverPagination.page - 1} // Convert to 0-based index for table
						totalPages={serverPagination.pages}
						pageSize={serverPagination.limit}
					/>
				</>
			)}

			{isEditModalOpen && (
				<Modal
					isOpen={isEditModalOpen}
					onClose={closeEditModal}
					title="Edit User">
					<div className="bg-white p-0 rounded-lg transition-transform ease-in-out form modal">
						<div className="mt-3 pt-2">
							<div className="flex flex-col gap-2">
								<p className="text-xs text-primary-6">First Name</p>
								<Input
									type="text"
									placeholder="Enter First Name"
									className="focus:border-none mt-2"
									value={editData.first_name}
									onChange={(e) =>
										setEditData({ ...editData, first_name: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Last Name</p>
								<Input
									type="text"
									placeholder="Enter Last Name"
									className="focus:border-none mt-2"
									value={editData.last_name}
									onChange={(e) =>
										setEditData({ ...editData, last_name: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Email Address</p>
								<Input
									type="email"
									placeholder="Enter Email Address"
									className="focus:border-none mt-2"
									value={editData.email}
									onChange={(e) =>
										setEditData({ ...editData, email: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Date of Birth</p>
								<Input
									type="date"
									placeholder="Enter Date of Birth"
									className="focus:border-none mt-2"
									value={editData.dob}
									onChange={(e) =>
										setEditData({ ...editData, dob: e.target.value })
									}
								/>
								<p className="text-xs text-primary-6 mt-2">Gender</p>
								<Select
									value={editData.gender}
									onValueChange={(value) =>
										setEditData({ ...editData, gender: value })
									}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent className="bg-white z-10 select text-gray-300">
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
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
									onClick={handleEditUser}
									disabled={isLoading}>
									{isLoading ? "Updating User..." : "Update User"}
								</Button>
							</div>
						</div>
					</div>
				</Modal>
			)}

			{isDeleteModalOpen && (
				<Modal onClose={closeDeleteModal} isOpen={isDeleteModalOpen}>
					<p>
						Are you sure you want to delete{" "}
						{selectedRow ? getFullName(selectedRow) : "this user"}'s account?
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
								if (selectedRow) {
									await deleteUser(selectedRow.id);
									closeDeleteModal();
								}
							}}>
							Yes, Confirm
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};

export default EndUserTable;
