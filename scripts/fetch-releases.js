// This script uses the GitHub API which requires an access token.
// https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line
// Once you have your access token you can put it in a `.env` file at the root
// of the project to enable it during development. For instance:
//
// GITHUB_API_SECRET=f4336c82cb1e494752d06e610614eab12b65f1d1
//
// If you want to fetch unpublished "draft" release, you should check the
// "public repo" authorization when generating the access token.
require('dotenv').config()
require('isomorphic-fetch')
const path = require('path')
const { writeFileSync } = require('fs')
var { createDataDir, writeInDataDir } = require('./utils.js')
const { writeJSON } = require('../nosgestesclimat/scripts/i18n/utils.js')

const repository = 'nosgestesclimat',
	organization = 'datagir'

const localPath = path.resolve('source/locales/releases/releases-fr.json')

// In case we cannot fetch the release (the API is down or the Authorization
// token isn't valid) we fallback to some fake data -- it would be better to
// have a static ressource accessible without authentification.
const fakeData = [
	{
		name: 'Fake release',
		descriptionHTML: `You are seing this fake release because you
	didn't configure your GitHub access token and we weren't
	able to fetch the real releases from GitHub.<br /><br />
	See the script <pre>fetch-releases.js</pre> for more informations.`,
	},
	{
		name: 'Release 2',
		descriptionHTML: 'blah blah blah',
	},
	{
		name: 'Release 3',
		descriptionHTML: 'blah blah blah',
	},
]

async function main() {
	createDataDir()
	const releases = await fetchReleases()
	// The last release name is fetched on all pages (to display the banner)
	// whereas the full release data is used only in the dedicated page, that why
	// we deduplicate the releases data in two separated files that can be
	// bundled/fetched separately.
	writeJSON(localPath, releases)
	console.log(`Wrote ${releases.length} releases in ${localPath}`)
	const last = releases[0]
	writeInDataDir('last-release.json', {
		name: last.name,
		date: last.published_at,
	})
	console.log(`Wrote last release in ${localPath}`)
}

async function fetchReleases() {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${organization}/${repository}/releases`
		)
		const data = await response.json()
		return data.filter(Boolean)
	} catch (e) {
		console.log(e)
		return []
	}
}

main()
