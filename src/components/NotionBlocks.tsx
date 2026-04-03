import React from 'react'

type RichTextItem = {
    plain_text?: string
    href?: string | null
    annotations?: {
        bold?: boolean
        italic?: boolean
        strikethrough?: boolean
        underline?: boolean
        code?: boolean
        color?: string
    }
}

type Block = any

function getColorClass(color?: string) {
    switch (color) {
        case 'gray':
            return 'notion-color-gray'
        case 'brown':
            return 'notion-color-brown'
        case 'orange':
            return 'notion-color-orange'
        case 'yellow':
            return 'notion-color-yellow'
        case 'green':
            return 'notion-color-green'
        case 'blue':
            return 'notion-color-blue'
        case 'purple':
            return 'notion-color-purple'
        case 'pink':
            return 'notion-color-pink'
        case 'red':
            return 'notion-color-red'
        case 'gray_background':
            return 'notion-bg-gray'
        case 'brown_background':
            return 'notion-bg-brown'
        case 'orange_background':
            return 'notion-bg-orange'
        case 'yellow_background':
            return 'notion-bg-yellow'
        case 'green_background':
            return 'notion-bg-green'
        case 'blue_background':
            return 'notion-bg-blue'
        case 'purple_background':
            return 'notion-bg-purple'
        case 'pink_background':
            return 'notion-bg-pink'
        case 'red_background':
            return 'notion-bg-red'
        default:
            return ''
    }
}

function renderRichText(richText: RichTextItem[] = []) {
    return richText.map((text, index) => {
        const content = text.plain_text || ''
        const colorClass = getColorClass(text.annotations?.color)

        let element: React.ReactNode = content

        if (text.annotations?.code) {
            element = <code>{element}</code>
        }
        if (text.annotations?.bold) {
            element = <strong>{element}</strong>
        }
        if (text.annotations?.italic) {
            element = <em>{element}</em>
        }
        if (text.annotations?.strikethrough) {
            element = <s>{element}</s>
        }
        if (text.annotations?.underline) {
            element = <u>{element}</u>
        }

        if (text.href) {
            element = (
                <a href={text.href} target="_blank" rel="noreferrer">
                    {element}
                </a>
            )
        }

        return (
            <span key={index} className={colorClass}>
                {element}
            </span>
        )
    })
}

function renderBlock(block: Block) {
    const { id, type } = block

    switch (type) {
        case 'paragraph':
            return (
                <p key={id}>
                    {renderRichText(block.paragraph?.rich_text)}
                </p>
            )

        case 'heading_1':
            return (
                <h1 key={id}>
                    {renderRichText(block.heading_1?.rich_text)}
                </h1>
            )

        case 'heading_2':
            return (
                <h2 key={id}>
                    {renderRichText(block.heading_2?.rich_text)}
                </h2>
            )

        case 'heading_3':
            return (
                <h3 key={id}>
                    {renderRichText(block.heading_3?.rich_text)}
                </h3>
            )

        case 'quote':
            return (
                <blockquote key={id}>
                    {renderRichText(block.quote?.rich_text)}
                </blockquote>
            )

        case 'code': {
            const codeText =
                block.code?.rich_text?.map((t: any) => t.plain_text).join('') || ''
            const language = block.code?.language || ''

            return (
                <pre key={id} data-language={language}>
                    <code>{codeText}</code>
                </pre>
            )
        }

        case 'divider':
            return <hr key={id} />

        case 'to_do':
            return (
                <div key={id} className="notion-todo">
                    <label>
                        <input
                            type="checkbox"
                            checked={block.to_do?.checked || false}
                            readOnly
                        />{' '}
                        <span>{renderRichText(block.to_do?.rich_text)}</span>
                    </label>
                </div>
            )

        case 'callout':
            return (
                <div key={id} className="notion-callout">
                    <div className="notion-callout-content">
                        {renderRichText(block.callout?.rich_text)}
                    </div>
                </div>
            )

        case 'image': {
            const image = block.image
            const isExternal = image?.type === 'external'
            const src = isExternal ? image.external?.url : ''

            const caption =
                image?.caption?.map((t: any) => t.plain_text).join('') || ''

            if (!src) {
                return (
                    <figure key={id} className="notion-image notion-image--missing">
                        <div className="notion-image__placeholder">
                            Gambar tidak tersedia. Gunakan external/public image URL.
                        </div>
                        {caption ? <figcaption>{caption}</figcaption> : null}
                    </figure>
                )
            }

            return (
                <figure key={id} className="notion-image">
                    <img src={src} alt={caption || 'Notion image'} />
                    {caption ? <figcaption>{caption}</figcaption> : null}
                </figure>
            )
        }

        case 'bulleted_list_item':
            return (
                <ul key={id} className="notion-list notion-list-ul">
                    <li>{renderRichText(block.bulleted_list_item?.rich_text)}</li>
                </ul>
            )

        case 'numbered_list_item':
            return (
                <ol key={id} className="notion-list notion-list-ol">
                    <li>{renderRichText(block.numbered_list_item?.rich_text)}</li>
                </ol>
            )

        default:
            return null
    }
}

export default function NotionBlocks({ blocks }: { blocks: Block[] }) {
    return (
        <div className="notion-blocks">
            {blocks.map((block) => renderBlock(block))}
        </div>
    )
}