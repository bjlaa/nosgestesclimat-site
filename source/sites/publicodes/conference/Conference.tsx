import { usePersistingState } from 'Components/utils/persistState'
import QRCode from 'qrcode.react'
import { useContext, useEffect, useRef, useState } from 'react'
import emoji from 'react-easy-emoji'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { conferenceImg } from '../../../components/SessionBar'
import ShareButton from '../../../components/ShareButton'
import { ThemeColorsContext } from '../../../components/utils/colors'
import { ScrollToTop } from '../../../components/utils/Scroll'
import Stats from './Stats'
import UserList from './UserList'
import useYjs from './useYjs'
import {
	extremeThreshold,
	filterExtremes,
	generateRoomName,
	getExtremes,
	getRandomInt,
	stringToColour,
} from './utils'

export default () => {
	const [newRoom, setNewRoom] = useState(generateRoomName())
	const { room } = useParams()
	const [connectionType, setConnectionType] = useState('p2p')

	const { elements, extremes, users, username } = useYjs(room, connectionType)

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
			<Instructions
				{...{ room, newRoom, setNewRoom, connectionType, setConnectionType }}
			/>
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
const Instructions = ({
	room,
	newRoom,
	setNewRoom,
	connectionType,
	setConnectionType,
}) => {
	const { color } = useContext(ThemeColorsContext)
	const URLbase = `https://${window.location.hostname}`
	const URLPath = `/${
			{ p2p: 'conférence', database: 'sondage' }[connectionType]
		}/${room || newRoom}`,
		shareURL = URLbase + URLPath
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
				title={<span>{emoji('⏲️')} Choississez votre type de conférence</span>}
			>
				<div
					css={`
						display: flex;
						label {
							flex: auto;
						}
					`}
				>
					<label className="ui__ card box interactive">
						<input
							type="radio"
							name="connectionType"
							value="p2p"
							checked={connectionType === 'p2p'}
							onChange={(e) => setConnectionType(e.target.value)}
						/>
						Mode éphémère : parfait entre amis, ou pour une présentation
						intéractive lors d'une conférence. Les données restent entre vous
						(pair-à-pair), sans serveur.
					</label>
					<label className="ui__ card box interactive">
						<input
							type="radio"
							name="connectionType"
							value="database"
							checked={connectionType === 'database'}
							onChange={(e) => setConnectionType(e.target.value)}
						/>
						Mode sondage : les données sont stockées sur notre serveur, restent
						accessibles dans le temps. Si votre entreprise bride votre réseau
						interne, utilisez ce mode.
					</label>
				</div>
			</InstructionBlock>
			<InstructionBlock
				index="3"
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
				index="4"
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
				index="5"
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
				<InstructionBlock index="6" title="Prêt à démarrer ?">
					<p>
						<Link to={URLPath}>
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
