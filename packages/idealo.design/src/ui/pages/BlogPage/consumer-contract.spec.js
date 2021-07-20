import {Pact, Matchers} from '@pact-foundation/pact'
import {
    fetchList,
    fetchUserInfo,
    updateSinglePost,
    deleteSinglePost,
    archiveSinglePost,
    fetchPostsByCategorySlug,
    fetchDistinctCategories,
    fetchAllCategories,
    fetchSinglePost
} from './data'
import path from 'path'

const {eachLike, like} = Matchers

const PORT = 5000;

const provider = new Pact({
    consumer: 'BlogTestingConsumer',
    provider: 'BlogTestingProvider',
    port: PORT,
    log: path.resolve(process.cwd(), 'src/__tests__/pact', 'pact.log'),
    dir: path.resolve(process.cwd(), 'src/__tests__/pact'),
    logLevel: 'INFO',
});

export const mockedBlogpost = {
    id: 1,
    title: "Mocked Blogpost",
    categorydisplayvalue: "Test",
    categoryslug: "test",
    slug: "Test",
    date: "2021-05-28T09:04:55.343Z",
    image: "",
    email: null,
    instagram: null,
    twitter: null,
    github: null,
    facebook: null,
    blogpostcontent:
        {
            blocks: [
                {
                    key: "csc33",
                    data: {},
                    text: "This is a dummy post",
                    type: "unstyled",
                    depth: 0,
                    entityRanges: [],
                    inlineStyleRanges: []
                }],
            entityMap: {}
        },
    isarchived: 0
}

export const mockedUpdatedBlogpost = {
    id: 1,
    title: "Updated Mocked Blogpost",
    categorydisplayvalue: "Test",
    categoryslug: "test",
    slug: "updated-mocked-blogpost",
    blogpostcontent:
        {
            blocks: [
                {
                    key: "csc33",
                    data: {},
                    text: "This text was updated",
                    type: "unstyled",
                    depth: 0,
                    entityRanges: [],
                    inlineStyleRanges: []
                }],
            entityMap: {}
        },
}

export const mockedArchivedBlogpost = {
    id: 1,
    title: "Mocked Blogpost",
    categorydisplayvalue: "Test",
    categoryslug: "test",
    slug: "mocked-blogpost",
    date: "2021-05-28T09:04:55.343Z",
    image: "",
    email: null,
    instagram: null,
    twitter: null,
    github: null,
    facebook: null,
    blogpostcontent:
        {
            blocks: [
                {
                    key: "csc33",
                    data: {},
                    text: "This is a dummy post",
                    type: "unstyled",
                    depth: 0,
                    entityRanges: [],
                    inlineStyleRanges: []
                }],
            entityMap: {}
        },
    isarchived: 1
}

describe('all Tests', () => {
    afterAll(() => provider.finalize());
    beforeAll(() => provider.setup());
    afterEach(() => provider.removeInteractions())

    describe('test list', () => {
        test('should return a list of five blogposts', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to list all blogposts',
                withRequest: {
                    method: 'GET',
                    path: '/api/blogposts',
                },
                willRespondWith: {
                    status: 200,
                    body: eachLike(mockedBlogpost, {min: 3})
                }
            })

            const response = await fetchList(provider.mockService.baseUrl);
            expect(response[0].title).toBe('Mocked Blogpost');
            expect(response[0].categoryslug).toBe('test');
            expect(response[0].categorydisplayvalue).toBe('Test');
        });
    })

    describe('When a request to single blogpost is made', () => {
        test('should return a single blogpost', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to single blogpost',
                withRequest: {
                    method: 'GET',
                    path: '/api/blogposts/Test-2-previous-next',
                },
                willRespondWith: {
                    status: 200,
                    body: eachLike(
                        mockedBlogpost
                    )
                }
            })

            const response = await fetchSinglePost({slug: "Test-2-previous-next"}, provider.mockService.baseUrl);
            expect(response.title).toBe('Mocked Blogpost');
            expect(response.categorydisplayvalue).toBe('Test');
            expect(response.categoryslug).toBe('test');
            expect(response.slug).toBe('Test');
            expect(response.date).toBe('2021-05-28T09:04:55.343Z');

            expect(response.blogpostcontent.blocks[0].key).toBe('csc33');
            expect(response.blogpostcontent.blocks[0].text).toBe('This is a dummy post');
            expect(response.blogpostcontent.blocks[0].type).toBe('unstyled');

        });
    });

    describe('test category slug', () => {
        test('should return a list of blogposts with a single category ', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to single category',
                withRequest: {
                    method: 'GET',
                    path: "/api/blogposts"
                },
                willRespondWith: {
                    status: 200,
                    body: eachLike(mockedBlogpost)
                }
            })

            const response = await fetchPostsByCategorySlug({categorySlug: "test"}, provider.mockService.baseUrl);
            expect(response[0].title).toBe('Mocked Blogpost');
            expect(response[0].categorydisplayvalue).toBe('Test');
            expect(response[0].categoryslug).toBe('test');
            expect(response[0].slug).toBe('Test');
            expect(response[0].date).toBe('2021-05-28T09:04:55.343Z');

            expect(response[0].blogpostcontent.blocks[0].key).toBe('csc33');
            expect(response[0].blogpostcontent.blocks[0].text).toBe('This is a dummy post');
            expect(response[0].blogpostcontent.blocks[0].type).toBe('unstyled');
        })
    })

    describe('test to archive a single post', () => {
        test('should return archived blogpost', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to archive a blogpost',
                withRequest: {
                    method: 'PUT',
                    path: '/api/blogposts/archive',
                    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                    body: mockedBlogpost
                },
                willRespondWith: {
                    status: 200,
                    body: like(mockedArchivedBlogpost)
                }
            });
            const response = await archiveSinglePost(mockedBlogpost, provider.mockService.baseUrl);
            expect(response.isarchived).toBe(1);
        });
    })

    describe('test to update a single post', () => {
        test('should return update Blogpost', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to update a blogpost',
                withRequest: {
                    method: 'PUT',
                    path: '/api/blogposts',
                    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                    body: mockedBlogpost
                },
                willRespondWith: {
                    status: 200,
                    body: like(mockedUpdatedBlogpost)
                }
            })
            const response = await updateSinglePost({slug: 'mocked-blogpost', post: mockedBlogpost}, () => {
            }, provider.mockService.baseUrl);
            expect(response.title).toBe('Updated Mocked Blogpost')
            expect(response.slug).toBe('updated-mocked-blogpost')
        })
    })

    describe('When a request to fetch distinct categories is made', () => {
        test('should return categories', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to fetch distinct categories',
                withRequest: {
                    method: 'GET',
                    path: '/api/distinctCategories',
                },
                willRespondWith: {
                    status: 200,
                    body: eachLike(
                        {
                            categorydisplayvalue: like("Testing Category"),
                            categoryslug: like("testing-category")
                        },
                        {min: 4}
                    )
                }
            })

            const response = await fetchDistinctCategories(provider.mockService.baseUrl);
            expect(response[0].categorydisplayvalue).toBe('Testing Category');
            expect(response[0].categoryslug).toBe('testing-category');
        })
    })

    describe('When a request to list all categories is made', () => {
        test('should return categories', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to list all categories',
                withRequest: {
                    method: 'GET',
                    path: '/api/categories',
                },
                willRespondWith: {
                    status: 200,
                    body: eachLike(
                        {
                            categoryslug: like("new-category"),
                            sum: 4

                        },
                        {min: 4}
                    )
                }
            })

            const response = await fetchAllCategories(provider.mockService.baseUrl);
            expect(response[0].categoryslug).toBe('new-category');
            expect(response[0].sum).toBe(4);
        })
    })

    describe('test user login', () => {
        test('should return user data', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to authenticate',
                withRequest: {
                    method: 'GET',
                    path: '/api/me',
                },
                willRespondWith: {
                    status: 200,
                    body: like(
                        {
                            status: like("LOGGED_IN"),
                            user: null
                        }
                    )
                }
            })

            const response = await fetchUserInfo(provider.mockService.baseUrl);
            expect(response.status).toBe('LOGGED_IN');
        });
    })

    describe('test to delete a single post', () => {
        test('should return the deleted blogpost', async () => {
            await provider.addInteraction({
                uponReceiving: 'a request to delete a blogpost',
                withRequest: {
                    method: 'PUT',
                    path: '/api/blogposts/delete',
                    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                    body: mockedBlogpost,
                },
                willRespondWith: {
                    status: 200,
                    body: 'successfully deleted blogpost'
                }
            });
            const response = await deleteSinglePost(mockedBlogpost, provider.mockService.baseUrl);
            expect(response).toBe('successfully deleted blogpost')
        });
    })
});