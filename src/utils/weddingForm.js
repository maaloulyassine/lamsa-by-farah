// Wedding-project form helpers shared by the setup screen and « Modifier mon projet ».
export const EMPTY_WEDDING_VALUES = { coupleName: '', weddingDate: '', governorateId: '', city: '', budget: '', guestCount: '', preparationStart: '' }

export function weddingToValues(wedding) {
  if (!wedding) return EMPTY_WEDDING_VALUES
  return {
    coupleName: wedding.couple_name || '',
    weddingDate: wedding.wedding_date || '',
    governorateId: wedding.governorate_id || '',
    city: wedding.city || '',
    budget: wedding.total_budget != null ? String(Number(wedding.total_budget)) : '',
    guestCount: wedding.guest_count != null ? String(wedding.guest_count) : '',
    preparationStart: wedding.preparation_start_date || '',
  }
}

// French validation mirroring the database checks; returns '' when valid.
export function validateWedding(values) {
  if (!values.coupleName.trim()) return 'Indiquez le nom du couple ou du projet.'
  if (!values.weddingDate) return 'Indiquez la date du mariage.'
  if (!values.governorateId) return 'Choisissez un gouvernorat.'
  if (!values.city.trim()) return 'Indiquez la ville.'
  if (values.budget === '' || Number.isNaN(Number(values.budget)) || Number(values.budget) < 0) return 'Le budget total doit être un montant positif.'
  if (values.guestCount !== '' && (!Number.isInteger(Number(values.guestCount)) || Number(values.guestCount) < 0)) return 'Le nombre d’invités doit être un nombre entier positif.'
  if (values.preparationStart && values.preparationStart > values.weddingDate) return 'La date de début des préparatifs doit précéder la date du mariage.'
  return ''
}

export function valuesToWeddingRow(values) {
  return {
    couple_name: values.coupleName.trim(),
    wedding_date: values.weddingDate,
    preparation_start_date: values.preparationStart || null,
    governorate_id: values.governorateId,
    city: values.city.trim(),
    guest_count: values.guestCount !== '' ? Number(values.guestCount) : null,
    total_budget: Number(values.budget),
  }
}
