import { RootState, Simulation } from 'Reducers/rootReducer'
import { DottedName } from 'Rules'

// Note: it is currently not possible to define SavedSimulation as the return
// type of the currentSimulationSelector function because the type would then
// circulary reference itself.
export type SavedSimulation = {
	situation: Simulation['situation']
	foldedSteps: Array<DottedName> | undefined
	actionChoices: Object
	persona: string
	tutorials: Object
	storedTrajets: Object
	url: string
}

export const currentSimulationSelector = (
	state: RootState
): SavedSimulation => {
	return {
		situation: state.simulation?.situation ?? {},
		foldedSteps: state.simulation?.foldedSteps,
		actionChoices: state.actionChoices,
		persona: state.simulation?.persona,
		tutorials: state.tutorials,
		storedTrajets: state.storedTrajets,
		url: state.simulation?.url,
	}
}

export const createStateFromSavedSimulation = (
	state: RootState
): Partial<RootState> => {
	const rules = state.rules

	if (!state.previousSimulation) return {}

	const safeFoldedSteps =
		state.previousSimulation.foldedSteps?.filter(
			(step) => rules[step] != null
		) || []

	return {
		simulation: {
			...state.simulation,
			situation: state.previousSimulation.situation || {},
			foldedSteps: safeFoldedSteps,
			persona: state.previousSimulation.persona,
		} as Simulation,
		previousSimulation: null,
	}
}
