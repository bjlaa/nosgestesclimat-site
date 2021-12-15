import { usePersistingState } from 'Components/utils/persistState'
import QRCode from 'qrcode.react'
import { useContext, useEffect, useRef, useState } from 'react'
import emoji from 'react-easy-emoji'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { conferenceImg } from '../../../components/SessionBar'
import ShareButton from '../../../components/ShareButton'
import { ThemeColorsContext } from '../../../components/utils/colors'
import { ScrollToTop } from '../../../components/utils/Scroll'
import fruits from './fruits.json'
import Stats from './Stats'
import UserList from './UserList'
import {
	extremeThreshold,
	filterExtremes,
	generateRoomName,
	getExtremes,
	getRandomInt,
	stringToColour,
} from './utils'

export default () => {
	const [rawElements, setElements] = useState([])
	const [users, setUsers] = useState([])
	const [newRoom, setNewRoom] = useState(generateRoomName())
	const { room } = useParams()
	const [username, setUsername] = usePersistingState(
		'pseudo',
		fruits[getRandomInt(fruits.length)]
	)

	const dispatch = useDispatch()

	const conference = useSelector((state) => state.conference)

	useEffect(() => {
		if (!conference) {
			const ydoc = new Y.Doc()
			const provider = new WebsocketProvider(
				'ws://ngc.cleverapps.io:8080',
				room,
				ydoc
			)
			provider.on('status', (event) => {
				console.log(event.status) // logs "connected" or "disconnected"
			})

			dispatch({ type: 'SET_CONFERENCE', room, ydoc, provider })
		} else {
			const { room } = conference

			const ydoc = conference.ydoc,
				provider = conference.provider

			const awareness = provider.awareness

			setUsers(Array.from(awareness.getStates().values()))

			// You can observe when a any user updated their awareness information
			awareness.on('change', (changes) => {
				// Whenever somebody updates their awareness information,
				// we log all awareness information from all users.
				setUsers(Array.from(awareness.getStates().values()))
			})

			awareness.setLocalState({
				// Define a print name that should be displayed
				name: username,
				// Define a color that should be associated to the user:
				color: stringToColour(username), // should be a hex color
			})
			const simulations = conference.ydoc.get('simulations', Y.Map)
			setElements(simulations.toJSON())
			simulations.observe((event) => {
				console.log('did observe from Conf', event)
				setElements(simulations.toJSON())
			})
		}
	}, [room, conference])

	const elements = filterExtremes(rawElements),
		extremes = getExtremes(rawElements)

	return (
		<div>
			{room && <ScrollToTop />}
			<h1>
				Conférence
				<span
					css={`
						margin-left: 1rem;
						background: var(--color);
						color: var(--textColor);
						padding: 0.1rem 0.4rem;
						border-radius: 0.6rem;
					`}
				>
					beta
				</span>
			</h1>
			<h2
				css={`
					margin-top: 0.6rem;
					@media (min-width: 800px) {
						display: none;
					}
					> img {
						width: 4rem;
					}
					display: flex;
					align-items: center;
					font-size: 120%;
				`}
			>
				<img src={conferenceImg} />
				<span css="text-transform: uppercase">«&nbsp;{room}&nbsp;»</span>
			</h2>
			<Stats {...{ elements, users, username }} />

			{room && (
				<div>
					<UserBlock {...{ users, extremes, username, room }} />
				</div>
			)}
			<Instructions {...{ room, newRoom, setNewRoom }} />
			<h2>Et mes données ?</h2>
			<p>
				{emoji('🕵 ')}En participant, vous acceptez de partager vos résultats
				agrégés de simulation avec les autres participants de la conférence : le
				total et les catégories (transport, logement, etc.). En revanche, nos
				serveurs ne les stockent pas : cela fonctionne en P2P (pair à pair).
			</p>
			<p>
				Seul le nom de la salle de conférence sera indexé dans{' '}
				<a href="https://nosgestesclimat.fr/vie-privée">
					les statistiques d'utilisation
				</a>{' '}
				de Nos Gestes Climat.{' '}
			</p>
		</div>
	)
}

const NamingBlock = ({ newRoom, setNewRoom }) => {
	const inputRef = useRef(null)
	return (
		<>
			<label>
				<form>
					<input
						value={newRoom}
						className="ui__"
						onChange={(e) => setNewRoom(e.target.value)}
						css="width: 80% !important"
						ref={inputRef}
					/>
					<button
						onClick={(e) => {
							setNewRoom('')
							inputRef.current.focus()
							e.preventDefault()
						}}
						title="Effacer le nom actuel"
					>
						{emoji('❌')}
					</button>
				</form>
			</label>

			<button
				onClick={() => setNewRoom(generateRoomName())}
				className="ui__ dashed-button"
			>
				{emoji('🔃')} Générer un autre nom
			</button>
			<p>
				<em>
					{emoji('🕵️‍♀️')} Le nom apparaitra dans nos{' '}
					<a href="https://nosgestesclimat.fr/vie-privée">stats</a>.
				</em>
			</p>

			{newRoom && newRoom.length < 10 && (
				<p>
					⚠️ Votre nom de salle est court, vous risquez de vous retrouver avec
					des inconnus...
				</p>
			)}
		</>
	)
}

const UserBlock = ({ extremes, users, username, room }) => (
	<div>
		<h2 css="display: inline-block ;margin-right: 1rem">
			{emoji('👤 ')}
			Qui est connecté ?
		</h2>
		<span css="color: #78b159; font-weight: bold">
			{emoji('🟢')} {users.length} participant{plural(users)}
		</span>
		<UserList users={users} username={username} extremes={extremes} />
		{extremes.length > 0 && (
			<div>
				{emoji('⚠️')} Certains utilisateurs ont des bilans au-dessus de{' '}
				{extremeThreshold / 1000} t, nous les avons exclus.
			</div>
		)}
	</div>
)

const InstructionBlock = ({ title, index, children }) => (
	<div
		className="ui__ card"
		css={`
			display: flex;
			justify-content: start;
			align-items: center;
			margin: 1rem;
			padding-bottom: 0.6rem;
			@media (max-width: 800px) {
				flex-direction: column;
			}
		`}
	>
		<div
			css={`
				font-size: 300%;
				padding: 1rem;
				background: var(--lighterColor);
				border-radius: 5rem;
				margin: 0 1rem;
			`}
		>
			{index}
		</div>
		<div>
			<h3>{title}</h3>
			{children}
		</div>
	</div>
)
const Instructions = ({ room, newRoom, setNewRoom }) => {
	const { color } = useContext(ThemeColorsContext)
	const shareURL =
		'https://' + window.location.hostname + '/conférence/' + (room || newRoom)
	return (
		<div>
			{!room && <p>Faites le test à plusieurs ! </p>}
			<h2>Comment ça marche ?</h2>
			<InstructionBlock
				index="1"
				title={
					<span>
						{emoji('💡 ')} Choisissez un nom de salle pour lancer une conf
					</span>
				}
			>
				{!room && <NamingBlock {...{ newRoom, setNewRoom }} />}
				{room && <p>{emoji('✅')} C'est fait</p>}
			</InstructionBlock>
			<InstructionBlock
				index="2"
				title={
					<span>
						{emoji('🔗 ')} Partagez le lien à vos amis, collègues, etc.
					</span>
				}
			>
				{!newRoom && !room ? (
					<p>Choississez d'abord un nom</p>
				) : (
					<div
						css={`
							display: flex;
							flex-wrap: wrap;
							justify-content: center;
							align-items: center;
						`}
					>
						<QRCode
							value={shareURL}
							size={200}
							bgColor={'#ffffff'}
							fgColor={color}
							level={'L'}
							includeMargin={false}
							renderAs={'canvas'}
						/>
						<ShareButton
							text="Faites un test d'empreinte climat avec moi"
							url={shareURL}
							title={'Nos Gestes Climat Conférence'}
						/>
					</div>
				)}
			</InstructionBlock>
			<InstructionBlock
				index="3"
				title={
					<span>{emoji('👆 ')} Faites toutes et tous votre simulation</span>
				}
			>
				{room ? (
					<Link to={'/simulateur/bilan'}>
						<button className="ui__ button plain">Faites votre test </button>
					</Link>
				) : (
					<p>
						Au moment convenu, ouvrez ce lien tous en même temps et
						commencez&nbsp; votre simulation.
					</p>
				)}
			</InstructionBlock>
			<InstructionBlock
				index="4"
				title={
					<span>
						{emoji('🧮 ')}Visualisez ensemble les résultats de votre groupe
					</span>
				}
			>
				Les résultats pour chaque catégorie (alimentation, transport, logement
				...) s'affichent progressivement et en temps réel pour l'ensemble du
				groupe.
			</InstructionBlock>
			{newRoom !== '' && !room && (
				<InstructionBlock index="5" title="Prêt à démarrer ?">
					<p>
						<Link to={'/conférence/' + newRoom}>
							<button type="submit" className="ui__ button plain">
								C'est parti !{' '}
							</button>
						</Link>
					</p>
				</InstructionBlock>
			)}
		</div>
	)
}

const plural = (list) => (list.length > 1 ? 's' : '')
