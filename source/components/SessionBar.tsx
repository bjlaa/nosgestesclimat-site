import { goToQuestion, loadPreviousSimulation } from 'Actions/actions'
import { extractCategories } from 'Components/publicodesUtils'
import { useEngine } from 'Components/utils/EngineContext'
import { last } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { RootState } from 'Reducers/rootReducer'
import {
	answeredQuestionsSelector,
	objectifsSelector,
} from 'Selectors/simulationSelectors'
import styled from 'styled-components'
import CarbonImpact from '../sites/publicodes/CarbonImpact'
import ConferenceBarLazy from '../sites/publicodes/conference/ConferenceBarLazy'
import { backgroundConferenceAnimation } from '../sites/publicodes/conference/conferenceStyle'
import { Link } from 'react-router-dom'

const openmojis = {
	test: '25B6',
	action: 'E10C',
	conference: '1F3DF',
	profile: '1F464',
	personas: '1F465',
}
export const openmojiURL = (name) => `/images/${openmojis[name]}.svg`
export const actionImg = openmojiURL('action')
export const conferenceImg = openmojiURL('conference')

const Button = styled(Link)`
	margin: 0 0.2rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--darkColor);
	text-decoration: none;
	@media (min-width: 800px) {
		flex-direction: row;
		justify-content: start;
		padding: 0;
		font-size: 110%;
	}
	> img {
		display: block;
		font-size: 200%;
		margin: 0.6rem !important;
		@media (max-width: 800px) {
			margin: 0 !important;
		}
	}
`

export const sessionBarMargin = `
		@media (max-width: 800px) {
			margin-bottom: 10rem;
		}
`

export const buildEndURL = (rules, engine) => {
	const categories = extractCategories(rules, engine),
		detailsString =
			categories &&
			categories.reduce(
				(memo, next) =>
					memo +
					next.name[0] +
					(Math.round(next.nodeValue / 10) / 100).toFixed(2),
				''
			)

	if (detailsString == null) return null

	return `/fin?details=${detailsString}`
}

export const useSafePreviousSimulation = () => {
	const previousSimulation = useSelector(
		(state: RootState) => state.previousSimulation
	)

	const dispatch = useDispatch()
	const answeredQuestions = useSelector(answeredQuestionsSelector)
	const arePreviousAnswers = !!answeredQuestions.length
	useEffect(() => {
		if (!arePreviousAnswers && previousSimulation)
			dispatch(loadPreviousSimulation())
	}, [])
}

export default function SessionBar({
	answerButtonOnly = false,
	noResults = false,
}) {
	const dispatch = useDispatch()
	const answeredQuestions = useSelector(answeredQuestionsSelector)
	const arePreviousAnswers = !!answeredQuestions.length
	useSafePreviousSimulation()
	const [showAnswerModal, setShowAnswerModal] = useState(false)

	const objectifs = useSelector(objectifsSelector)
	const conference = useSelector((state) => state.conference)
	const rules = useSelector((state) => state.rules)
	const engine = useEngine(objectifs)

	const history = useHistory()
	const location = useLocation(),
		path = location.pathname

	const buttonStyle = (pathTarget) =>
		path.includes(pathTarget)
			? `
		font-weight: bold;
		img {
		  background: var(--lighterColor);
		  border-radius: .6rem;
		}
		`
			: ''

	let elements = [
		<Button
			className="simple small"
			to={'/simulateur/bilan'}
			onClick={() => {
				dispatch(goToQuestion(last(answeredQuestions)))
			}}
			css={buttonStyle('simulateur')}
		>
			<img src={openmojiURL('test')} css="width: 2rem" />
			Le test
		</Button>,
		<Button
			className="simple small"
			to="/actions/liste"
			css={buttonStyle('/actions')}
		>
			<img src={actionImg} css="width: 2rem" />
			Agir
		</Button>,
		<Button className="simple small" to="/profil" css={buttonStyle('profil')}>
			<img src={openmojiURL('profile')} css="width: 2rem" />
			Mon profil
		</Button>,
		NODE_ENV === 'development' && (
			<Button
				key="personas"
				className="simple small"
				to="/personas"
				css={buttonStyle('personas')}
			>
				<img src={openmojiURL('personas')} css="width: 2rem" />
				Personas
			</Button>
		),
		conference?.room && (
			<div
				css={`
					${backgroundConferenceAnimation}
					color: white;
					border-radius: 0.4rem;
					margin-right: 0.6rem;
				`}
			>
				<Button
					className="simple small"
					to={'/conférence/' + conference.room}
					css={`
						${buttonStyle('conf')}
						padding: 0.4rem;
						color: white;
						img {
							filter: invert(1);
							background: none;
							margin: 0 0.6rem 0 0 !important;
						}
						@media (max-width: 800px) {
							img {
								margin: 0 !important;
							}
						}
					`}
				>
					<img src={conferenceImg} css="width: 2rem" />
					Conférence
				</Button>
				<div
					css={`
						@media (max-width: 800px) {
							display: none;
						}
					`}
				>
					<ConferenceBarLazy />
				</div>
			</div>
		),
	]

	if (path === '/tutoriel') return null

	return (
		<div
			css={`
				margin: 1rem 0 2rem;

				@media (max-width: 800px) {
					margin: 0;
					position: fixed;
					bottom: 0;
					left: 0;
					z-index: 100;
					width: 100%;
				}
			`}
		>
			{elements.filter(Boolean).length > 0 && (
				<NavBar>
					{elements.filter(Boolean).map((Comp, i) => (
						<li key={i}>{Comp}</li>
					))}
				</NavBar>
			)}
		</div>
	)
}

const NavBar = styled.ul`
	display: flex;
	box-shadow: rgb(187 187 187) 2px 2px 10px;
	list-style-type: none;
	justify-content: space-evenly !important;
	align-items: center;
	height: 3.5rem;
	margin: 0;
	width: 100%;
	height: 4rem;
	background: white;
	justify-content: center;
	padding: 0;

	@media (min-width: 800px) {
		margin-top: 1rem;
		flex-direction: column;
		height: auto;
		background: none;
		justify-content: start;
		box-shadow: none;
		li {
			width: 100%;
		}
	}
`
