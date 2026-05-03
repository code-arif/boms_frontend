import Swal from "sweetalert2";

export function useConfirm() {
  const baseConfig = {
    confirmButtonColor: "#4F46E5",
    cancelButtonColor: "#6B7280",
    reverseButtons: true,
    customClass: {
      popup: "boms-swal-popup",
      confirmButton: "boms-swal-confirm",
      cancelButton: "boms-swal-cancel",
    },
  };

  async function confirm({
    title = "Are you sure?",
    text = "",
    confirmText = "Yes, proceed",
    cancelText = "Cancel",
    icon = "question",
  } = {}) {
    const result = await Swal.fire({
      ...baseConfig,
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
    return result.isConfirmed;
  }

  async function confirmDelete(itemName = "this item") {
    return confirm({
      title: `Delete ${itemName}?`,
      text: "This action cannot be undone.",
      confirmText: "Yes, delete it",
      cancelText: "Keep it",
      icon: "warning",
    });
  }

  async function confirmAction({
    title,
    text,
    confirmText = "Confirm",
    icon = "warning",
  } = {}) {
    return confirm({ title, text, confirmText, icon });
  }

  async function alert({ title, text, icon = "info" } = {}) {
    await Swal.fire({
      ...baseConfig,
      title,
      text,
      icon,
      showCancelButton: false,
      confirmButtonText: "OK",
    });
  }

  return { confirm, confirmDelete, confirmAction, alert };
}
