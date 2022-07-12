import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Worker from 'worker-loader!./SearchBar.worker.js'
import RuleLink from './RuleLink'
import './SearchBar.css'
import { EngineContext, useEngine } from './utils/EngineContext'
import { utils } from 'publicodes'
import highlightMatches from 'Components/highlightMatches'
import { Link } from 'react-router-dom'

const worker = new Worker()

type SearchItem = {
	title: string
	dottedName: Object
	espace: Array<string>
}

type Matches = Array<{
	key: string
	value: string
	indices: Array<[number, number]>
}>

export default function SearchBar({}: SearchBarProps) {
	const rules = useEngine().getParsedRules()
	const [input, setInput] = useState('')
	const [results, setResults] = useState<
		Array<{
			item: SearchItem
			matches: Matches
		}>
	>([])
	const { i18n } = useTranslation()

	const searchIndex: Array<SearchItem> = useMemo(
		() =>
			Object.values(rules)
				.filter(utils.ruleWithDedicatedDocumentationPage)
				.map((rule) => ({
					title:
						rule.title +
						(rule.rawNode.acronyme ? ` (${rule.rawNode.acronyme})` : ''),
					dottedName: rule.dottedName,
					espace: rule.dottedName.split(' . ').reverse(),
				})),
		[rules]
	)
	useEffect(() => {
		worker.postMessage({
			rules: searchIndex,
		})

		worker.onmessage = ({ data: results }) => setResults(results)
		return () => {
			worker.onmessage = null
		}
	}, [searchIndex, setResults])

	return (
		<>
			<label title="Entrez des mots clefs">
				<input
					type="search"
					className="ui__"
					value={input}
					placeholder={i18n.t('Entrez des mots clefs ici')}
					onChange={(e) => {
						const input = e.target.value
						if (input.length > 0) worker.postMessage({ input })
						setInput(input)
					}}
				/>
			</label>
			{!!input.length && !results.length ? (
				<p
					role="status"
					className="ui__ notice light-bg"
					css={`
						padding: 0.4rem;
						border-radius: 0.3rem;
						margin-top: 0.6rem;
					`}
				>
					<Trans i18nKey="noresults">
						Aucun résultat ne correspond à cette recherche
					</Trans>
				</p>
			) : (
				<ul
					css={`
						padding: 0;
						margin: 0;
						list-style: none;
					`}
				>
					{(!results.length && !input.length
						? searchIndex.map((item) => ({ item, matches: [] }))
						: results
					).map(({ item, matches }) => (
						<li key={item.dottedName}>
							<RuleLink
								dottedName={item.dottedName}
								style={{
									width: '100%',
									textDecoration: 'none',
									lineHeight: '1.5rem',
								}}
							>
								<small>
									{item.espace
										.slice(1)
										.reverse()
										.map((name) => (
											<span key={name}>
												{highlightMatches(
													name,
													matches.filter(
														(m) => m.key === 'espace' && m.value === name
													)
												)}{' '}
												›{' '}
											</span>
										))}
									<br />
								</small>
								{highlightMatches(
									item.title,
									matches.filter((m) => m.key === 'title')
								)}
							</RuleLink>
						</li>
					))}
				</ul>
			)}
		</>
	)
}
