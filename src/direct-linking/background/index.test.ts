import expect from 'expect'

import * as DATA from './index.test.data'
import {
    backgroundIntegrationTestSuite,
    backgroundIntegrationTest,
    BackgroundIntegrationTestSetup,
    IntegrationTestStep,
    BackgroundIntegrationTestContext,
} from 'src/tests/integration-tests'
import { createPageStep, searchModule } from 'src/tests/common-fixtures'
import { StorageCollectionDiff } from 'src/tests/storage-change-detector'

const directLinking = (setup: BackgroundIntegrationTestSetup) =>
    setup.backgroundModules.directLinking
const customLists = (setup: BackgroundIntegrationTestSetup) =>
    setup.backgroundModules.customLists

let annotUrl!: string

const createAnnotationStep: IntegrationTestStep<
    BackgroundIntegrationTestContext
> = {
    execute: async ({ setup }) => {
        annotUrl = await directLinking(setup).createAnnotation(
            { tab: {} as any },
            DATA.ANNOT_1 as any,
            { skipPageIndexing: true },
        )
    },
    expectedStorageChanges: {
        annotations: (): StorageCollectionDiff => ({
            [annotUrl]: {
                type: 'create',
                object: {
                    url: annotUrl,
                    pageUrl: DATA.ANNOT_1.url,
                    pageTitle: DATA.ANNOT_1.title,
                    comment: DATA.ANNOT_1.comment,
                    _comment_terms: ['test', 'comment'],
                    _pageTitle_terms: ['test'],
                    body: undefined,
                    selector: undefined,
                    createdWhen: expect.any(Date),
                    lastEdited: expect.any(Date),
                },
            },
        }),
    },
}

export const INTEGRATION_TESTS = backgroundIntegrationTestSuite(
    'Direct links',
    [
        backgroundIntegrationTest(
            'should create a page, create a highlight, then retrieve it via a search',
            () => {
                return {
                    steps: [
                        createPageStep,
                        {
                            execute: async ({ setup }) => {
                                annotUrl = await directLinking(
                                    setup,
                                ).createAnnotation(
                                    { tab: {} as any },
                                    DATA.HIGHLIGHT_1 as any,
                                    { skipPageIndexing: true },
                                )
                            },
                            expectedStorageChanges: {
                                annotations: (): StorageCollectionDiff => ({
                                    [annotUrl]: {
                                        type: 'create',
                                        object: {
                                            url: annotUrl,
                                            pageUrl: DATA.HIGHLIGHT_1.url,
                                            pageTitle: DATA.HIGHLIGHT_1.title,
                                            _pageTitle_terms: ['test'],
                                            body: DATA.HIGHLIGHT_1.body,
                                            _body_terms: ['test', 'body'],
                                            comment: undefined,
                                            selector: undefined,
                                            createdWhen: expect.any(Date),
                                            lastEdited: expect.any(Date),
                                        },
                                    },
                                }),
                            },
                            postCheck: async ({ setup }) => {
                                expect(
                                    await searchModule(setup).searchAnnotations(
                                        {
                                            query: 'body',
                                        },
                                    ),
                                ).toEqual({
                                    docs: [
                                        {
                                            annotations: [
                                                {
                                                    url: annotUrl,
                                                    _body_terms: [
                                                        'test',
                                                        'body',
                                                    ],
                                                    _pageTitle_terms: ['test'],
                                                    body: 'test body',
                                                    comment: undefined,
                                                    createdWhen: expect.any(
                                                        Date,
                                                    ),
                                                    hasBookmark: false,
                                                    lastEdited: expect.any(
                                                        Date,
                                                    ),
                                                    pageTitle: 'test',
                                                    pageUrl: 'lorem.com',
                                                    selector: undefined,
                                                    tags: [],
                                                },
                                            ],
                                            annotsCount: 1,
                                            displayTime: DATA.VISIT_1,
                                            favIcon: undefined,
                                            hasBookmark: false,
                                            pageId: 'lorem.com',
                                            screenshot: undefined,
                                            tags: [],
                                            title: undefined,
                                            url: 'lorem.com',
                                        },
                                    ],
                                    resultsExhausted: true,
                                    totalCount: null,
                                })
                            },
                        },
                    ],
                }
            },
        ),
        backgroundIntegrationTest(
            'should create a page, create an annotation, edit its note, then retrieve it via a search',
            () => {
                return {
                    steps: [
                        createPageStep,
                        createAnnotationStep,
                        {
                            execute: async ({ setup }) => {
                                await directLinking(setup).editAnnotation(
                                    {},
                                    annotUrl,
                                    'updated comment',
                                )
                            },
                            expectedStorageChanges: {
                                annotations: (): StorageCollectionDiff => ({
                                    [annotUrl]: {
                                        type: 'modify',
                                        updates: {
                                            comment: 'updated comment',
                                            _comment_terms: expect.any(Object),
                                            lastEdited: expect.any(Date),
                                        },
                                    },
                                }),
                            },
                            postCheck: async ({ setup }) => {
                                expect(
                                    await searchModule(setup).searchAnnotations(
                                        {
                                            query: 'comment',
                                        },
                                    ),
                                ).toEqual({
                                    docs: [
                                        {
                                            annotations: [
                                                {
                                                    url: annotUrl,
                                                    _comment_terms: [
                                                        'updated',
                                                        'comment',
                                                    ],
                                                    _pageTitle_terms: ['test'],
                                                    body: undefined,
                                                    comment: 'updated comment',
                                                    createdWhen: expect.any(
                                                        Date,
                                                    ),
                                                    hasBookmark: false,
                                                    lastEdited: expect.any(
                                                        Date,
                                                    ),
                                                    pageTitle: 'test',
                                                    pageUrl: 'lorem.com',
                                                    selector: undefined,
                                                    tags: [],
                                                },
                                            ],
                                            annotsCount: 1,
                                            displayTime: DATA.VISIT_1,
                                            favIcon: undefined,
                                            hasBookmark: false,
                                            pageId: 'lorem.com',
                                            screenshot: undefined,
                                            tags: [],
                                            title: undefined,
                                            url: 'lorem.com',
                                        },
                                    ],
                                    resultsExhausted: true,
                                    totalCount: null,
                                })
                            },
                        },
                    ],
                }
            },
        ),
        backgroundIntegrationTest(
            'should create a page, create an annotation, tag it, then retrieve it via a filtered search',
            () => {
                return {
                    steps: [
                        createPageStep,
                        createAnnotationStep,
                        {
                            execute: async ({ setup }) => {
                                await directLinking(setup).addTagForAnnotation(
                                    {},
                                    { tag: DATA.TAG_1, url: annotUrl },
                                )
                            },
                            expectedStorageChanges: {
                                tags: (): StorageCollectionDiff => ({
                                    [`["${DATA.TAG_1}","${annotUrl}"]`]: {
                                        type: 'create',
                                        object: {
                                            url: annotUrl,
                                            name: DATA.TAG_1,
                                        },
                                    },
                                }),
                            },
                            postCheck: async ({ setup }) => {
                                const searchResults = await searchModule(
                                    setup,
                                ).searchAnnotations({
                                    tagsInc: [DATA.TAG_1],
                                })

                                const firstDay = Object.keys(
                                    searchResults['annotsByDay'],
                                )[0]
                                expect(searchResults).toEqual({
                                    annotsByDay: {
                                        [firstDay]: {
                                            ['lorem.com']: [
                                                {
                                                    url: annotUrl,
                                                    _comment_terms: [
                                                        'test',
                                                        'comment',
                                                    ],
                                                    _pageTitle_terms: ['test'],
                                                    body: undefined,
                                                    comment: 'test comment',
                                                    createdWhen: expect.any(
                                                        Date,
                                                    ),
                                                    hasBookmark: false,
                                                    lastEdited: expect.any(
                                                        Date,
                                                    ),
                                                    pageTitle: 'test',
                                                    pageUrl: 'lorem.com',
                                                    selector: undefined,
                                                    tags: [DATA.TAG_1],
                                                },
                                            ],
                                        },
                                    },
                                    docs: [
                                        {
                                            annotations: [],
                                            annotsCount: 1,
                                            displayTime: DATA.VISIT_1,
                                            favIcon: undefined,
                                            hasBookmark: false,
                                            pageId: 'lorem.com',
                                            screenshot: undefined,
                                            tags: [],
                                            title: undefined,
                                            url: 'lorem.com',
                                        },
                                    ],
                                    isAnnotsSearch: true,
                                    resultsExhausted: true,
                                    totalCount: null,
                                })
                            },
                        },
                    ],
                }
            },
        ),
        backgroundIntegrationTest(
            'should create a page, create an annotation, bookmark it, then retrieve it via a filtered search',
            () => {
                return {
                    steps: [
                        createPageStep,
                        createAnnotationStep,
                        {
                            execute: async ({ setup }) => {
                                await directLinking(setup).toggleAnnotBookmark(
                                    {} as any,
                                    { url: annotUrl },
                                )
                            },
                            expectedStorageChanges: {
                                annotBookmarks: (): StorageCollectionDiff => ({
                                    [annotUrl]: {
                                        type: 'create',
                                        object: {
                                            url: annotUrl,
                                            createdAt: expect.any(Date),
                                        },
                                    },
                                }),
                            },
                            postCheck: async ({ setup }) => {
                                const searchResults = await searchModule(
                                    setup,
                                ).searchAnnotations({
                                    bookmarksOnly: true,
                                })

                                const firstDay = Object.keys(
                                    searchResults['annotsByDay'],
                                )[0]
                                expect(searchResults).toEqual({
                                    annotsByDay: {
                                        [firstDay]: {
                                            'lorem.com': [
                                                {
                                                    url: annotUrl,
                                                    _comment_terms: [
                                                        'test',
                                                        'comment',
                                                    ],
                                                    _pageTitle_terms: ['test'],
                                                    body: undefined,
                                                    comment: 'test comment',
                                                    createdWhen: expect.any(
                                                        Date,
                                                    ),
                                                    hasBookmark: true,
                                                    lastEdited: expect.any(
                                                        Date,
                                                    ),
                                                    pageTitle: 'test',
                                                    pageUrl: 'lorem.com',
                                                    selector: undefined,
                                                    tags: [],
                                                },
                                            ],
                                        },
                                    },
                                    docs: [
                                        {
                                            annotations: [],
                                            annotsCount: 1,
                                            displayTime: DATA.VISIT_1,
                                            favIcon: undefined,
                                            hasBookmark: false,
                                            pageId: 'lorem.com',
                                            screenshot: undefined,
                                            tags: [],
                                            title: undefined,
                                            url: 'lorem.com',
                                        },
                                    ],
                                    isAnnotsSearch: true,
                                    resultsExhausted: true,
                                    totalCount: null,
                                })
                            },
                        },
                    ],
                }
            },
        ),
        backgroundIntegrationTest(
            'should create a page, create an annotation, tag it, bookmark it, then delete it - deleting all assoc. data',
            () => {
                let listId: number
                return {
                    steps: [
                        createPageStep,
                        createAnnotationStep,
                        {
                            execute: async ({ setup }) => {
                                await directLinking(setup).toggleAnnotBookmark(
                                    {} as any,
                                    { url: annotUrl },
                                )
                                await directLinking(setup).addTagForAnnotation(
                                    {},
                                    { tag: DATA.TAG_1, url: annotUrl },
                                )
                                listId = await customLists(
                                    setup,
                                ).createCustomList({ name: 'test' })
                                await directLinking(setup).insertAnnotToList(
                                    {} as any,
                                    { listId, url: annotUrl },
                                )
                            },
                            expectedStorageChanges: {
                                annotBookmarks: (): StorageCollectionDiff => ({
                                    [annotUrl]: {
                                        type: 'create',
                                        object: {
                                            url: annotUrl,
                                            createdAt: expect.any(Date),
                                        },
                                    },
                                }),
                                tags: (): StorageCollectionDiff => ({
                                    [`["${DATA.TAG_1}","${annotUrl}"]`]: {
                                        type: 'create',
                                        object: {
                                            url: annotUrl,
                                            name: DATA.TAG_1,
                                        },
                                    },
                                }),
                            },
                        },
                        {
                            execute: async ({ setup }) => {
                                await directLinking(setup).deleteAnnotation(
                                    {},
                                    annotUrl,
                                )
                            },
                            expectedStorageChanges: {
                                annotations: (): StorageCollectionDiff => ({
                                    [annotUrl]: {
                                        type: 'delete',
                                    },
                                }),
                                annotBookmarks: (): StorageCollectionDiff => ({
                                    [annotUrl]: {
                                        type: 'delete',
                                    },
                                }),
                                tags: (): StorageCollectionDiff => ({
                                    [`["${DATA.TAG_1}","${annotUrl}"]`]: {
                                        type: 'delete',
                                    },
                                }),
                                annotListEntries: (): StorageCollectionDiff => ({
                                    [`["${listId}","${annotUrl}"]`]: {
                                        type: 'delete',
                                    },
                                }),
                            },
                            postCheck: async ({ setup }) => {},
                        },
                    ],
                }
            },
        ),
    ],
)