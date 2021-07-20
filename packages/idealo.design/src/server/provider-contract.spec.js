import { Verifier } from '@pact-foundation/pact'
import path from 'path'
import { app } from './server'
import { fetchList,
    updateSinglePost,
    deleteSinglePost,
    archiveSinglePost,
    fetchPostsByCategorySlug,
    fetchDistinctCategories,
    fetchAllCategories,
    fetchSinglePost
} from './db'
import '@testing-library/jest-dom/extend-expect';
import {mockedArchivedBlogpost, mockedBlogpost, mockedUpdatedBlogpost} from '../ui/pages/BlogPage/consumer-contract.spec'

jest.mock('./db', () => {
    return { fetchList: jest.fn(),
        updateSinglePost: jest.fn(),
        archiveSinglePost: jest.fn(),
        fetchPostsByCategorySlug: jest.fn(),
        fetchDistinctCategories: jest.fn(),
        fetchAllCategories: jest.fn(),
        fetchSinglePost: jest.fn(),
        deleteSinglePost: jest.fn()
    }
})

const distinctCategories = {
    categorydisplayvalue: "Testing Category",
    categoryslug: "testing-category"
}
const allCategories = {
    categoryslug: "new-category",
    sum : 4
}

describe('Pact Verification', () => {

    const server = app.listen(6666, '0000',() => console.log('server running for api testing') )

    test('should validate the expectations of our consumer', () => {
        fetchList.mockReturnValue([mockedBlogpost, mockedBlogpost, mockedBlogpost])
        updateSinglePost.mockReturnValue(mockedUpdatedBlogpost)
        fetchSinglePost.mockReturnValue([mockedBlogpost])
        fetchPostsByCategorySlug.mockReturnValue(mockedBlogpost)
        archiveSinglePost.mockReturnValue(mockedArchivedBlogpost)
        fetchDistinctCategories.mockReturnValue([distinctCategories,distinctCategories, distinctCategories, distinctCategories])
        fetchAllCategories.mockReturnValue([allCategories,allCategories,allCategories,allCategories])
        deleteSinglePost.mockReturnValue('successfully deleted blogpost')

        const opts = {
            provider: 'BlogTestingProvider',
            providerBaseUrl: 'http://localhost:6666',
            pactUrls: [path.resolve(process.cwd(), 'src/__tests__/pact/blogtestingconsumer-blogtestingprovider.json')],
            publishVerificationResult: true,
            providerVersion: '1.0.0',
            logLevel: 'INFO',
        }

        return new Verifier(opts).verifyProvider().then(output => {
            server.close()
            console.log('pact verification complete !')
            console.log(output)
        }).catch(error => {
            server.close()
            fail(error)
        })
    })
})