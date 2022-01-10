import { humanWeight } from '../HumanWeight'

export default ({ categories, maxCategory, spotlight }) => {
	const values = Object.values(categories)
			.flat()
			.map(({ username, value }) => value),
		min = Math.min(...values),
		max = Math.max(...values),
		humanMax = humanWeight(max, true)

	console.log(categories)
	return (
		<div>
			<ul
				css={`
					padding-left: 0;
					> li:nth-child(2n + 1) {
						background: var(--lightestColor);
					}
					list-style-type: none;
					li > span {
						padding-left: 0.6rem;
						width: 30%;
						display: inline-block;
						border-right: 1px solid var(--lightColor);
					}

					ul {
						list-style-type: none;
						display: inline-block;
						position: relative;
						width: 65%;
					}
					ul li {
						position: absolute;
						width: 8px;
						height: 8px;
						display: inline-block;
						background: black;
						border-radius: 1rem;
						opacity: 0.2;
					}
				`}
			>
				{Object.entries(categories).map(([name, values]) => (
					<li key={name}>
						<span>{name}</span>
						<ul>
							{values.map(({ username, value }) => (
								<li
									key={value}
									css={`
										left: ${(value / maxCategory) * 100}%;
										${spotlight === username
											? `background: yellow !important; opacity: 1 !important; z-index: 2; border: 2px solid black; width: 10px !important`
											: ''}
									`}
								></li>
							))}
						</ul>
					</li>
				))}
			</ul>
			<div css="width: 70%; margin-left: 32%;  display: flex; justify-content: space-between">
				<small>{Math.round(0)}</small>
				<small>
					{humanMax[0]} {humanMax[1]}
				</small>
			</div>
		</div>
	)
}
