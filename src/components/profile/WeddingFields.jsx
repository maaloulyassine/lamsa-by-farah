// Wedding project fields shared by the first-run setup screen and « Modifier mon projet ».
// Controlled: `values` holds strings, `onChange(field, value)` updates one field.
export function WeddingFields({ values, onChange, governorates }) {
  const set = (field) => (event) => onChange(field, event.target.value)
  return (
    <>
      <label>Nom du couple ou du projet<input value={values.coupleName} onChange={set('coupleName')} required /></label>
      <label>Date du mariage<input type="date" value={values.weddingDate} onChange={set('weddingDate')} required /></label>
      <label>Gouvernorat
        <select value={values.governorateId} onChange={set('governorateId')} required>
          <option value="">Sélectionner</option>
          {governorates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>Ville<input value={values.city} onChange={set('city')} required /></label>
      <label>Budget total (TND)<input type="number" min="0" step="0.01" value={values.budget} onChange={set('budget')} required /></label>
      <label>Nombre d’invités<input type="number" min="0" step="1" value={values.guestCount} onChange={set('guestCount')} /></label>
      <label>Date de début des préparatifs<input type="date" value={values.preparationStart} onChange={set('preparationStart')} /></label>
    </>
  )
}
