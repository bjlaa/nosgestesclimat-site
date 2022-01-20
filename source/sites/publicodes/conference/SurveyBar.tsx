import { correctValue } from 'Components/publicodesUtils'
import { useEngine } from 'Components/utils/EngineContext'
import { usePersistingState } from 'Components/utils/persistState'
import { useEffect, useState } from 'react'
import emoji from 'react-easy-emoji'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { situationSelector } from 'Selectors/simulationSelectors'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'
import { useSimulationProgress } from '../../../components/utils/useNextQuestion'
import { extractCategories } from 'Components/publicodesUtils'
import { computeHumanMean } from './Stats'
import { filterExtremes } from './utils'
import { backgroundConferenceAnimation } from './conferenceStyle'
import { WebsocketProvider } from 'y-websocket'
import useYjs from './useYjs'
import useDatabase from './useDatabase'
import { minimalCategoryData } from '../../../components/publicodesUtils'

export default () => {
	const situation = useSelector(situationSelector),
		engine = useEngine(),
		evaluation = engine.evaluate('bilan'),
		{ nodeValue: rawNodeValue, dottedName, unit, rawNode } = evaluation
	const rules = useSelector((state) => state.rules)

	const progress = useSimulationProgress()

	const byCategory = minimalCategoryData(extractCategories(rules, engine))

	const nodeValue = correctValue({ nodeValue: rawNodeValue, unit })

	const database = useDatabase()

	const survey = useSelector((state) => state.survey)

	const [surveyIds, setSurveyIds] = usePersistingState('surveyIds', {})

	const data = { total: Math.round(nodeValue), progress, byCategory }

	useEffect(async () => {
		const cachedSurveyId = surveyIds[survey.room],
			payload = {
				sondage: survey.room,
				data,
				...(cachedSurveyId ? { id: cachedSurveyId } : {}),
			}
		const { data: requestData, error } = await database
			.from('réponses')
			.insert([payload], {
				upsert: true,
			})

		if (!error && !surveyIds[survey.room]) {
			const newSet = { ...surveyIds, [survey.room]: requestData[0].id }
			setSurveyIds(newSet)
		}
	}, [situation])

	const simulationArray = [],
		result = null && computeHumanMean(simulationArray.map((el) => el.total))

	const answersCount = null

	return (
		<Link to={'/sondage/' + survey.room} css="text-decoration: none;">
			<div
				css={`
					${backgroundConferenceAnimation}
					color: white;
					padding: 0.3rem 1rem;
					display: flex;
					justify-content: space-evenly;
					align-items: center;
					> span {
						display: flex;
						align-items: center;
					}
					img {
						font-size: 150%;
						margin-right: 0.4rem !important;
					}
					@media (min-width: 800px) {
						flex-direction: column;
						align-items: start;
						> * {
							margin: 0.3rem 0;
						}
					}
				`}
			>
				<span css="text-transform: uppercase">«&nbsp;{survey.room}&nbsp;»</span>
				{result && (
					<span>
						{emoji('🧮')} {result}
					</span>
				)}
				{answersCount && (
					<span>
						{emoji('👥')}{' '}
						<span
							css={`
								background: #78b159;
								width: 1.5rem;
								height: 1.5rem;
								border-radius: 2rem;
								display: inline-block;
								line-height: 1.5rem;
								text-align: center;
							`}
						>
							{answersCount}
						</span>
					</span>
				)}
			</div>
		</Link>
	)
}
