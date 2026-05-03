import Swal from 'sweetalert2'

export function useConfirm() {
  async function confirm({
    title   = 'Are you sure?',
    text    = '',
    confirmText = 'Yes, proceed',
    cancelText  = 'Cancel',
    type    = 'warning',
  } = {}) {
    const result = await Swal.fire({
      title,
      text,
      icon: type,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText:  cancelText,
      confirmButtonColor: '#5C6AC4',
      cancelButtonColor:  '#6c757d',
      customClass: { popup: 'rounded-4 shadow' },
    })
    return result.isConfirmed
  }

  async function confirmDelete(itemName = 'this item') {
    return confirm({
      title:       'Delete ' + itemName + '?',
      text:        'This action cannot be undone.',
      confirmText: 'Yes, delete',
      type:        'danger',
    })
  }

  return { confirm, confirmDelete }
}