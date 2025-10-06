import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const Modal = ({
	title,
	isOpen,
	onClose,
	children,
	className = "", // Added className prop with a default value
}: {
	title?: string;
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string; // Type definition for className
}) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
		} else {
			const timeout = setTimeout(() => setIsVisible(false), 100); // Matches the transition duration
			return () => clearTimeout(timeout);
		}
	}, [isOpen]);

	if (!isVisible) return null;

	if (!isOpen) return null;

	return (
		<div
			className={`modal-overlay overflow-y-auto p-1 ${
				isOpen ? "fade-in p-1" : "fade-out p-1"
			}`}
			onClick={onClose}>
			<div
				className={`modal-content p-1 border-[1px] border-primary-1 ${
					isOpen ? "slide-in" : "slide-out"
				} ${className}`} // Applied className here
				onClick={(e) => e.stopPropagation()}>
				<div className="flex flex-row justify-between items-center gap-20">
					<p className="text-sm text-dark-1 font-medium">{title}</p>
					<button onClick={onClose}>
						<IconX size={16} color="#28303F" />
					</button>
				</div>
				{children}
			</div>

			<style jsx>{`
				.modal-overlay {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: rgba(0, 0, 0, 0.5);
					display: flex;
					justify-content: center;
					align-items: center;
					transition: opacity 0.8s ease-in-out;
					z-index: 100;
				}
				.modal-content {
					background: #fff;
					padding: 2rem;
					border-radius: 8px;
					position: relative;
					max-width: 100%;
					transition: transform 0.8s ease-in-out, opacity 0.8s ease-in-out;
				}
				.fade-in {
					opacity: 1;
				}
				.fade-out {
					opacity: 0;
					transition: transform 0.8s ease-in-out, opacity 0.8s ease-in-out;
				}
			`}</style>
		</div>
	);
};

export default Modal;
