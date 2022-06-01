import styled from 'styled-components'
import twemoji from 'twemoji'
import emojiRegex from 'emoji-regex'

// This file looks like a gaz factory, as we say in french. Feel free to rewrite it

// Here text should be limited to emojis. Nothing else

export const getEmojiComponents = (text, title) => {
	const attributesCallback = () => {
		return {
			'aria-label': title ? title : '',
			'aria-hidden': title ? 'false' : 'true',
		}
	}
	const parts = twemoji
		.parse(text, {
			attributes: attributesCallback,
			folder: 'svg',
			ext: '.svg',
		})
		.split('<img')
		.map((el) => el && '<img' + el)
		.filter(Boolean)
	return parts.map((part) => (
		<EmojiStyle
			dangerouslySetInnerHTML={{
				__html: part,
			}}
		/>
	))
}

// Here text can include emojis and text
export const Twemoji = ({ text, label }) => {
	const attributesCallback = () => {
		return {
			'aria-label': label ? label : '',
			'aria-hidden': label ? 'false' : 'true',
		}
	}
	if (containEmoji(text)) {
		const parsed = twemoji.parse(text, {
			attributes: attributesCallback,
			folder: 'svg',
			ext: '.svg',
		})
		return (
			<EmojiStyle
				dangerouslySetInnerHTML={{
					__html: parsed,
				}}
			/>
		)
	} else {
		return text
	}
}

export default (text, label) => {
	return <Twemoji text={text} label={label} />
}

const EmojiStyle = styled.span`
	img {
		height: 1em;
		width: auto;
		margin: 0 0.2rem;
		vertical-align: -0.125em;
	}
`

export const containEmoji = (text) => {
	const regex = emojiRegex()
	return regex.test(text)
}
