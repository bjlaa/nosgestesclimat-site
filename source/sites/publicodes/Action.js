import { setSimulationConfig } from 'Actions/actions'
import { splitName } from 'Components/publicodesUtils'
import Simulation from 'Components/Simulation'
import { Markdown } from 'Components/utils/markdown'
import { ScrollToTop } from 'Components/utils/Scroll'
import { useNextQuestions } from 'Components/utils/useNextQuestion'
import { utils } from 'publicodes'
import React, { useContext, useEffect } from 'react'
import emoji from 'react-easy-emoji'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { parentName } from '../../components/publicodesUtils'
import { EngineContext } from '../../components/utils/EngineContext'
import Meta from '../../components/utils/Meta'
import { questionConfig } from './questionConfig'

const { decodeRuleName, encodeRuleName } = utils

export default ({}) => {
	const encodedName = useParams()['*']

	const rules = useSelector((state) => state.rules)
	const nextQuestions = useNextQuestions()
	const dottedName = decodeRuleName(encodedName)
	const configSet = useSelector((state) => state.simulation?.config)

	// TODO here we need to apply a rustine to accommodate for this issue
	// https://github.com/betagouv/mon-entreprise/issues/1316#issuecomment-758833973
	// to be continued...
	const actionParent = parentName(dottedName)
	const config = {
		objectifs: [dottedName],
		situation: { ...(configSet?.situation || {}) },
		questions: questionConfig,
	}

	const engine = useContext(EngineContext)

	const dispatch = useDispatch()
	useEffect(() => {
		dispatch(setSimulationConfig(config))
	}, [encodedName])
	if (!configSet) return null

	const evaluation = engine.evaluate(dottedName),
		{ nodeValue, title } = evaluation

	const { description, icônes: icons, plus } = rules[dottedName]

	const flatActions = rules['actions']
	const relatedActions = flatActions.formule.somme
		.filter(
			(actionDottedName) =>
				actionDottedName !== dottedName &&
				splitName(dottedName)[0] === splitName(actionDottedName)[0]
		)
		.map((name) => engine.getRule(name))

	return (
		<div
			css={`
				padding: 0 0.3rem 1rem;
				max-width: 600px;
				margin: 1rem auto;
			`}
		>
			<Meta title={'Action : ' + title} description={description} />
			<ScrollToTop />
			<Link to="/actions/liste">
				<button className="ui__ button simple small ">
					{emoji('◀')} Retour à la liste
				</button>
			</Link>
			<div className="ui__ card" css={'padding: .1rem; margin: .8rem 0'}>
				<header
					css={`
						margin-bottom: 1rem;
						h1 {
							font-size: 180%;
							margin: 0.6rem 0;
						}
						h1 > span {
							margin-right: 1rem;
						}
					`}
				>
					<h2>
						{icons && <span>{emoji(icons)}</span>}
						{title}
					</h2>
				</header>
				<div css="margin: 1.6rem 0">
					<Markdown children={description} />
					<div css="display: flex; flex-wrap: wrap; justify-content: space-evenly; margin-top: 1rem">
						<Link to={'/documentation/' + encodedName}>
							<button className="ui__ button small">
								{emoji('⚙️')} Comprendre le calcul
							</button>
						</Link>
						{plus && (
							<Link to={'/actions/plus/' + encodedName}>
								<button className="ui__ button small">
									{emoji('📘')} En savoir plus
								</button>
							</Link>
						)}
					</div>
				</div>
			</div>
			{nextQuestions.length > 0 && (
				<>
					<h3>Personnalisez cette estimation</h3>
					<Simulation
						noFeedback
						showConversation
						customEnd={<div />}
						targets={<div />}
						explanations={null}
						questionHeadingLevel="4"
					/>
				</>
			)}
			{relatedActions && (
				<>
					<h3>Sur le même sujet</h3>
					<div>
						{relatedActions.map((action) => (
							<Link
								to={'/actions/' + encodeRuleName(action.dottedName)}
								css="> button {margin: .3rem .6rem}"
							>
								<button className="ui__ small button">{action.title}</button>
							</Link>
						))}
					</div>
				</>
			)}
		</div>
	)
}
