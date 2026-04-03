import { Client } from '@notionhq/client'

const notionToken = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

if (!notionToken) {
    throw new Error('Missing NOTION_TOKEN in environment variables')
}

if (!databaseId) {
    throw new Error('Missing NOTION_DATABASE_ID in environment variables')
}

export const notion = new Client({
    auth: notionToken,
})

export { databaseId }