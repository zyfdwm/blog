import { Client } from '@notionhq/client'

const notionToken = process.env.NOTION_TOKEN
const rawDatabaseId = process.env.NOTION_DATABASE_ID

if (!notionToken) {
    throw new Error('Missing NOTION_TOKEN in environment variables')
}

if (!rawDatabaseId) {
    throw new Error('Missing NOTION_DATABASE_ID in environment variables')
}

export const notion = new Client({
    auth: notionToken,
})

export const databaseId: string = rawDatabaseId