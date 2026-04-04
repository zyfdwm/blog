'use client'

import React, { useState } from 'react'

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
    equation?: {
        expression?: string
    }
    text?: {
        content?: string
        link?: {
            url?: string
        } | null
    }
    mention?: any
    type?: string
}

type Block = any

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
}

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

function getRichTextContent(text: RichTextItem) {
    if (text.type === 'equation') {
        return text.equation?.expression || ''
    }

    if (text.type === 'mention') {
        return text.plain_text || ''
    }

    return text.plain_text || text.text?.content || ''
}

function getRichTextHref(text: RichTextItem) {
    return text.href || text.text?.link?.url || null
}

function getPlainText(richText: RichTextItem[] = []) {
    return richText.map((text) => getRichTextContent(text)).join('')
}

function renderRichText(richText: RichTextItem[] = []) {
    return richText.map((text, index) => {
        const content = getRichTextContent(text)
        const href = getRichTextHref(text)
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

        if (href) {
            element = (
                <a href={href} target="_blank" rel="noreferrer">
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

function getBlockChildren(block: Block): Block[] {
    return block.children || []
}

function getHeadingsFromBlocks(blocks: Block[]) {
    const headings: { id: string; text: string; level: number }[] = []

    function walk(blockList: Block[]) {
        for (const block of blockList) {
            if (
                block.type === 'heading_1' ||
                block.type === 'heading_2' ||
                block.type === 'heading_3'
            ) {
                const richText = block[block.type]?.rich_text || []
                const text = getPlainText(richText)

                if (text.trim()) {
                    headings.push({
                        id: slugify(text),
                        text,
                        level:
                            block.type === 'heading_1'
                                ? 1
                                : block.type === 'heading_2'
                                    ? 2
                                    : 3,
                    })
                }
            }

            if (block.children?.length) {
                walk(block.children)
            }
        }
    }

    walk(blocks)
    return headings
}

function renderCalloutIcon(block: Block) {
    const icon = block.callout?.icon
    if (!icon) return null

    if (icon.type === 'emoji') {
        return <span className="notion-callout-icon">{icon.emoji}</span>
    }

    if (icon.type === 'external') {
        return (
            <img
                className="notion-callout-icon-image"
                src={icon.external?.url}
                alt="Callout icon"
            />
        )
    }

    if (icon.type === 'file') {
        return (
            <img
                className="notion-callout-icon-image"
                src={icon.file?.url}
                alt="Callout icon"
            />
        )
    }

    return null
}

function renderFileLikeBlock(
    key: string,
    label: string,
    fileData: any,
    caption?: any[]
) {
    const src =
        fileData?.type === 'external'
            ? fileData.external?.url
            : fileData?.type === 'file'
                ? fileData.file?.url
                : ''

    const text = caption?.map((t: any) => t.plain_text).join('') || label

    if (!src) return null

    return (
        <div key={key} className="notion-file-block">
            <a href={src} target="_blank" rel="noreferrer" className="notion-file-link">
                {text}
            </a>
        </div>
    )
}

function renderTable(block: Block) {
    const rows = getBlockChildren(block)

    if (!rows.length) return null

    return (
        <div className="notion-table-wrapper">
            <table className="notion-table">
                <tbody>
                    {rows.map((row: any) => {
                        const cells = row.table_row?.cells || []
                        return (
                            <tr key={row.id}>
                                {cells.map((cell: any[], cellIndex: number) => (
                                    <td key={cellIndex}>{renderRichText(cell)}</td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

function renderList(blocks: Block[], ordered: boolean) {
    const ListTag = ordered ? 'ol' : 'ul'
    const listClass = ordered ? 'notion-list-ol' : 'notion-list-ul'

    return (
        <ListTag className={`notion-list ${listClass}`}>
            {blocks.map((block) => {
                const richText = ordered
                    ? block.numbered_list_item?.rich_text
                    : block.bulleted_list_item?.rich_text

                return (
                    <li key={block.id}>
                        <div>{renderRichText(richText)}</div>
                        {block.children?.length ? (
                            <div className="notion-children">
                                <NotionBlocks blocks={block.children} />
                            </div>
                        ) : null}
                    </li>
                )
            })}
        </ListTag>
    )
}

export default function NotionBlocks({ blocks }: { blocks: Block[] }) {
    const [lightboxImage, setLightboxImage] = useState<{
        src: string
        alt?: string
    } | null>(null)

    const openImage = (src: string, alt?: string) => {
        setLightboxImage({ src, alt })
    }

    const closeImage = () => {
        setLightboxImage(null)
    }

    function renderChildren(block: Block) {
        const children = getBlockChildren(block)
        if (!children.length) return null

        return (
            <div className="notion-children">
                <NotionBlocks blocks={children} />
            </div>
        )
    }

    function renderSingleBlock(block: Block, allBlocks: Block[]) {
        const { id, type } = block

        switch (type) {
            case 'paragraph':
                return (
                    <div key={id} className="notion-block notion-paragraph">
                        <p>{renderRichText(block.paragraph?.rich_text)}</p>
                        {renderChildren(block)}
                    </div>
                )

            case 'heading_1': {
                const richText = block.heading_1?.rich_text || []
                const text = getPlainText(richText)
                const headingId = slugify(text)

                return (
                    <div key={id} className="notion-block notion-heading">
                        <h1 id={headingId}>{renderRichText(richText)}</h1>
                        {renderChildren(block)}
                    </div>
                )
            }

            case 'heading_2': {
                const richText = block.heading_2?.rich_text || []
                const text = getPlainText(richText)
                const headingId = slugify(text)

                return (
                    <div key={id} className="notion-block notion-heading">
                        <h2 id={headingId}>{renderRichText(richText)}</h2>
                        {renderChildren(block)}
                    </div>
                )
            }

            case 'heading_3': {
                const richText = block.heading_3?.rich_text || []
                const text = getPlainText(richText)
                const headingId = slugify(text)

                return (
                    <div key={id} className="notion-block notion-heading">
                        <h3 id={headingId}>{renderRichText(richText)}</h3>
                        {renderChildren(block)}
                    </div>
                )
            }

            case 'quote':
                return (
                    <div key={id} className="notion-block notion-quote">
                        <blockquote>{renderRichText(block.quote?.rich_text)}</blockquote>
                        {renderChildren(block)}
                    </div>
                )

            case 'code': {
                const codeText =
                    block.code?.rich_text?.map((t: any) => getRichTextContent(t)).join('') || ''
                const language = block.code?.language || ''

                return (
                    <div key={id} className="notion-block notion-code-block">
                        <pre data-language={language}>
                            <code>{codeText}</code>
                        </pre>
                        {renderChildren(block)}
                    </div>
                )
            }

            case 'equation':
                return (
                    <div key={id} className="notion-block notion-equation">
                        <code>{block.equation?.expression || ''}</code>
                    </div>
                )

            case 'divider':
                return (
                    <div key={id} className="notion-block notion-divider">
                        <hr />
                    </div>
                )

            case 'to_do':
                return (
                    <div key={id} className="notion-block notion-todo">
                        <label>
                            <input
                                type="checkbox"
                                checked={block.to_do?.checked || false}
                                readOnly
                            />{' '}
                            <span>{renderRichText(block.to_do?.rich_text)}</span>
                        </label>
                        {renderChildren(block)}
                    </div>
                )

            case 'callout':
                return (
                    <div key={id} className="notion-block notion-callout">
                        {renderCalloutIcon(block)}
                        <div className="notion-callout-content">
                            {renderRichText(block.callout?.rich_text)}
                            {renderChildren(block)}
                        </div>
                    </div>
                )

            case 'toggle':
                return (
                    <details key={id} className="notion-block notion-toggle">
                        <summary>{renderRichText(block.toggle?.rich_text)}</summary>
                        {renderChildren(block)}
                    </details>
                )

            case 'table_of_contents': {
                const headings = getHeadingsFromBlocks(allBlocks)

                if (!headings.length) return null

                return (
                    <div key={id} className="notion-block notion-toc">
                        <div className="notion-toc__title">Daftar Isi</div>
                        <ul className="notion-toc__list">
                            {headings.map((heading) => (
                                <li
                                    key={heading.id}
                                    className={`notion-toc__item notion-toc__item--level-${heading.level}`}
                                >
                                    <a href={`#${heading.id}`} className="notion-toc__link">
                                        {heading.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            case 'image': {
                const image = block.image

                const src =
                    image?.type === 'external'
                        ? image.external?.url || ''
                        : image?.type === 'file'
                            ? image.file?.url || ''
                            : ''

                const caption =
                    image?.caption?.map((t: any) => t.plain_text).join('') || ''

                if (!src) {
                    return (
                        <figure key={id} className="notion-block notion-image notion-image--missing">
                            <div className="notion-image__placeholder">
                                Gambar tidak tersedia.
                            </div>
                            {caption ? <figcaption>{caption}</figcaption> : null}
                        </figure>
                    )
                }

                return (
                    <figure key={id} className="notion-block notion-image">
                        <img
                            src={src}
                            alt={caption || 'Notion image'}
                            onClick={() => openImage(src, caption || 'Notion image')}
                            className="notion-image__clickable"
                        />
                        {caption ? <figcaption>{caption}</figcaption> : null}
                        {renderChildren(block)}
                    </figure>
                )
            }

            case 'bookmark': {
                const url = block.bookmark?.url
                const caption =
                    block.bookmark?.caption?.map((t: any) => t.plain_text).join('') || ''

                if (!url) return null

                return (
                    <div key={id} className="notion-block notion-bookmark">
                        <a href={url} target="_blank" rel="noreferrer" className="notion-bookmark-link">
                            <div className="notion-bookmark-url">{url}</div>
                            {caption ? <div className="notion-bookmark-caption">{caption}</div> : null}
                        </a>
                    </div>
                )
            }

            case 'embed': {
                const url = block.embed?.url
                if (!url) return null

                return (
                    <div key={id} className="notion-block notion-embed">
                        <a href={url} target="_blank" rel="noreferrer">
                            {url}
                        </a>
                    </div>
                )
            }

            case 'video': {
                const video = block.video
                const src =
                    video?.type === 'external'
                        ? video.external?.url
                        : video?.type === 'file'
                            ? video.file?.url
                            : ''

                const caption =
                    video?.caption?.map((t: any) => t.plain_text).join('') || ''

                if (!src) return null

                return (
                    <div key={id} className="notion-block notion-video">
                        <video controls src={src} />
                        {caption ? <div className="notion-media-caption">{caption}</div> : null}
                    </div>
                )
            }

            case 'file':
                return renderFileLikeBlock(
                    id,
                    'Download file',
                    block.file,
                    block.file?.caption
                )

            case 'pdf':
                return renderFileLikeBlock(
                    id,
                    'Open PDF',
                    block.pdf,
                    block.pdf?.caption
                )

            case 'child_page':
                return (
                    <div key={id} className="notion-block notion-child-page">
                        <strong>{block.child_page?.title || 'Untitled page'}</strong>
                    </div>
                )

            case 'table':
                return (
                    <div key={id} className="notion-block notion-table-block">
                        {renderTable(block)}
                    </div>
                )

            case 'table_row':
                return null

            default:
                return (
                    <div key={id} className="notion-block notion-unsupported">
                        <em>Unsupported block: {type}</em>
                    </div>
                )
        }
    }

    const elements: React.ReactNode[] = []
    let i = 0

    while (i < blocks.length) {
        const block = blocks[i]

        if (block.type === 'bulleted_list_item') {
            const listItems: Block[] = []
            while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
                listItems.push(blocks[i])
                i++
            }
            elements.push(
                <React.Fragment key={`bulleted-${listItems[0].id}`}>
                    {renderList(listItems, false)}
                </React.Fragment>
            )
            continue
        }

        if (block.type === 'numbered_list_item') {
            const listItems: Block[] = []
            while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
                listItems.push(blocks[i])
                i++
            }
            elements.push(
                <React.Fragment key={`numbered-${listItems[0].id}`}>
                    {renderList(listItems, true)}
                </React.Fragment>
            )
            continue
        }

        elements.push(
            <React.Fragment key={block.id}>
                {renderSingleBlock(block, blocks)}
            </React.Fragment>
        )
        i++
    }

    return (
        <>
            <div className="notion-blocks">{elements}</div>

            {lightboxImage && (
                <div className="notion-lightbox" onClick={closeImage}>
                    <div
                        className="notion-lightbox__content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="notion-lightbox__close"
                            onClick={closeImage}
                            aria-label="Close image preview"
                        >
                            ×
                        </button>
                        <img
                            src={lightboxImage.src}
                            alt={lightboxImage.alt || 'Preview image'}
                            className="notion-lightbox__image"
                        />
                    </div>
                </div>
            )}
        </>
    )
}