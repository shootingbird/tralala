interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

export const ConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onCancel} />
            <div className="fixed left-1/2 bottom-0 md:bottom-auto md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-[100%] md:w-[400px] bg-white rounded-t-2xl md:rounded-2xl pb-[2rem] md:pb-6 p-6 z-50">
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 px-4 bg-[#184193] text-white rounded-xl hover:bg-[#184193]/90"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </>
    );
};