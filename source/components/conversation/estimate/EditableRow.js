import { range } from '../../../utils'
import { freqList, motifList } from './dataHelp'

export default function EditableRow({
	editFormData,
	setEditFormData,
	openmojiURL,
	handleEditFormSubmit,
}) {
	const handleEditFormChange = (event) => {
		event.preventDefault()

		const fieldName = event.target.getAttribute('name')
		const fieldValue = event.target.value

		const newFormData = { ...editFormData, [fieldName]: fieldValue }

		setEditFormData(newFormData)
	}

	return (
		<tr
			css={`
				select,
				input {
					margin-bottom: 0rem;
					height: 2rem;
				}
			`}
		>
			<td>
				<select
					name="motif"
					className="ui__"
					value={editFormData.motif}
					onChange={handleEditFormChange}
				>
					{motifList.map((m) => (
						<option key={m.id} value={m.name}>
							{m.name}
						</option>
					))}
				</select>
			</td>
			<td>
				<input
					name="label"
					type="text"
					className="ui__"
					placeholder="Trajet (Optionnel)"
					value={editFormData.label}
					onChange={handleEditFormChange}
				/>
			</td>
			<td>
				<input
					name="distance"
					className="ui__"
					type="number"
					required
					value={editFormData.distance}
					onChange={handleEditFormChange}
				/>
			</td>
			<td>
				<select
					className="ui__"
					name="xfois"
					value={editFormData.xfois}
					onChange={handleEditFormChange}
					required
				>
					{range(1, 10).map((v) => (
						<option key={v} value={v}>
							{v}
						</option>
					))}
				</select>
				<strong> &nbsp; x / </strong>
				<select
					className="ui__"
					name="periode"
					value={editFormData.periode}
					onChange={handleEditFormChange}
					required
				>
					{freqList.map((f) => (
						<option key={f.id} value={f.name}>
							{f.name}
						</option>
					))}
				</select>
			</td>
			<td>
				<input
					name="personnes"
					className="ui__"
					type="number"
					required
					placeholder="Nombre de personnes"
					value={editFormData.personnes}
					onChange={handleEditFormChange}
				/>
			</td>
			<td
				css={`
					> button {
						padding: 0.4rem;
					}
				`}
			>
				<button
					type="submit"
					form="tableTrajets"
					onClick={(e) => {
						handleEditFormSubmit(e)
					}}
				>
					<img src={openmojiURL('sauvegarder')} css="width: 1.7rem" />
				</button>
			</td>
		</tr>
	)
}
